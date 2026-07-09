import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Self-contained service-role client. Bypasses RLS for trusted,
// server-side-only operations (storage writes, admin deletes, etc).
// Does NOT depend on lib/supabase/admin.ts's export shape.
export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  }
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
