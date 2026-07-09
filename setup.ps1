# ============================================================
# PulsarIQ — Phase 0 Setup Script
# HOW TO USE:
#   1. Save this file as setup.ps1 inside C:\pulsariq\
#   2. Open PowerShell as Administrator
#   3. Run: cd C:\pulsariq
#   4. Run: powershell -ExecutionPolicy Bypass -File setup.ps1
# ============================================================

Write-Host ""
Write-Host "  PulsarIQ — Phase 0 Setup" -ForegroundColor Magenta
Write-Host "  Building your project scaffold..." -ForegroundColor Gray
Write-Host ""

Set-Location $PSScriptRoot

# ── Create All Folders ──────────────────────────────────────
$folders = @(
  "lib\supabase", "lib\ai", "lib\queue", "lib\ingestion\parsers",
  "types", "supabase", "scripts", "hooks",
  "components\ui", "components\layout", "components\documents",
  "components\chat", "components\analytics", "components\landing"
)
foreach ($f in $folders) {
  New-Item -ItemType Directory -Force -Path $f | Out-Null
}
Write-Host "  [1/14] Folders created" -ForegroundColor Green

# ── package.json ────────────────────────────────────────────
@'
{
  "name": "pulsariq",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "tsx scripts/seed.ts",
    "worker": "tsx lib/queue/worker.ts",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "next": "14.2.35",
    "react": "^18",
    "react-dom": "^18",
    "@supabase/ssr": "^0.5.1",
    "@supabase/supabase-js": "^2.45.3",
    "@tanstack/react-query": "^5.56.2",
    "zustand": "^5.0.0-rc.2",
    "zod": "^3.23.8",
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "ai": "^3.3.43",
    "ollama": "^0.5.9",
    "bullmq": "^5.13.2",
    "ioredis": "^5.4.1",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.8.0",
    "xlsx": "^0.18.5",
    "papaparse": "^5.4.1",
    "cheerio": "^1.0.0",
    "pptx-parser": "^0.1.0",
    "lucide-react": "^0.447.0",
    "framer-motion": "^11.5.4",
    "sonner": "^1.5.0",
    "cmdk": "^1.0.0",
    "vaul": "^0.9.1",
    "react-dropzone": "^14.2.3",
    "recharts": "^2.12.7",
    "@react-pdf-viewer/core": "^3.12.0",
    "@react-pdf-viewer/default-layout": "^3.12.0",
    "pdfjs-dist": "^4.5.136",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "date-fns": "^4.1.0",
    "fuse.js": "^7.0.0"
  },
  "devDependencies": {
    "@faker-js/faker": "^9.0.3",
    "@types/node": "^20",
    "@types/papaparse": "^5.3.14",
    "@types/pdf-parse": "^1.1.4",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "14.2.35",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "tsx": "^4.19.1",
    "typescript": "^5"
  }
}
'@ | Set-Content -Path "package.json" -Encoding utf8NoBOM
Write-Host "  [2/14] package.json" -ForegroundColor Green

# ── next.config.js ──────────────────────────────────────────
@'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "pdf-parse", "mammoth", "xlsx",
      "pptx-parser", "bullmq", "ioredis",
    ],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
'@ | Set-Content -Path "next.config.js" -Encoding utf8NoBOM
Write-Host "  [3/14] next.config.js" -ForegroundColor Green

