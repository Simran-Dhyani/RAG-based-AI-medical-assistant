
import express from "express";
import cors from "cors";
import faiss from "faiss-node";
import { HfInference } from "@huggingface/inference";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const { IndexFlatL2 } = faiss;
const app = express();
app.use(cors());
app.use(express.json());

const DIMENSION = 1024;        
const TOP_K = 5;    
const DISTANCE_CUTOFF = 0.65; 

const chatSessions = {};

const hf = new HfInference(process.env.HF_TOKEN);

const CHAT_MODEL = "Qwen/Qwen2.5-7B-Instruct";

//meta-llama/Llama-3.1-8B-Instruct
const EMBED_MODEL = "BAAI/bge-large-en-v1.5";


async function chatWithLLM(systemPrompt, userPrompt) {
  const result = await hf.chatCompletion({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userPrompt   },
    ],
    max_tokens: 1024,
  });
  return result.choices[0].message.content.trim();
}


async function isMedicalQuery(userQuestion) {
  const system = `You are a strict medical topic classifier.
Determine if the user question is related to medicine, health, diseases, symptoms, medications, first aid, nutrition for medical purposes, or emergency care.
Reply with ONLY one word: "YES" or "NO". Nothing else.`;

  const answer = await chatWithLLM(system, userQuestion);
  return answer.toUpperCase().startsWith("YES");
}



async function getQueryEmbedding(text) {
  const result = await hf.featureExtraction({
    model: EMBED_MODEL,
    inputs: text,
  });

  return Array.isArray(result[0]) ? result[0] : result;
}



let faissIndex, metadata;
try {
  faissIndex = IndexFlatL2.read("medical.index");
  metadata   = JSON.parse(fs.readFileSync("metadata.json", "utf-8"));
} catch (err) {
  console.error("Error: Could not load index");
  console.error(err.message);
  process.exit(1);
}

function searchFAISS(queryVector) {
  const result  = faissIndex.search(queryVector, TOP_K);
  const matches = [];
  for (let i = 0; i < result.labels.length; i++) {
    const id       = result.labels[i];
    const distance = result.distances[i];
    if (id === -1) continue;

    const metaItem = metadata.find((m) => m.id === id);
    if (metaItem) {
      matches.push({ text: metaItem.text, source: metaItem.source, distance });
    }
  }
  return matches;
}


async function askWithContext(userQuestion, contextChunks) {
  const contextText = contextChunks
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
    .join("\n\n");

  const system = `
You are a Medical AI Assistant.

Answer ONLY from the provided medical context.

If the answer is not present in the context, say:
"I could not find this information in the provided medical documents."

Rules:
- Use bullet points.
- Be factual.
- Do not invent information.
- Do not use outside knowledge.
- Cite the source numbers when possible.
- End with the disclaimer.
`;

  const userPrompt = `Trusted Medical Context:\n${contextText}\n\nUser Question: ${userQuestion}`;
  const answer     = await chatWithLLM(system, userPrompt);

  return {
    answer,
    source:    "knowledge_base",
    citations: contextChunks.map((c) => c.source.replace(".pdf", "")),
  };
}


async function askGeneralFallback(userQuestion) {
  const system = `You are a helpful Medical Assistant AI. The user has asked a medical question not covered in your local database.
Answer using your general medical knowledge. Be helpful but cautious.
Rules:
- Be concise and accurate.
- Use bullet points for clarity.
- Always end with: "⚠️ Disclaimer: This is general information only. Always consult a qualified doctor for diagnosis and treatment."`;

  const answer = await chatWithLLM(system, userQuestion);
  return { answer, source: "qwen_general", citations: [] };
}



app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage, sessionId = "default-session" } = req.body;

    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }

    console.log(`\nQuery received: "${userMessage}"`);

    
    const medical = await isMedicalQuery(userMessage);
    if (!medical) {
      return res.json({
        reply: "🏥 I'm a Medical AI Assistant and can only answer health-related questions.\n\nPlease ask me about symptoms, diseases, medicines, first aid, or emergencies.",
        source: "blocked",
        citations: [],
      });
    }

    
    if (!chatSessions[sessionId]) chatSessions[sessionId] = [];

    
    let contextualQuery = userMessage;
    if (chatSessions[sessionId].length > 0) {
      const historyStr = chatSessions[sessionId]
        .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
        .join("\n");

      const compressionSystem = `
You are a RAG query rewriter.

Given chat history and a follow-up question:

- Preserve medical details.
- Resolve pronouns such as "it", "that", "those medicines".
- Produce a standalone search query.
- Return only the rewritten query.
`;

      const compressionUser = `Chat History:\n${historyStr}\n\nFollow-up Question: ${userMessage}`;
      contextualQuery       = await chatWithLLM(compressionSystem, compressionUser);
      console.log(`🔄 Query condensed: "${userMessage}" → "${contextualQuery}"`);
    }

    
    const queryVector  = await getQueryEmbedding(contextualQuery);
    const matches      = searchFAISS(queryVector);
    const hasGoodMatch = matches.length > 0 && matches[0].distance < DISTANCE_CUTOFF;
    
console.log("FAISS distances:", matches.map(m => `${m.source} → ${m.distance.toFixed(4)}`));
    let response;
    if (hasGoodMatch) {
      console.log(`✅ Answering from knowledge base (${[...new Set(matches.map((m) => m.source))].join(", ")})`);
      response = await askWithContext(contextualQuery, matches);
    } else {
      console.log("⚠️  No strong PDF match. Falling back to  general knowledge.");
      response = await askGeneralFallback(contextualQuery);
    }

    
    chatSessions[sessionId].push({ role: "user",      text: userMessage     });
    chatSessions[sessionId].push({ role: "assistant", text: response.answer });
    if (chatSessions[sessionId].length > 10) chatSessions[sessionId].splice(0, 2);

    res.json({
      reply:     response.answer,
      source:    response.source,
      citations: response.citations,
    });

  } catch (err) {
    console.error("Server error:", err.message);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});



app.get("/api/health", (req, res) => {
  res.json({ status: "ok", vectors: metadata.length });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`\n✓ Medical RAG server running at http://localhost:${PORT}`);
  console.log("  Send POST requests to /api/chat with { userMessage: '...' }");
});