const fs   = require('fs');
const path = require('path');

fs.writeFileSync(
  path.join(process.cwd(), 'app', 'api', 'chat', 'route.ts'),
  String.raw`
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import ollama from 'ollama';

const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? 'all-minilm';
const CHAT_MODEL  = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

interface Chunk {
  id: string;
  document_id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity?: number;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json() as {
    question:     string;
    documentIds?: string[];
  };

  const { question, documentIds } = body;
  if (!question?.trim()) return NextResponse.json({ error: 'Question required' }, { status: 400 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single();

  if (!profile?.org_id) return NextResponse.json({ error: 'No organisation' }, { status: 400 });

  try {
    let chunks: Chunk[] = [];

    // 1. Try vector search
    try {
      const embedRes = await ollama.embed({ model: EMBED_MODEL, input: question });
      const embedding: number[] = embedRes.embeddings[0];

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token ?? anonKey;

      const rpcRes = await fetch(supabaseUrl + '/rest/v1/rpc/match_chunks', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'apikey':        anonKey,
          'Authorization': 'Bearer ' + authToken,
        },
        body: JSON.stringify({
          query_embedding:    '[' + embedding.join(',') + ']',
          match_org_id:       profile.org_id,
          match_document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
          match_threshold:    0.0,
          match_count:        6,
        }),
      });

      const rpcText = await rpcRes.text();
      console.log('[chat] vector RPC status:', rpcRes.status, 'body:', rpcText.slice(0, 200));

      if (rpcRes.ok) {
        const parsed = JSON.parse(rpcText) as Chunk[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          chunks = parsed;
          console.log('[chat] vector search found:', chunks.length, 'chunks');
        }
      }
    } catch (embedErr) {
      console.log('[chat] vector search failed, using fallback:', String(embedErr));
    }

    // 2. Fallback: keyword-based retrieval
    if (chunks.length === 0) {
      console.log('[chat] falling back to keyword retrieval');

      const keywords = question
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 5);

      let query = supabase
        .from('document_chunks')
        .select('id, document_id, content, metadata')
        .eq('org_id', profile.org_id);

      if (documentIds && documentIds.length > 0) {
        query = query.in('document_id', documentIds);
      }

      if (keywords.length > 0) {
        // Search for any keyword in content (case insensitive)
        const ilike = keywords.map(k => 'content.ilike.%' + k + '%').join(',');
        query = query.or(ilike);
      }

      const { data: fallbackChunks } = await query.limit(6);
      chunks = (fallbackChunks ?? []) as Chunk[];
      console.log('[chat] keyword fallback found:', chunks.length, 'chunks');
    }

    // 3. If still nothing, get first chunks of selected docs
    if (chunks.length === 0 && documentIds && documentIds.length > 0) {
      console.log('[chat] getting first chunks of selected documents');
      const { data: firstChunks } = await supabase
        .from('document_chunks')
        .select('id, document_id, content, metadata')
        .eq('org_id', profile.org_id)
        .in('document_id', documentIds)
        .order('chunk_index', { ascending: true })
        .limit(6);
      chunks = (firstChunks ?? []) as Chunk[];
    }

    if (chunks.length === 0) {
      return NextResponse.json({
        answer: 'No document content found. Please upload and wait for documents to finish processing.',
        citations: [],
      });
    }

    // 4. Build context
    const context = chunks
      .map((c, i) => '[Source ' + (i + 1) + ']\n' + c.content)
      .join('\n\n---\n\n');

    // 5. Call Ollama
    const systemPrompt = 'You are PulsarIQ, a precise enterprise AI assistant. Answer questions ONLY using the provided document context. Cite sources using [Source N] notation. Be concise and professional.';
    const userPrompt   = 'DOCUMENT CONTEXT:\n\n' + context + '\n\n---\n\nQUESTION: ' + question + '\n\nAnswer with source citations:';

    const chatRes = await ollama.chat({
      model:    CHAT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
      stream: false,
    });

    const answer = chatRes.message.content;

    // 6. Log analytics
    await supabase.from('analytics_logs').insert({
      org_id:     profile.org_id,
      user_id:    user.id,
      event_type: 'query',
      metadata:   { question: question.slice(0, 100), chunk_count: chunks.length },
    });

    const citations = chunks.map((c, i) => ({
      source:     i + 1,
      chunk_id:   c.id,
      doc_id:     c.document_id,
      excerpt:    c.content.slice(0, 200) + (c.content.length > 200 ? '...' : ''),
      similarity: c.similarity ? Math.round(c.similarity * 100) : null,
    }));

    return NextResponse.json({ answer, citations });

  } catch (err) {
    console.error('[chat] error:', err);
    const msg = String(err);
    if (msg.includes('ECONNREFUSED') || msg.includes('fetch failed')) {
      return NextResponse.json({ error: 'Ollama is not running. Run: ollama serve' }, { status: 503 });
    }
    return NextResponse.json({ error: 'Error: ' + msg }, { status: 500 });
  }
}
`.trimStart(),
  'utf8'
);

console.log('  \u2713 app/api/chat/route.ts updated with fallback search');
console.log('  Stop server \u2192 npm run dev \u2192 test chat');
