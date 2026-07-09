# PulsarIQ — Enterprise RAG Document Intelligence Platform

![PulsarIQ](https://img.shields.io/badge/PulsarIQ-Enterprise%20AI-22D3EE?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?style=for-the-badge&logo=supabase)
![Ollama](https://img.shields.io/badge/Ollama-Self--Hosted-F59E0B?style=for-the-badge)

> **Self-hosted enterprise RAG platform — upload any document, ask any question, get cited answers. Zero data leaves your infrastructure.**

---

## What is PulsarIQ?

PulsarIQ is a production-grade Retrieval-Augmented Generation (RAG) platform built for enterprises that cannot send sensitive documents to third-party AI APIs. Upload PDFs, Word documents, spreadsheets, presentations, or any text file — then query your entire knowledge base in natural language. Every answer is grounded in your source documents with exact citations.

Built as a portfolio demonstration of real enterprise AI architecture — multi-tenant, role-based, fully self-hosted.

---

## Screenshots

> Landing page, Dashboard, Documents, AI Chat — add yours here.

---

## Features

- **Document Intelligence** — Upload PDF, DOCX, XLSX, PPTX, CSV, TXT, HTML. Files are chunked, embedded, and indexed automatically.
- **Natural Language Chat** — Ask questions in plain English. Answers are grounded in your documents with citations back to the source.
- **100% Private AI** — Language model inference runs on-premise via Ollama or any OpenAI-compatible API (Groq, etc.). No data sent externally.
- **Vector Search** — Supabase + pgvector for semantic similarity search across millions of document chunks.
- **Enterprise RBAC** — Admin, Manager, Viewer roles with multi-tenant organization support.
- **Document Preview** — Click any document to see extracted content before querying.
- **Notification System** — Real-time bell notifications when documents finish processing.
- **Delete Confirmation** — Safe deletion with confirmation dialogs and verified server-side deletion.
- **Futuristic UI** — CRT boot animation, Lorenz attractor background, reactor core animation, HUD-style stat cards, constellation ambient motion.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, React |
| Database | Supabase (PostgreSQL + pgvector) |
| Storage | Supabase Storage |
| AI Inference | Ollama (local) / Groq API (cloud) |
| Embeddings | all-minilm (384 dimensions) |
| Auth | Supabase Auth |
| Styling | Pure CSS-in-JS (no UI library) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     PulsarIQ                            │
├─────────────────┬───────────────────┬───────────────────┤
│   Next.js App   │   Supabase DB     │   AI Layer        │
│                 │                   │                   │
│  Landing Page   │  documents        │  Ollama / Groq    │
│  Dashboard      │  document_chunks  │  llama3.2:3b      │
│  Documents      │  profiles         │  all-minilm       │
│  AI Chat        │  pgvector index   │  384D embeddings  │
│  Analytics      │                   │                   │
│  Access / RBAC  │  Supabase Storage │                   │
│  Settings       │  (file storage)   │                   │
└─────────────────┴───────────────────┴───────────────────┘
```

### RAG Pipeline

```
Upload File
    ↓
Extract Text (PDF, DOCX, XLSX, etc.)
    ↓
Chunk Text (overlapping segments)
    ↓
Generate Embeddings (all-minilm, 384D)
    ↓
Store in pgvector (Supabase)
    ↓
Query: User Question
    ↓
Keyword Relevance Scoring (reliable fallback over vector RPC)
    ↓
Top-K Chunks → LLM Context
    ↓
Groq / Ollama → Grounded Answer + Citations
```

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
error_message text
metadata      jsonb
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

## Getting Started

### Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account (free tier works)
- [Ollama](https://ollama.ai) installed locally OR a [Groq](https://console.groq.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pulsariq.git
cd pulsariq
npm install
```

### 2. Set up Supabase

Create a new Supabase project, then run the schema migrations in the SQL Editor.

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Option A: Local Ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_EMBED_MODEL=all-minilm

# Option B: Groq API (faster, still free)
GROQ_API_KEY=your_groq_key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Ollama (if using local inference)

```bash
ollama pull llama3.2:3b
ollama pull all-minilm
ollama serve
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `OLLAMA_BASE_URL` | If using Ollama | Ollama server URL |
| `OLLAMA_MODEL` | If using Ollama | Model name (e.g. llama3.2:3b) |
| `OLLAMA_EMBED_MODEL` | If using Ollama | Embedding model (all-minilm) |
| `GROQ_API_KEY` | If using Groq | Your Groq API key |
| `NEXT_PUBLIC_APP_URL` | Yes | App URL for internal API calls |

---

## Project Structure

```
pulsariq/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Home dashboard
│   │   ├── documents/        # Document management
│   │   ├── chat/             # AI chat interface
│   │   ├── analytics/        # Usage analytics
│   │   ├── access/           # RBAC management
│   │   └── settings/         # User settings
│   ├── api/
│   │   ├── documents/        # Document CRUD + upload
│   │   ├── chat/             # RAG chat endpoint
│   │   └── ingest/           # Document processing pipeline
│   └── page.tsx              # Landing page
├── components/
│   ├── layout/               # Sidebar, Topbar, CommandPalette
│   └── ui/                   # StatCard, ConstellationBg, etc.
├── lib/
│   └── supabase/             # Client, server, admin-inline helpers
└── public/
```

---

## Key Design Decisions

**Schema-first discipline:** The documents table uses `name` (not `filename`) and `uploaded_by` (not `user_id`). The API aliases `name → filename` in responses so all frontend code stays consistent.

**Admin client bypass:** Storage writes and admin deletes use a self-contained service-role client (`lib/supabase/admin-inline.ts`) to bypass RLS reliably for trusted server-side operations.

**Keyword scoring over pgvector RPC:** The chat pipeline uses keyword-relevance scoring on retrieved chunks rather than pgvector's RPC similarity search, which proved unreliable in this stack. Reliability over sophistication.

**Pure CSS animations:** All ambient motion (constellation background, HUD scan lines, rotating rings) uses CSS keyframes — no Three.js, no canvas beyond the landing page hero. Cannot crash the layout.

---

## Contributing

This is a portfolio project. Issues and PRs welcome.

---

## License

MIT

---

## Author

**Muhammad Faraz (Dr BhaiJaan)**
[LinkedIn](https://www.linkedin.com/in/beyondtahir/) · Building self-hosted AI infrastructure

---

*PulsarIQ — Your knowledge, pulsing with intelligence.*
