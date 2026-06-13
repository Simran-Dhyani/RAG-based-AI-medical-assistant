
import { HfInference } from "@huggingface/inference";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
 //vector database
import faiss from "faiss-node";         
// file system access
import fs from "fs";                     
import path from "path";
// extracts text from pdfs
import pdfParse from "pdf-parse";           
// loads env variables
import "dotenv/config";                    

// FAISS index type where IP means
const { IndexFlatIP} = faiss;               
 //Creates Hugging Face API client 
const hf = new HfInference(process.env.HF_TOKEN);     
// model for embedding

const EMBED_MODEL = "BAAI/bge-large-en-v1.5";        
//stores knowledge base
const PDF_FOLDER   = "../pdfs";                   
// stores vector
const INDEX_FILE   = "medical.index";               
// maps vector index to text
const META_FILE    = "metadata.json";               
 
const DIMENSION    = 1024;     
 // characters per chunk     
const CHUNK_SIZE    = 800;                              
//overlapping ensures meaning is not lost
const CHUNK_OVERLAP = 200;  

function normalize(vector) {
  const magnitude = Math.sqrt(
    vector.reduce((sum, val) => sum + val * val, 0)
  );

  return vector.map(val => val / magnitude);
}


//text cleaning function 
function cleanText(raw) {
  return raw
    .replace(/\f/g, " ")                                 // \f is a hidden character used by PDFs for page breaks like page 1\fpage 2 , /g removes global or all occurrences
    .replace(/\s+/g, " ")                                // removes multiple spaces
    .trim();                                             // removes space from start and end
}


//function for converting text into vectors ie embedding
async function getEmbedding(text) {
  const result = await hf.featureExtraction({
    model: EMBED_MODEL,
    inputs: text,
  });
  
  const vector = Array.isArray(result[0]) ? result[0] : result;

  //safety check to ensure 1024 vectors are generated otherwise FAISS will crash
  if (vector.length !== DIMENSION) {
    throw new Error(`Dimension mismatch: expected ${DIMENSION}, got ${vector.length}`);
  }
  return vector;
}

// Ingestion means process raw text into vector db
async function runIngestion() {
  console.log(" Medical RAG Ingestion Pipeline \n");
  // stores folder contents and keep only pdfs
  const pdfFiles = fs.readdirSync(PDF_FOLDER).filter((f) => f.endsWith(".pdf"));     
  if (pdfFiles.length === 0) {
    console.error("No PDF files found in", PDF_FOLDER);
    process.exit(1);
  }
  
  
  const allDocs = [];
  for (const filename of pdfFiles) {
    const filepath = path.join(PDF_FOLDER, filename);
    // reads pdf file in memory
    const buffer   = fs.readFileSync(filepath);
    // converts pdfs into text
    const parsed   = await pdfParse(buffer);
    // cleaning function is called and data is cleaned
    const cleaned  = cleanText(parsed.text);
    // stores array of objects containing cleaned data and source
    allDocs.push({ text: cleaned, source: filename });
   
  }

  // converts large pdfs into chunks
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allChunks = [];
  for (const doc of allDocs) {
    // creates chunks of cleaned data
    const chunks = await splitter.createDocuments([doc.text]);
    for (const chunk of chunks) {
      // removes useless tiny chunks that may not be important
      if (chunk.pageContent.trim().length > 20) {
        allChunks.push({ text: chunk.pageContent.trim(), source: doc.source });
      }
    }
  }


 const vectors = [];
  const metadata = [];
  let vectorIndex = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    try {
      // converts each chunk into vectors
     const vector = await getEmbedding(chunk.text);
     const normalizedVector = normalize(vector);
     vectors.push(normalizedVector);
     metadata.push({ id: vectorIndex, text: chunk.text, source: chunk.source });
     vectorIndex++;
      
      //prevents overload ie wait 1s before next api call
      await new Promise((res) => setTimeout(res, 1000));

    } catch (err) {
      console.error(`\n  Skipping chunk ${i} — ${err.message}`);
    }
  }
  console.log(`\n\nEmbeddings generated: ${vectors.length}`);

  
  //creates empty vector db
  const index = new IndexFlatIP(DIMENSION);
  //converts nested array to flat array
  index.add(vectors.flat());
  //creates file storing vectors
  index.write(INDEX_FILE);

  // null means no filtering include everything and 2 is used for indentation to make json readable
  fs.writeFileSync(META_FILE, JSON.stringify(metadata, null, 2));

  console.log(` FAISS index saved:  ${INDEX_FILE}`);
  console.log(` Metadata saved:     ${META_FILE}`);
  console.log(`\n Ingestion complete! ${vectors.length} vectors indexed.`);
}

runIngestion().catch(console.error);