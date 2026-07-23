# PulsarIQ — Enterprise RAG Document Intelligence Platform

![PulsarIQ](https://img.shields.io/badge/PulsarIQ-Enterprise%20AI-22D3EE?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=for-the-badge&logo=supabase)

> **Self-hosted enterprise RAG platform — upload any document, ask any question, get cited answers. Zero data leaves your infrastructure.**

🔗 **Live Demo:** https://pulsariq.vercel.app  
📂 **GitHub:** https://github.com/khabteehouse-del/pulsariq

> ⚡ Public demo runs on Groq for accessibility. Production deploys self-hosted with Ollama — no document data leaves your infrastructure.

---

## What is PulsarIQ?

PulsarIQ is a production-grade Retrieval-Augmented Generation (RAG) platform built for enterprises that cannot send sensitive documents to third-party AI APIs. Upload PDFs, Word documents, spreadsheets, presentations, or any text file — then query your entire knowledge base in natural language. Every answer is grounded in your source documents with exact citations.

---

## Features

- **Document Intelligence** — Upload PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML. Files are chunked, embedded, and indexed automatically.
- **Natural Language Chat** — Ask questions in plain English. Answers are grounded in your documents with citations back to the source.
- **Semantic Vector Search** — pgvector cosine similarity finds relevant content by meaning, not just keyword matching.
- **100% Private AI** — Language model inference runs on-premise via Ollama or any OpenAI-compatible API. No data sent externally.
- **Enterprise RBAC** — Admin, Manager, Viewer roles with multi-tenant organization support.
- **Document Preview** — Click any document to see extracted content before querying.
- **Real-time Notifications** — Bell notifications when documents finish processing.
- **Futuristic UI** — CRT boot animation, reactor core animation, HUD-style stat cards, constellation ambient motion.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, React |
| Database | Supabase (PostgreSQL + pgvector) |
| Storage | Supabase Storage |
| AI Inference | Groq API (cloud) / Ollama (self-hosted) |
| Embeddings | all-minilm (384 dimensions) |
| Auth | Supabase Auth |
| Deployment | Vercel |

---

## RAG Pipeline

```
Upload File → Extract Text → Chunk Text → Generate Embeddings
→ Store in pgvector → User Question
→ Semantic Similarity Search → Top-K Chunks → LLM Context
→ Groq / Ollama → Grounded Answer + Citations
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/khabteehouse-del/pulsariq.git
cd pulsariq
npm install --legacy-peer-deps
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PulsarIQ
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

```sql
-- documents table
id            uuid PRIMARY KEY
org_id        uuid
uploaded_by   uuid
name          text
file_type     text
file_size     bigint
storage_path  text
status        text  -- processing | ready | failed
chunk_count   integer
created_at    timestamptz
updated_at    timestamptz

-- document_chunks table
id            uuid PRIMARY KEY
document_id   uuid REFERENCES documents(id)
content       text
chunk_index   integer
embedding     vector(384)
```

---

## License

MIT

---

## Author

**Muhammad Faraz**  
[LinkedIn](https://www.linkedin.com/in/beyondtahir/) · [GitHub](https://github.com/khabteehouse-del)

*PulsarIQ — Your knowledge, pulsing with intelligence.*
