# PulsarIQ — Enterprise RAG Document Intelligence Platform

![PulsarIQ](https://img.shields.io/badge/PulsarIQ-Enterprise%20AI-22D3EE?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=for-the-badge&logo=supabase)

> **Enterprise RAG document platform: upload documents, ask questions, get cited answers. Designed for self-hosted deployment, with a cloud-based public demo.**

🔗 **Live Demo:** https://pulsariq.vercel.app
📂 **GitHub:** https://github.com/khabteehouse-del/pulsariq

---

## Inference Architecture — Groq vs Ollama

PulsarIQ is designed to be **LLM-agnostic**. The inference layer supports two deployment modes:

| Mode | Provider | Use Case |
|------|----------|----------|
| **Self-hosted (design target)** | Ollama (llama3.2:3b) on-premise | For clients who need data to stay on their own infrastructure. Ollama embeddings exist in `lib/ingestion`. The chat route in this repository does not call Ollama yet. |
| **Cloud (Public Demo, what runs today)** | Groq API (llama-3.1-8b-instant) for answers, OpenAI API (text-embedding-3-small, 384 dimensions) for document embeddings | Public demo on Vercel, where local Ollama cannot run |

The public demo at **pulsariq.vercel.app** runs on cloud services: uploaded documents are embedded through the OpenAI API, and questions plus the selected text passages are sent to Groq to generate answers. Do not upload confidential documents to the demo.

The self-hosted design replaces those cloud calls with Ollama so data stays on the client's infrastructure. Today, the ingestion code in `lib/ingestion` has the Ollama embedding path. The chat route is Groq-only, so a fully self-hosted deployment needs that route wired to Ollama first. This is not a one-line environment switch in the current code.

---

## Demo Access

Open https://pulsariq.vercel.app and use **Create workspace** to sign up, or **Sign In** if you already have an account. The demo is cloud-based, so do not upload confidential documents.

---

## What is PulsarIQ?

PulsarIQ is a production-grade Retrieval-Augmented Generation (RAG) platform built for enterprises that cannot send sensitive documents to third-party AI APIs. Upload PDFs, Word documents, spreadsheets, presentations, or any text file — then query your entire knowledge base in natural language. Every answer is grounded in your source documents with exact citations.

---

## Features

- **Document Intelligence** — Upload PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML. Files are chunked, embedded, and indexed automatically.
- **Natural Language Chat** — Ask questions in plain English. Answers are grounded in your documents with citations back to the source.
- **Vector Storage** — chunks are stored with 384-dimension embeddings in pgvector, and a `match_chunks` cosine-similarity function is defined in `supabase/schema.sql`. The current chat route ranks the first 60 chunks of the selected documents by keyword overlap, and does not call `match_chunks` yet (see Current Status).
- **Private Deployment Design** — built to support a self-hosted Ollama setup so data can stay on client infrastructure. The public demo is cloud-based and is not private (see Inference Architecture).
- **Provider Separation** — embedding and answer generation are separate steps with separate providers, so each can be swapped with code changes.
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
| AI Inference | Groq API (live demo). Ollama is the self-hosted design target |
| LLM Model | llama-3.1-8b-instant (Groq, live demo) / llama3.2:3b (Ollama, design target) |
| Embeddings | text-embedding-3-small at 384 dimensions (OpenAI, live demo ingestion) / all-minilm 384 dimensions (Ollama, `lib/ingestion`) |
| Auth | Supabase Auth |
| Deployment | Vercel (demo) / Self-hosted (production) |

---

## RAG Pipeline

**Live demo, as implemented in `app/api/ingest` and `app/api/chat`:**

```
Upload File
    ↓
Extract Text (PDF, DOCX, XLSX, etc.)
    ↓
Chunk Text (overlapping segments)
    ↓
Generate Embeddings (OpenAI text-embedding-3-small, 384D)
    ↓
Store in pgvector (Supabase)
    ↓
User Question
    ↓
Rank chunks of the selected documents by keyword overlap (top 6)
    ↓
Groq (llama-3.1-8b-instant) → Grounded Answer + Deduplicated Citations
```

**Design target, partly implemented:** retrieve with `match_chunks` (pgvector cosine similarity, already defined in the schema) and use Ollama for embeddings and answers.

## Current Status

| Capability | Status |
|---|---|
| Upload, chunk, embed and store documents | Implemented (OpenAI embeddings on the demo, Ollama path in `lib/ingestion`) |
| Cited answers from selected documents | Implemented (keyword-ranked retrieval, Groq answers) |
| pgvector similarity retrieval in the chat route | Not wired yet (`match_chunks` exists in the schema) |
| Fully self-hosted chat through Ollama | Not wired yet in this repository |
| Admin, Manager and Viewer roles with row-level security | Implemented in `supabase/schema.sql` |

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
[LinkedIn](https://www.linkedin.com/in/farazakhtar1980/) · [GitHub](https://github.com/khabteehouse-del)

*PulsarIQ — Your knowledge, pulsing with intelligence.*
