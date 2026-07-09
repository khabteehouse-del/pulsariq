// PulsarIQ — admin-inline.js
// "createClient is not a function" from '@/lib/supabase/admin' means that
// wrapper doesn't export a function with that name/shape. Rather than guess
// again, this builds the service-role admin client directly using the base
// @supabase/supabase-js package + env vars — no dependency on admin.ts at all.
// Run: node admin-inline.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Inline Admin Client (no more guessing)\n');

const ADMIN_HELPER = `import { createClient as createSupabaseClient } from '@supabase/supabase-js';

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
`;

write('lib/supabase/admin-inline.ts', ADMIN_HELPER);

write('app/api/documents/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin-inline';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json([], { status: 200 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (profile?.org_id) {
      query = query.eq('org_id', profile.org_id);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Documents GET error:', error);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(data || []);
  } catch (err: any) {
    console.error('Documents GET exception:', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized \u2014 please sign in again' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    const ext = file.name.split('.').pop() || 'bin';
    const storagePath = user.id + '/' + Date.now() + '.' + ext;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const adminClient = getAdminClient();

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Storage: ' + uploadError.message }, { status: 500 });
    }

    const { data: doc, error: dbError } = await adminClient
      .from('documents')
      .insert({
        filename: file.name,
        file_type: ext,
        file_size: file.size,
        storage_path: storagePath,
        org_id: profile?.org_id || null,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB insert error:', dbError);
      return NextResponse.json({ error: 'Database: ' + dbError.message }, { status: 500 });
    }

    fetch(new URL('/api/ingest', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') || '' },
      body: JSON.stringify({ documentId: doc.id }),
    }).catch(console.error);

    return NextResponse.json(doc);
  } catch (err: any) {
    console.error('Documents POST exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}
`);

write('app/api/documents/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAdminClient } from '@/lib/supabase/admin-inline';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();
    const { data: doc } = await supabase.from('documents').select('*').eq('id', params.id).single();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { data: chunkRows } = await supabase
      .from('document_chunks')
      .select('content')
      .eq('document_id', params.id)
      .order('chunk_index', { ascending: true })
      .limit(5);

    const chunks = (chunkRows || []).map((c: any) => c.content);
    return NextResponse.json({ ...doc, chunks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = getAdminClient();
    const { data: doc } = await adminClient.from('documents').select('*').eq('id', params.id).single();
    if (doc?.storage_path) {
      await adminClient.storage.from('documents').remove([doc.storage_path]);
    }
    await adminClient.from('document_chunks').delete().eq('document_id', params.id);
    await adminClient.from('documents').delete().eq('id', params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Documents DELETE exception:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

console.log('\n  \u2705 Fixed!\n');
console.log('  New self-contained admin client at lib/supabase/admin-inline.ts');
console.log('  \u2014 uses @supabase/supabase-js directly + your .env.local keys.');
console.log('  No more dependency on the mystery shape of lib/supabase/admin.ts.\n');
console.log('  Run: rmdir /s /q .next && npm run dev');
console.log('  Then try uploading and deleting again.\n');
