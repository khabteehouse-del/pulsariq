import { NextRequest, NextResponse } from 'next/server';
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

    // Alias real DB column 'name' -> 'filename' for the frontend,
    // which was built expecting .filename. Keeps all page code unchanged.
    const aliased = (data || []).map((doc: any) => ({ ...doc, filename: doc.name }));

    return NextResponse.json(aliased);
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
      return NextResponse.json({ error: 'Unauthorized — please sign in again' }, { status: 401 });
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

    // Real columns: name (not filename), uploaded_by (not user_id).
    const { data: doc, error: dbError } = await adminClient
      .from('documents')
      .insert({
        name: file.name,
        file_type: ext,
        file_size: file.size,
        storage_path: storagePath,
        org_id: profile?.org_id || null,
        uploaded_by: user.id,
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

    return NextResponse.json({ ...doc, filename: doc.name });
  } catch (err: any) {
    console.error('Documents POST exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown server error' }, { status: 500 });
  }
}
