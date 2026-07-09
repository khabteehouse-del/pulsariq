import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// NEVER import on the client. Bypasses ALL Row Level Security.
// Only use in: API routes, lib/ingestion, scripts/seed.ts
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
