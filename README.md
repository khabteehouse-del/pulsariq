# PulsarIQ — Enterprise RAG Document Intelligence Platform

![PulsarIQ](https://img.shields.io/badge/PulsarIQ-Enterprise%20AI-22D3EE?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=for-the-badge&logo=supabase)

> **Self-hosted enterprise RAG platform — upload any document, ask any question, get cited answers. Zero data leaves your infrastructure.**

🔗 **Live Demo:** https://pulsariq.vercel.app
📂 **GitHub:** https://github.com/khabteehouse-del/pulsariq

---

## Inference Architecture — Groq vs Ollama

PulsarIQ is designed to be **LLM-agnostic**. The inference layer supports two deployment modes:

| Mode | Provider | Use Case |
|------|----------|----------|
| **Self-hosted (Production)** | Ollama — llama3.2:3b running on-premise | Enterprise clients who require zero data leaving their infrastructure |
| **Cloud (Public Demo)** | Groq API — llama-3.1-8b-instant | Public demo on Vercel where local Ollama cannot run |

The public demo at **pulsariq.vercel.app** uses Groq's API for accessibility. In a real enterprise deployment, the client runs their own Ollama instance and the Groq dependency is removed entirely. **Switching between them requires a single environment variable change** — the rest of the system is identical.

This architecture decision was deliberate: it demonstrates that the platform is not locked into any single LLM provider, which is a core requirement for enterprise AI deployments.

---

## What is PulsarIQ?

PulsarIQ is a production-grade Retrieval-Augmented Generation (RAG) platform built for enterprises that cannot send sensitive documents to third-party AI APIs. Upload PDFs, Word documents, spreadsheets, presentations, or any text file — then query your entire knowledge base in natural language. Every answer is grounded in your source documents with exact citations.

---

## Features

- **Document Intelligence** — Upload PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML. Files are chunked, embedded, and indexed automatically.
- **Natural Language Chat** — Ask questions in plain English. Answers are grounded in your documents with citations back to the source.
- **Semantic Vector Search** — pgvector cosine similarity finds relevant content by meaning, not just keyword matching.
- **100% Private AI** — Language model inference runs on-premise via Ollama. No data sent externally in production.
- **LLM-Agnostic Design** — Swap between Ollama, Groq, or any OpenAI-compatible API via a single environment variable.
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
| AI Inference | Ollama (self-hosted) / Groq API (cloud demo) |
| LLM Model | llama3.2:3b (Ollama) / llama-3.1-8b-instant (Groq) |
| Embeddings | all-minilm (384 dimensions via Ollama) |
| Auth | Supabase Auth |
| Deployment | Vercel (demo) / Self-hosted (production) |

---

## RAG Pipeline

```
Upload File
    ↓
Extract Text (PDF, DOCX, XLSX, etc.)
    ↓
Chunk Text (overlapping segments)
    ↓
Generate Embeddings (all-minilm, 384D via Ollama)
    ↓
Store in pgvector (Supabase)
    ↓
User Question
    ↓
Semantic Similarity Search (pgvector cosine distance)
    ↓
Top-K Chunks → LLM Context
    ↓
Ollama / Groq → Grounded Answer + Deduplicated Citations
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Groq API key (free) OR Ollama installed locally

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

# Option A: Groq (cloud, fast, free tier)
GROQ_API_KEY=your_groq_key

# Option B: Ollama (self-hosted, fully private)
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

## Key Design Decisions

**LLM-agnostic inference:** The chat API route checks for `GROQ_API_KEY` first and falls back to Ollama. Switching inference providers requires zero code changes.

**Semantic vector search:** Uses pgvector cosine similarity with 384-dimensional embeddings. Falls back to keyword scoring automatically if Ollama is unavailable.

**Schema-first:** Verified against `information_schema.columns`. API aliases `name → filename` in responses for frontend consistency.

**CSS-only animations:** All ambient motion uses CSS keyframes — no Three.js or canvas dependencies. Cannot crash the dashboard layout.

---

## License

MIT

---

## Author

**Faraz Akhtar**
[LinkedIn](https://www.linkedin.com/in/beyondtahir/) · [GitHub](https://github.com/khabteehouse-del)

*PulsarIQ — Your knowledge, pulsing with intelligence.*
