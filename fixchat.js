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
  similarity: number;
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
    // 1. Embed the question
    const embedRes = await ollama.embed({ model: EMBED_MODEL, input: question });
    const embedding: number[] = embedRes.embeddings[0];

    // 2. Search vector store via direct REST (avoids JS client vector serialization issues)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    // Get session token for authenticated request
    const { data: { session } } = await supabase.auth.getSession();
    const authToken = session?.access_token ?? anonKey;

    const rpcBody: Record<string, unknown> = {
      query_embedding:    '[' + embedding.join(',') + ']',
      match_org_id:       profile.org_id,
      match_document_ids: documentIds && documentIds.length > 0 ? documentIds : null,
      match_threshold:    0.1,
      match_count:        6,
    };

    const rpcRes = await fetch(supabaseUrl + '/rest/v1/rpc/match_chunks', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        anonKey,
        'Authorization': 'Bearer ' + authToken,
      },
      body: JSON.stringify(rpcBody),
    });

    const chunks = await rpcRes.json() as Chunk[];

    console.log('[chat] chunks found:', chunks?.length ?? 0, 'threshold: 0.1');

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return NextResponse.json({
        answer: 'I could not find relevant information in your documents for this question. Try uploading more relevant documents or rephrasing your question.',
        citations: [],
      });
    }

    // 3. Build context
    const context = chunks
      .map((c, i) => '[Source ' + (i + 1) + ']\n' + c.content)
      .join('\n\n---\n\n');

    // 4. Call Ollama
    const systemPrompt = 'You are PulsarIQ, a precise enterprise AI assistant. Answer questions ONLY using the provided document context. Cite sources using [Source N] notation. Be concise and professional. If the context does not contain the answer, say so clearly.';
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

    // 5. Log analytics
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
      similarity: Math.round(c.similarity * 100),
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

console.log('  \u2713 app/api/chat/route.ts fixed');
console.log('  Stop server \u2192 npm run dev \u2192 test chat');
