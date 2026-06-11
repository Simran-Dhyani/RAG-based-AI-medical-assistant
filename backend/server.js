
import express from "express";
import cors from "cors";
import faiss from "faiss-node";   //for vector search
import { GoogleGenerativeAI } from "@google/generative-ai";   // for embedding and chat responses
import fs from "fs";       //loads metadata.json
import dotenv from "dotenv";

dotenv.config();
const { IndexFlatL2 } = faiss;
const app = express();            //creates server
app.use(cors());
app.use(express.json());            //json to js obj


const DIMENSION = 3072;          // must match ingest.js 
const TOP_K = 3;                  // number of closest chunks to retrieve
const DISTANCE_CUTOFF = 0.7;            //  below this will be good match and above will fallback to Gemini


const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embedModel = ai.getGenerativeModel({ model: "gemini-embedding-001" });        //model used for embedding
const chatModel = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });       // model used for answers

// function for filtering and answering only medical related queries
async function isMedicalQuery(userQuestion) {
  const prompt = `
You are a strict medical topic classifier.
Determine if the following user question is related to medicine, health, diseases, symptoms, medications, first aid, nutrition for medical purposes, or emergency care.
Reply with ONLY one word: "YES" or "NO". Nothing else.
Question: "${userQuestion}"
`;
  const result = await chatModel.generateContent(prompt);
  const answer = result.response.text().trim().toUpperCase();
  return answer === "YES";         // return true if gemini answers yes otherwise returns false
}


let faissIndex, metadata;
try {
  faissIndex = IndexFlatL2.read("medical.index");         //loads vectors from disk. when server starts it is loaded once and kept in RAM
  metadata = JSON.parse(fs.readFileSync("metadata.json", "utf-8"));  //reads metadata  converted to js array from json
  
} catch (err) {
  console.error(
    "Error : Could not load index",
  );
  console.error(err.message);
  process.exit(1);
}


async function getQueryEmbedding(text) {
  const result = await embedModel.embedContent({
    content: { parts: [{ text }] },
    taskType: "RETRIEVAL_QUERY",       
  });
  return result.embedding.values;
}


function searchFAISS(queryVector) {
  const result = faissIndex.search(queryVector, TOP_K);
  const matches = [];
  for (let i = 0; i < result.labels.length; i++) {
    const id = result.labels[i];
    const distance = result.distances[i];
    if (id === -1) continue; // FAISS returns -1 if fewer results than k

    const metaItem = metadata.find((m) => m.id === id);      // retrives actual text
    if (metaItem) {
      matches.push({
        text: metaItem.text,
        source: metaItem.source,
        distance,               // Lower the distance, more similar
      });
    }
  }
  return matches;
}


async function askWithContext(userQuestion, contextChunks) {
  const contextText = contextChunks
    .map((c, i) => `[Source ${i + 1}: ${c.source}]\n${c.text}`)
    .join("\n\n");

  const prompt = `
You are a helpful Medical Assistant AI. Answer the user's question using ONLY the trusted medical context provided below.
Rules:
- Base your answer strictly on the provided context.
- Be concise and clear. Use bullet points for symptoms/medicines/steps.
- Always end your response with: " Disclaimer: This information is for educational purposes only. Always consult a qualified doctor for medical advice."
- If asked about an emergency, lead with the emergency steps first.
Trusted Medical Context:
${contextText}
User Question: ${userQuestion}
`;

  const result = await chatModel.generateContent(prompt);
  return {
    answer: result.response.text(),
    source: "knowledge_base",                   // Answered from  PDFs
    citations: contextChunks.map((c) => c.source.replace(".pdf", "")),
  };
}
//when knowledge base is not having the asked information
async function askGeminiFallback(userQuestion) {
  const prompt = `
You are a helpful Medical Assistant AI. The user has asked a medical question that is not covered in your specialized local database.
Answer using your general medical knowledge. Be helpful but cautious.
Rules:
- Be concise and accurate.
- Use bullet points for clarity.
- Always end with: " Disclaimer: This is general information only. Always consult a qualified doctor for diagnosis and treatment."

User Question: ${userQuestion}
`;

  const result = await chatModel.generateContent(prompt);
  return {
    answer: result.response.text(),
    source: "gemini_general",          // Answered from Gemini's general knowledge
    citations: [],
  };
}

// endpoint that frontend calls
app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage || !userMessage.trim()) {
      return res.status(400).json({ error: "Please provide a question." });
    }
  
    console.log(`\nQuery: "${userMessage}"`);


    const medical = await isMedicalQuery(userMessage);
    if (!medical) {
      return res.json({
        reply: " I'm a Medical AI Assistant and can only answer health-related questions.\n\nPlease ask me about symptoms, diseases, medicines, first aid, or emergencies.",
        source: "blocked",
        citations: [],
      });
    }
    
       const queryVector = await getQueryEmbedding(userMessage);

    
    const matches = searchFAISS(queryVector);
    

    //  Priority based  decision
    
    const hasgoodMatch = matches.length > 0 && matches[0].distance < DISTANCE_CUTOFF;
    let response;
    if (hasgoodMatch) {
      console.log(
        `   Answering from PDF knowledge base (sources: ${[...new Set(matches.map((m) => m.source))].join(", ")})`,
      );
      response = await askWithContext(userMessage, matches);
    } else {
      console.log(
        "   No strong PDF match found. Falling back to Gemini general knowledge.",
      );
      response = await askGeminiFallback(userMessage);
    }

    res.json({
      reply: response.answer,
      source: response.source, // "knowledge_base" or "gemini_general"
      citations: response.citations, // Array of PDF names used
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
