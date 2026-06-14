# 🩺 AI Medical RAG Assistant

A  Retrieval-Augmented Generation (RAG) application that answers medical questions using a medical knowledge base and Large Language Models (LLMs).

## 🚀 Features

- Medical-domain question answering
- PDF-based knowledge base
- Semantic search using FAISS
- Hugging Face embeddings
- Context-aware responses using Qwen 2.5
- Citation support
- Session-based chat memory
- Streaming AI responses
- Responsive React UI

---

## 🛠️ Tech Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend
- Node.js
- Express.js
- FAISS
- Hugging Face Inference API
- PDF Parse
- LangChain Text Splitters

### Deployment
- Vercel (Frontend)
- Render (Backend)

---

## 📂 Project Structure

```text
ai-medical-assistant/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── ingest.js
│   ├── medical.index
│   ├── metadata.json
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

### 1. Data Ingestion
- Medical PDFs are loaded.
- Documents are split into chunks.
- Each chunk is converted into vector embeddings.

### 2. Vector Storage
- Embeddings are stored in a FAISS index.

### 3. User Query Processing
- User question is converted into an embedding.
- FAISS retrieves the most relevant chunks.

### 4. Response Generation
- Retrieved context is sent to the Qwen model.
- The model generates a context-aware answer.

### 5. Streaming Response
- Responses are streamed word-by-word to the frontend.

---

## 🧠 RAG Pipeline

```text
Medical PDFs
      │
      ▼
Text Chunking
      │
      ▼
Embeddings (BAAI/bge-large-en-v1.5)
      │
      ▼
FAISS Vector Store
      │
      ▼
User Question
      │
      ▼
Similarity Search
      │
      ▼
Relevant Context
      │
      ▼
Qwen 2.5 LLM
      │
      ▼
AI Response + Citations
```

---



## 🎯 Future Improvements

- Redis-based long-term memory
- Authentication
- User chat history
- Multi-document upload
- Advanced citation ranking
- Docker deployment

---

## 👨‍💻 Author

Simran Dhyani
