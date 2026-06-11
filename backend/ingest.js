
import { GoogleGenerativeAI } from "@google/generative-ai"; //used for gemini api
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters"; //for splitting large text into chunks
import faiss from "faiss-node"; // vector db
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse"; // converts pdf to text
import "dotenv/config";

const { IndexFlatL2 } = faiss;

// this creates a gemini client using gemini key
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// gemini embedding model 
const embedModel = ai.getGenerativeModel({ model: "gemini-embedding-001" });


const PDF_FOLDER = "../pdfs";       // for creating file path
const INDEX_FILE = "medical.index"; // for storing vectors
const META_FILE  = "metadata.json"; // for storing actual chunk text 
const DIMENSION  = 3072;            // embedding model outputs 3072 dimensions
const CHUNK_SIZE = 200;             // Characters per chunk 
const CHUNK_OVERLAP = 20;           // Overlap between chunks for context

// cleaning function for data
function cleanText(raw) {
  return raw
    .replace(/\f/g, " ")           // \f is a hidden character used by PDFs for page breaks like page 1\fpage 2 , /g removes global or all occurrences
    .replace(/\s+/g, " ")          // removes multiple spaces
    .trim();                        // removes space from start and end
}

// function for converting text chunk into vector ie embedding
async function getEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {   
  const result = await embedModel.embedContent({     // calls gemini
    content: { parts: [{ text }] },
    taskType, // gemini supports RETRIEVAL_DOCUMENT for indexing, RETRIEVAL_QUERY for searching
  });
  return result.embedding.values; 
}


async function runIngestion() {
  console.log("=== Medical RAG Ingestion Pipeline ===\n");

  // Read all PDFs from the folder
  const pdfFiles = fs.readdirSync(PDF_FOLDER).filter(f => f.endsWith(".pdf"));
 
  // Extract text from each PDF
  const allDocs = [];     // for storing cleaned data and file name
  for (const filename of pdfFiles) {
    const filepath = path.join(PDF_FOLDER, filename);
    const buffer = fs.readFileSync(filepath); //reads each pdf  bytes
    const parsed = await pdfParse(buffer);     // converts pdf to text
    const cleanedText = cleanText(parsed.text);  // calls data cleaning function
    allDocs.push({ text: cleanedText, source: filename });
  }

  // Split each document into smaller chunks using sequence chunking
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });

  const allChunks = [];
  for (const doc of allDocs) {
    const chunks = await splitter.createDocuments([doc.text]);
    for (const chunk of chunks) {
      if (chunk.pageContent.trim().length > 20) { // skip tiny meaningless chunks
        allChunks.push({                          // each chunk stores text and its souce pdf
          text: chunk.pageContent.trim(),
          source: doc.source,
        });
      }
    }
  }
 
  
  console.log("Generating embeddings (this may take a few minutes)...");
  const vectors = [];
  const metadata = [];
  let vectorIndex = 0; // Separate counter to avoid ID gaps from skipped chunks

  // for embedding
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];                     // takes one chunk at a time to convert to vector
    try {
      const vector = await getEmbedding(chunk.text, "RETRIEVAL_DOCUMENT");   //calls embedding function
      vectors.push(vector);
      metadata.push({
        id: vectorIndex,      
        text: chunk.text,
        source: chunk.source,
      });
      vectorIndex++;
      process.stdout.write(`\r  Processing chunk ${i + 1}/${allChunks.length}...`);
      // Rate limit safety: 100ms pause between API calls
      await new Promise(res => setTimeout(res, 100));   // alaways 10 req per second
    } catch (err) {
      console.error(`\n Skipping chunk ${i} due to error: ${err.message}`);
    }
  }
  console.log(`\n Embeddings generated: ${vectors.length}`);

  
  const index = new IndexFlatL2(DIMENSION); // FlatL2 = exact Euclidean distance search ie distance btw vectors
  const flatVectors = vectors.flat();      
  index.add(flatVectors);

  index.write(INDEX_FILE);
  fs.writeFileSync(META_FILE, JSON.stringify(metadata, null, 2));

  console.log(`FAISS index saved: ${INDEX_FILE}`);
  console.log(` Metadata saved: ${META_FILE}`);
  console.log(`\n Ingestion complete! ${vectors.length} vectors indexed.`);
  
}

runIngestion().catch(console.error);
