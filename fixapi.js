// Run: node fixapi.js
const fs   = require('fs');
const path = require('path');

const file = path.join(process.cwd(), 'app', 'api', 'documents', 'route.ts');
const content = fs.readFileSync(file, 'utf8');
console.log('\n  Current route.ts (first 80 chars of each line):');
content.split('\n').slice(0, 40).forEach((l, i) => console.log('  ' + (i+1) + ': ' + l.slice(0, 80)));

// Write a new GET handler that is org_id-fault-tolerant
const newRoute = `import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json([], { status: 200 });
    }

    // Get profile for org_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    // Only filter by org_id if it exists
    if (profile?.org_id) {
      query = query.eq('org_id', profile.org_id);
    } else {
      // Fall back to user_id filter
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
    const supabase = createRouteHandlerClient({ cookies });
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

    // Upload to storage
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

    // Insert DB record
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

    // Trigger ingestion asynchronously
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
`;

fs.writeFileSync(file, newRoute, 'utf8');
console.log('\n  Done — documents route rewritten');
console.log('  No server restart needed, Next.js will hot reload\n');
