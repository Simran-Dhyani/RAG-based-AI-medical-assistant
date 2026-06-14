import express from "express";
import cors from "cors";
// for similarity search
import faiss from "faiss-node";
import { HfInference } from "@huggingface/inference";
// reads medical index and metadata
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();
//IndexFlatIP means Inner Product similarity used for cosine similarity after normalization
const { IndexFlatIP } = faiss;
// starts server
const app = express();
app.use(cors());
// allows server to read json req body
app.use(express.json());

const DIMENSION = 1024;
//number of closest chunks to retrieve
const TOP_K = 3;
//if score is < 0.65 fallback to general llm knowledge
const COSINE_THRESHOLD = 0.65;

//for storing chat memory per session
const chatSessions = {};

const hf = new HfInference(process.env.HF_TOKEN);
// model for query answering
const CHAT_MODEL = "Qwen/Qwen2.5-7B-Instruct";

//model for embedding
const EMBED_MODEL = "BAAI/bge-large-en-v1.5";

// converts embeddings into unit vectors
function normalize(vector) {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  return vector.map(val => val / magnitude);
}

// function to call llm
async function chatWithLLM(systemPrompt, userPrompt) {
  const result = await hf.chatCompletion({
    model: CHAT_MODEL,
    //conversation format
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    //max limit of how long the answer should be
    max_tokens: 150,
  });
  return result.choices[0].message.content.trim();
}

//function for filtering and answering only medical related query
async function isMedicalQuery(userQuestion) {
  const system = `You are a strict medical topic classifier.
Determine if the user question is related to medicine, health, diseases, symptoms, medications, first aid, nutrition for medical purposes, or emergency care.
Reply with ONLY one word: "YES" or "NO". Nothing else.`;

  const answer = await chatWithLLM(system, userQuestion);
  return answer.toUpperCase().startsWith("YES");
}

// embedding function to convert user query to vector
async function getQueryEmbedding(text) {
  const result = await hf.featureExtraction({
    model: EMBED_MODEL,
    inputs: text,
  });

  return Array.isArray(result[0]) ? result[0] : result;
}

let faissIndex, metadata;
try {
  // loads saved index stored in FAISS db
  faissIndex = IndexFlatIP.read("medical.index");
  // loads  text chunk
  metadata = JSON.parse(fs.readFileSync("metadata.json", "utf-8"));
} catch (err) {
  console.error("Error: Could not load index");
  console.error(err.message);
  //stops server if db not loaded
  process.exit(1);
}

// function for similarity search
function searchFAISS(queryVector) {
  // find out k nearest vectors
  const result = faissIndex.search(queryVector, TOP_K);
  const matches = [];
  for (let i = 0; i < result.labels.length; i++) {
    //stores vector ID
    const id = result.labels[i];
    //stores
    const score = result.distances[i];
    if (id === -1) continue;

    //matches vector id with original text of chunk
    const metaItem = metadata.find((m) => m.id === id);
    if (metaItem) {
      matches.push({ text: metaItem.text, source: metaItem.source,score });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches;
}



// function for retrieving answer from llm
async function askWithContext(userQuestion, contextChunks) {
  //takes all matched chunks
  const contextText = contextChunks
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
    .join("\n\n");

  const system = `
    You are a Medical AI Assistant.

    Answer ONLY from the provided medical context.

    Rules:
   - Give a direct answer first.
   - Maximum 5 sentences.
   - use bullet points .
   - Do not explain beyond what is in the context.
   - Do not repeat information.
   - If the answer is not present in the context, reply exactly:
   "I could not find this information in the provided medical documents."
   `;

  const userPrompt = `Trusted Medical Context:\n${contextText}\n\nUser Question: ${userQuestion}`;
  const answer = await chatWithLLM(system, userPrompt);

  return {
    answer,
    source: "knowledge_base",
    citations:[
  ...new Set(
    contextChunks.map((c) =>
      c.source.replace(".pdf", "")
    )
  )
],
  };
}

// function for fallback
async function askGeneralFallback(userQuestion) {
  const system = `
You are a helpful Medical Assistant AI.

Answer the user's question directly.

Rules:
- Maximum 5 sentences.
- Be concise and accurate.
- use bullet points.
- No introductions.
- No conclusions.
- End with:
"Disclaimer: This is general information only."
`;
  const answer = await chatWithLLM(system, userQuestion);
  return { answer, source: "qwen_general", citations: [] };
}

app.post("/api/chat", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { userMessage, sessionId = "default-session" } = req.body;

    if (!userMessage || !userMessage.trim()) {
      res.write(
        `data: ${JSON.stringify({ type: "meta", source: "error", citations: [] })}\n\n`,
      );
      res.write(
        `data: ${JSON.stringify({ type: "token", token: "Please provide a question." })}\n\n`,
      );
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    }

    const medical = await isMedicalQuery(userMessage);
    if (!medical) {
      
      const blockedMsg =
        "I'm a Medical AI Assistant and can only answer health-related questions.\n\nPlease ask me about symptoms, diseases, medicines, first aid, or emergencies.";
      res.write(
        `data: ${JSON.stringify({ type: "meta", source: "blocked", citations: [] })}\n\n`,
      );
      res.write(
        `data: ${JSON.stringify({ type: "token", token: blockedMsg })}\n\n`,
      );
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    }

    if (!chatSessions[sessionId]) chatSessions[sessionId] = [];


    // prompt given to llm to form a new query including the user question and previous context
    let contextualQuery = userMessage;
    if (chatSessions[sessionId].length > 0) {
      const historyStr = chatSessions[sessionId]
        .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
        .join("\n");
      const compressionSystem = `
You are a RAG query rewriter.

Rewrite the follow-up question into a short standalone search query.

Rules:
- Preserve medical details.
- Resolve pronouns.
- Maximum 20 words.
- Return only the query.
`;
      const compressionUser = `Chat History:\n${historyStr}\n\nFollow-up Question: ${userMessage}`;
      contextualQuery = await chatWithLLM(compressionSystem, compressionUser);
    }

    const queryVector = normalize(
    await getQueryEmbedding(contextualQuery)
    );

   const matches = searchFAISS(queryVector);

   const hasGoodMatch =
  matches.length > 0 &&
  matches[0].score > COSINE_THRESHOLD;

    let response;
    if (hasGoodMatch) {
      console.log(
        `Answering from knowledge base (${[...new Set(matches.map((m) => m.source))].join(", ")})`,
      );
      response = await askWithContext(contextualQuery, matches);
    } else {
      console.log("No strong PDF match. Falling back to general knowledge.");
      response = await askGeneralFallback(contextualQuery);
    }

    chatSessions[sessionId].push({ role: "user", text: userMessage });
    chatSessions[sessionId].push({ role: "assistant", text: response.answer });
    if (chatSessions[sessionId].length > 10)
      chatSessions[sessionId].splice(0, 2);

    
    res.write(
      `data: ${JSON.stringify({ type: "meta", source: response.source, citations: response.citations })}\n\n`,
    );

    // streaming response word by word
    const words = response.answer.split(" ");
    for (const word of words) {
      res.write(
        `data: ${JSON.stringify({ type: "token", token: word + " " })}\n\n`,
      );
      await new Promise((r) => setTimeout(r, 30));
    }
    // end stream
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Server error:", err.message);
    res.write(
      `data: ${JSON.stringify({ type: "token", token: "Something went wrong. Please try again." })}\n\n`,
    );
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", vectors: metadata.length });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Medical RAG server running at http://localhost:${PORT}`);
  console.log("  Send POST requests to /api/chat with { userMessage: '...' }");
});
