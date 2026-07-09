import { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json({ ...doc, filename: doc.name, chunks });
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
