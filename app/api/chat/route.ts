import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.message !== 'string' || !body.message.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const message     = body.message.trim();
    const documentIds: string[] = Array.isArray(body.documentIds) ? body.documentIds : [];

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (documentIds.length === 0) {
      return NextResponse.json({ error: 'No documents selected' }, { status: 400 });
    }

    const { data: chunkRows, error: chunkError } = await supabase
      .from('document_chunks')
      .select('content, document_id, chunk_index')
      .in('document_id', documentIds)
      .order('chunk_index', { ascending: true })
      .limit(60);

    if (chunkError) {
      return NextResponse.json({ error: 'Database: ' + chunkError.message }, { status: 500 });
    }

    const chunks = chunkRows || [];
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No indexed content found. The document may still be processing.' }, { status: 400 });
    }

    const keywords = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const scored = chunks.map((c: any) => {
      const text = (c.content || '').toLowerCase();
      const score = keywords.reduce((acc, kw) => acc + (text.includes(kw) ? 1 : 0), 0);
      return { ...c, score };
    });
    scored.sort((a: any, b: any) => b.score - a.score);
    const topChunks = scored.slice(0, 6);

    const { data: docsForCitation } = await supabase
      .from('documents')
      .select('id, name')
      .in('id', documentIds);

    const docNameMap: Record<string, string> = {};
    (docsForCitation || []).forEach((d: any) => { docNameMap[d.id] = d.name; });

    const contextText = topChunks
      .map((c: any, i: number) => '[' + (i + 1) + '] ' + (c.content || '').slice(0, 600))
      .join('\n\n');

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json({ error: 'GROQ_API_KEY not set in .env.local' }, { status: 500 });
    }

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + groqKey,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.2,
        max_tokens: 512,
        messages: [
          {
            role: 'system',
            content: 'You are a precise document assistant. Answer using ONLY the provided context. Be concise and factual. Never make up information. If the answer is not in the context, say so briefly.',
          },
          {
            role: 'user',
            content: 'Context:\n' + contextText + '\n\nQuestion: ' + message,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return NextResponse.json({ error: 'Groq API error (' + groqRes.status + '). Check your GROQ_API_KEY.' }, { status: 502 });
    }

    const groqData = await groqRes.json();
    const answer   = groqData.choices?.[0]?.message?.content || 'No response generated.';

    const seen = new Set<string>();
    const citations: { source: string }[] = [];
    topChunks.forEach((c: any) => {
      const name = docNameMap[c.document_id] || 'Unknown document';
      if (!seen.has(name)) { seen.add(name); citations.push({ source: name }); }
    });

    return NextResponse.json({ answer, citations });
  } catch (err: any) {
    console.error('Chat exception:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}
