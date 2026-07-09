import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { processDocument } from '@/lib/ingestion';

// POST /api/ingest  body: { documentId: string }
// Re-trigger ingestion (useful for retrying failed documents)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!['admin', 'manager'].includes(profile?.role ?? ''))
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

  const body = await request.json() as { documentId?: string };
  if (!body.documentId)
    return NextResponse.json({ error: 'documentId required' }, { status: 400 });

  // Fire and forget
  processDocument(body.documentId).catch(console.error);

  return NextResponse.json({ message: 'Ingestion started', documentId: body.documentId });
}
