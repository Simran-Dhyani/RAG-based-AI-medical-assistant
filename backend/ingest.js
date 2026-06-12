
import { HfInference } from "@huggingface/inference";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import faiss from "faiss-node";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse";
import "dotenv/config";

const { IndexFlatL2 } = faiss;

const hf = new HfInference(process.env.HF_TOKEN);
const EMBED_MODEL = "BAAI/bge-large-en-v1.5";

const PDF_FOLDER   = "../pdfs";
const INDEX_FILE   = "medical.index";
const META_FILE    = "metadata.json";
const DIMENSION    = 1024;          
const CHUNK_SIZE    = 800;   
const CHUNK_OVERLAP = 150;   

function cleanText(raw) {
  return raw
    .replace(/\f/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}



async function getEmbedding(text) {
  const result = await hf.featureExtraction({
    model: EMBED_MODEL,
    inputs: text,
  });
  
  const vector = Array.isArray(result[0]) ? result[0] : result;

  
  if (vector.length !== DIMENSION) {
    throw new Error(`Dimension mismatch: expected ${DIMENSION}, got ${vector.length}`);
  }
  return vector;
}


async function runIngestion() {
  console.log(" Medical RAG Ingestion Pipeline \n");

  
  const pdfFiles = fs.readdirSync(PDF_FOLDER).filter((f) => f.endsWith(".pdf"));
  if (pdfFiles.length === 0) {
    console.error("No PDF files found in", PDF_FOLDER);
    process.exit(1);
  }
  console.log(`Found ${pdfFiles.length} PDF(s): ${pdfFiles.join(", ")}\n`);

  
  const allDocs = [];
  for (const filename of pdfFiles) {
    const filepath = path.join(PDF_FOLDER, filename);
    const buffer   = fs.readFileSync(filepath);
    const parsed   = await pdfParse(buffer);
    const cleaned  = cleanText(parsed.text);
    allDocs.push({ text: cleaned, source: filename });
    console.log(`✔ Parsed: ${filename}`);
  }

  
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allChunks = [];
  for (const doc of allDocs) {
    const chunks = await splitter.createDocuments([doc.text]);
    for (const chunk of chunks) {
      if (chunk.pageContent.trim().length > 20) {
        allChunks.push({ text: chunk.pageContent.trim(), source: doc.source });
      }
    }
  }
  console.log(`\nTotal chunks to embed: ${allChunks.length}`);

  
  console.log("Generating embeddings (this may take a few minutes)...\n");

  const vectors  = [];
  const metadata = [];
  let vectorIndex = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    try {
      const vector = await getEmbedding(chunk.text);
      vectors.push(vector);
      metadata.push({ id: vectorIndex, text: chunk.text, source: chunk.source });
      vectorIndex++;
      process.stdout.write(`\r  Processing chunk ${i + 1}/${allChunks.length}...`);

      
      await new Promise((res) => setTimeout(res, 1000));

    } catch (err) {
      console.error(`\n  Skipping chunk ${i} — ${err.message}`);
    }
  }
  console.log(`\n\nEmbeddings generated: ${vectors.length}`);

  
  const index = new IndexFlatL2(DIMENSION);
  index.add(vectors.flat());
  index.write(INDEX_FILE);

  fs.writeFileSync(META_FILE, JSON.stringify(metadata, null, 2));

  console.log(` FAISS index saved:  ${INDEX_FILE}`);
  console.log(` Metadata saved:     ${META_FILE}`);
  console.log(`\n Ingestion complete! ${vectors.length} vectors indexed.`);
}

runIngestion().catch(console.error);