# ── tailwind.config.ts ──────────────────────────────────────
@'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          950: "#07080F",
          900: "#0D0F1C",
          850: "#0F1220",
          800: "#111425",
        },
        pulsar: {
          DEFAULT: "#6366F1",
          50:  "rgba(99,102,241,0.05)",
          100: "rgba(99,102,241,0.10)",
          200: "rgba(99,102,241,0.20)",
          300: "rgba(99,102,241,0.30)",
        },
        aurora: {
          DEFAULT: "#22D3EE",
          50:  "rgba(34,211,238,0.05)",
          100: "rgba(34,211,238,0.10)",
          200: "rgba(34,211,238,0.20)",
        },
        glass: {
          border: "rgba(99,102,241,0.15)",
          "border-light": "rgba(255,255,255,0.06)",
          bg: "rgba(255,255,255,0.03)",
        },
      },
      backgroundImage: {
        "pulsar-gradient": "linear-gradient(135deg, #6366F1, #22D3EE)",
        "pulsar-gradient-soft": "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))",
        "void-gradient": "linear-gradient(180deg, #07080F 0%, #0D0F1C 100%)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        "pulsar":    "0 0 20px rgba(99,102,241,0.35)",
        "aurora":    "0 0 20px rgba(34,211,238,0.35)",
        "pulsar-lg": "0 8px 40px rgba(99,102,241,0.30)",
        "glass":     "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        "card":      "0 2px 16px rgba(0,0,0,0.3)",
      },
      animation: {
        "pulse-slow":    "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow":          "glow 2s ease-in-out infinite alternate",
        "fade-in":       "fadeIn 0.3s ease-out",
        "slide-up":      "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right":"slideInRight 0.3s ease-out",
      },
      keyframes: {
        glow: {
          "0%":   { boxShadow: "0 0 10px rgba(99,102,241,0.3)" },
          "100%": { boxShadow: "0 0 25px rgba(99,102,241,0.6)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideInRight: {
          "0%":   { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
'@ | Set-Content -Path "tailwind.config.ts" -Encoding utf8NoBOM
Write-Host "  [4/14] tailwind.config.ts" -ForegroundColor Green

# ── tsconfig.json ───────────────────────────────────────────
@'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
'@ | Set-Content -Path "tsconfig.json" -Encoding utf8NoBOM
Write-Host "  [5/14] tsconfig.json" -ForegroundColor Green

# ── .env.example ────────────────────────────────────────────
@'
# PulsarIQ — Environment Variables
# Copy this to .env.local and fill in your values
# NEVER commit .env.local to git

# Supabase — Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Ollama — run: ollama serve (default port 11434)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# Redis — local: redis://localhost:6379
REDIS_URL=redis://localhost:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=PulsarIQ
'@ | Set-Content -Path ".env.example" -Encoding utf8NoBOM
Write-Host "  [6/14] .env.example" -ForegroundColor Green

# ── middleware.ts ────────────────────────────────────────────
@'
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup"];
const API_PUBLIC    = ["/api/seed"];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isPublic    = PUBLIC_ROUTES.includes(pathname);
  const isApiPublic = API_PUBLIC.some((r) => pathname.startsWith(r));
  const isApiRoute  = pathname.startsWith("/api");
  const isStatic    = pathname.startsWith("/_next") || pathname.includes(".");

  if (isStatic || isApiPublic) return supabaseResponse;

  if (!user && !isPublic && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
'@ | Set-Content -Path "middleware.ts" -Encoding utf8NoBOM
Write-Host "  [7/14] middleware.ts" -ForegroundColor Green

# ── app/layout.tsx ──────────────────────────────────────────
@'
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PulsarIQ — Enterprise AI", template: "%s | PulsarIQ" },
  description: "Upload any document. Ask any question. PulsarIQ searches your enterprise knowledge base with AI — precise answers with exact citations.",
  openGraph: {
    type: "website",
    title: "PulsarIQ — Enterprise AI",
    description: "Your enterprise knowledge, pulsing with intelligence.",
    siteName: "PulsarIQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#07080F",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-void-950 text-slate-100`}>
        {children}
        <Toaster
          position="bottom-right"
          expand
          richColors
          toastOptions={{
            style: {
              background: "rgba(13,15,28,0.96)",
              border: "1px solid rgba(99,102,241,0.2)",
              color: "#F1F5F9",
              backdropFilter: "blur(24px)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
            },
          }}
        />
      </body>
    </html>
  );
}
'@ | Set-Content -Path "app\layout.tsx" -Encoding utf8NoBOM
Write-Host "  [8/14] app/layout.tsx" -ForegroundColor Green

# ── app/globals.css ─────────────────────────────────────────
@'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --void-950: #07080F;
  --void-900: #0D0F1C;
  --pulsar:   #6366F1;
  --pulsar-rgb: 99, 102, 241;
  --aurora:   #22D3EE;
  --aurora-rgb: 34, 211, 238;
  --text-primary: #F1F5F9;
  --text-muted:   #64748B;
  --glass-bg:     rgba(255,255,255,0.03);
  --glass-border: rgba(99,102,241,0.15);
  --glass-blur:   24px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--void-950);
  color: var(--text-primary);
  font-family: 'Inter', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.45); }
::selection { background: rgba(99,102,241,0.3); color: #F1F5F9; }

@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: blur(var(--glass-blur));
    -webkit-backdrop-filter: blur(var(--glass-blur));
    border: 1px solid var(--glass-border);
  }
  .glass-sm {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.06);
  }
  .glass-hover { transition: border-color 0.2s ease, background 0.2s ease; }
  .glass-hover:hover { background: rgba(255,255,255,0.05); border-color: rgba(99,102,241,0.25); }
  .text-pulsar-gradient {
    background: linear-gradient(90deg, var(--pulsar), var(--aurora));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .glow-pulsar { box-shadow: 0 0 20px rgba(99,102,241,0.35); }
  .glow-aurora { box-shadow: 0 0 20px rgba(34,211,238,0.35); }
  .btn-pulsar {
    background: linear-gradient(135deg, var(--pulsar), var(--aurora));
    box-shadow: 0 4px 20px rgba(99,102,241,0.3);
    transition: opacity 0.2s ease, box-shadow 0.2s ease;
  }
  .btn-pulsar:hover { opacity: 0.9; box-shadow: 0 6px 28px rgba(99,102,241,0.45); }
  .skeleton {
    background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s infinite;
  }
  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
  .dot-ping { animation: dotPing 1.5s ease-out infinite; }
  @keyframes dotPing {
    0%   { box-shadow: 0 0 0 0 currentColor; }
    70%  { box-shadow: 0 0 0 6px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
}
'@ | Set-Content -Path "app\globals.css" -Encoding utf8NoBOM
Write-Host "  [9/14] app/globals.css" -ForegroundColor Green

# ── lib/supabase/client.ts ──────────────────────────────────
@'
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
'@ | Set-Content -Path "lib\supabase\client.ts" -Encoding utf8NoBOM
Write-Host "  [10/14] lib/supabase/client.ts" -ForegroundColor Green

# ── lib/supabase/server.ts ──────────────────────────────────
@'
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch { /* Server Component — ignore */ }
        },
      },
    }
  );
}
'@ | Set-Content -Path "lib\supabase\server.ts" -Encoding utf8NoBOM
Write-Host "  [11/14] lib/supabase/server.ts" -ForegroundColor Green

# ── lib/supabase/admin.ts ───────────────────────────────────
@'
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// NEVER import this on the client side.
// Only use in: API routes, lib/ingestion, scripts/seed.ts
// Bypasses ALL Row Level Security.
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
'@ | Set-Content -Path "lib\supabase\admin.ts" -Encoding utf8NoBOM
Write-Host "  [12/14] lib/supabase/admin.ts" -ForegroundColor Green

# ── lib/utils.ts ─────────────────────────────────────────────
@'
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function getDocType(filename: string): string {
  const ext = getFileExtension(filename);
  const map: Record<string, string> = {
    pdf: "PDF", docx: "DOC", doc: "DOC",
    xlsx: "XLS", xls: "XLS",
    pptx: "PPT", ppt: "PPT",
    csv: "CSV", txt: "TXT", html: "HTML", md: "MD",
  };
  return map[ext] ?? ext.toUpperCase();
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function chunkText(text: string, chunkSize = 512, overlap = 64): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 0) chunks.push(chunk);
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}
'@ | Set-Content -Path "lib\utils.ts" -Encoding utf8NoBOM
Write-Host "  [13/14] lib/utils.ts" -ForegroundColor Green

# ── types/database.ts ────────────────────────────────────────
@'
export type UserRole = "admin" | "manager" | "viewer";
export type DocumentStatus = "pending" | "processing" | "chunking" | "embedding" | "ready" | "failed";
export type MessageRole = "user" | "assistant";
export type AnalyticsEvent = "query" | "upload" | "delete" | "login" | "export";

export interface Organization {
  id: string; name: string; slug: string;
  logo_url: string | null; created_at: string; updated_at: string;
}

export interface Profile {
  id: string; org_id: string | null; email: string;
  full_name: string | null; avatar_url: string | null;
  role: UserRole; created_at: string; updated_at: string;
}

export interface DocumentMetadata {
  page_count?: number; word_count?: number;
  sheet_names?: string[]; slide_count?: number;
  author?: string; [key: string]: unknown;
}

export interface Document {
  id: string; org_id: string; uploaded_by: string;
  name: string; file_type: string; file_size: number;
  storage_path: string; status: DocumentStatus;
  chunk_count: number; error_message: string | null;
  metadata: DocumentMetadata; created_at: string; updated_at: string;
}

export interface ChunkMetadata {
  page?: number; slide_number?: number;
  sheet_name?: string; heading?: string; [key: string]: unknown;
}

export interface DocumentChunk {
  id: string; document_id: string; org_id: string;
  content: string; embedding: number[] | null;
  chunk_index: number; metadata: ChunkMetadata; created_at: string;
}

export interface ChatSession {
  id: string; org_id: string; user_id: string;
  title: string; document_ids: string[];
  created_at: string; updated_at: string;
}

export interface Citation {
  doc_id: string; chunk_id: string; doc_name: string;
  excerpt: string; page?: number; slide_number?: number; similarity?: number;
}

export interface Message {
  id: string; session_id: string; org_id: string;
  role: MessageRole; content: string;
  citations: Citation[]; created_at: string;
}

export interface AnalyticsLog {
  id: string; org_id: string; user_id: string | null;
  event_type: AnalyticsEvent; metadata: Record<string, unknown>; created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Organization, "id" | "created_at" | "updated_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at" | "updated_at">>;
      };
      documents: {
        Row: Document;
        Insert: Omit<Document, "id" | "created_at" | "updated_at" | "chunk_count">;
        Update: Partial<Omit<Document, "id" | "created_at" | "updated_at">>;
      };
      document_chunks: {
        Row: DocumentChunk;
        Insert: Omit<DocumentChunk, "id" | "created_at">;
        Update: Partial<Omit<DocumentChunk, "id" | "created_at">>;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: Omit<ChatSession, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ChatSession, "id" | "created_at" | "updated_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at">;
        Update: never;
      };
      analytics_logs: {
        Row: AnalyticsLog;
        Insert: Omit<AnalyticsLog, "id" | "created_at">;
        Update: never;
      };
    };
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[];
          match_org_id: string;
          match_document_ids?: string[] | null;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: { id: string; document_id: string; content: string; metadata: ChunkMetadata; similarity: number; }[];
      };
      current_org_id:   { Args: Record<never, never>; Returns: string; };
      current_user_role:{ Args: Record<never, never>; Returns: UserRole; };
    };
  };
}

export type MatchedChunk = {
  id: string; document_id: string;
  content: string; metadata: ChunkMetadata; similarity: number;
};
'@ | Set-Content -Path "types\database.ts" -Encoding utf8NoBOM
Write-Host "  [14/14] types/database.ts" -ForegroundColor Green

# ── supabase/schema.sql (bonus — not counted in 14) ─────────
New-Item -ItemType Directory -Force -Path "supabase" | Out-Null
Copy-Item -Path "$PSScriptRoot\supabase\schema.sql" -Destination "supabase\schema.sql" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "  Phase 0 complete." -ForegroundColor Magenta
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor Cyan
Write-Host "   1. npm install" -ForegroundColor White
Write-Host "   2. Copy .env.example to .env.local and fill in Supabase keys" -ForegroundColor White
Write-Host "   3. Run schema.sql in Supabase SQL Editor" -ForegroundColor White
Write-Host "   4. npm run dev" -ForegroundColor White
Write-Host ""
