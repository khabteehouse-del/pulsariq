'use client';

const STEPS = ['Pending', 'Processing', 'Chunking', 'Embedding', 'Ready'];

const STEP_INDEX: Record<string, number> = {
  pending:    0,
  processing: 1,
  chunking:   2,
  embedding:  3,
  ready:      4,
  failed:     -1,
};

interface PipelineStatusProps {
  status: string;
}

export default function PipelineStatus({ status }: PipelineStatusProps) {
  if (status === 'ready') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.25)' }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#22C55E' }} />
        <span style={{ fontSize:10, color:'#22C55E', fontWeight:600 }}>Ready</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:20, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)' }}>
        <div style={{ width:5, height:5, borderRadius:'50%', background:'#EF4444' }} />
        <span style={{ fontSize:10, color:'#EF4444', fontWeight:600 }}>Failed</span>
      </div>
    );
  }

  const current = STEP_INDEX[status] ?? 0;

  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      {STEPS.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
        const pending = i > current;
        return (
          <div key={step} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div
              title={step}
              style={{
                width: active ? 8 : 6,
                height: active ? 8 : 6,
                borderRadius: '50%',
                background: done ? '#6366F1' : active ? '#22D3EE' : 'rgba(255,255,255,0.15)',
                boxShadow: active ? '0 0 8px #22D3EE' : done ? '0 0 4px rgba(99,102,241,0.5)' : 'none',
                transition: 'all 0.3s ease',
              }}
            />
            {i < STEPS.length - 1 && (
              <div style={{ width:12, height:1, background:done ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.1)', transition:'background 0.3s' }} />
            )}
          </div>
        );
      })}
      <span style={{ fontSize:10, color:'#6366F1', fontWeight:600, marginLeft:4, textTransform:'capitalize' }}>{status}</span>
    </div>
  );
}
