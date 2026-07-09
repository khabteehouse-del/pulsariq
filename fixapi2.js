// PulsarIQ — fixapi2.js
// Fixes "Module not found: @supabase/auth-helpers-nextjs" by using the
// project's own lib/supabase/server.ts helper instead of an uninstalled package.
// Run: node fixapi2.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

function write(fp, content) {
  const full = path.join(root, fp);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  \u2713', fp);
}

console.log('\n  PulsarIQ \u2014 Fix: documents API imports\n');

// ── app/api/documents/route.ts ────────────────────────────────
write('app/api/documents/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
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
    } else {
      query = query.eq('user_id', user.id);
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
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: doc, error: dbError } = await supabase
      .from('documents')
      .insert({
        filename: file.name,
        file_type: ext,
        file_size: file.size,
        storage_path: storagePath,
        user_id: user.id,
        org_id: profile?.org_id || null,
        status: 'processing',
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    fetch(new URL('/api/ingest', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: req.headers.get('cookie') || '' },
      body: JSON.stringify({ documentId: doc.id }),
    }).catch(console.error);

    return NextResponse.json(doc);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

// ── app/api/documents/[id]/route.ts ───────────────────────────
write('app/api/documents/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
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
    const supabase = createClient();
    const { data: doc } = await supabase.from('documents').select('*').eq('id', params.id).single();
    if (doc?.storage_path) {
      await supabase.storage.from('documents').remove([doc.storage_path]);
    }
    await supabase.from('document_chunks').delete().eq('document_id', params.id);
    await supabase.from('documents').delete().eq('id', params.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
`);

console.log('\n  \u2705 Fixed!\n');
console.log('  Both routes now use @/lib/supabase/server (already installed)');
console.log('  instead of the missing @supabase/auth-helpers-nextjs package.\n');
console.log('  No npm install needed. Just restart:');
console.log('  rmdir /s /q .next');
console.log('  npm run dev\n');
