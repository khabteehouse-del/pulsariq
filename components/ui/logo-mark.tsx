'use client';

export default function LogoMark({ size=30 }: { size?:number }) {
  const orbits = [
    { r:size*0.75, dur:'4s', delay:'0s',   col:'#22D3EE', sz:2 },
    { r:size*0.95, dur:'6s', delay:'1.5s',  col:'#6366F1', sz:1.5 },
    { r:size*0.62, dur:'3s', delay:'0.8s',  col:'#22D3EE', sz:1.2 },
  ];
  return (
    <div style={{ width:size+'px', height:size+'px', position:'relative', flexShrink:0 }}>
      {/* Orbital particles */}
      {orbits.map((o,i) => (
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          marginTop:'-1px', marginLeft:'-1px',
          width:'2px', height:'2px',
          animation:'orbitLogo '+o.dur+' linear '+o.delay+' infinite',
          ['--r' as string]: o.r+'px',
        } as React.CSSProperties}>
          <div style={{ width:o.sz+'px', height:o.sz+'px', borderRadius:'50%', background:o.col, boxShadow:'0 0 4px '+o.col, marginLeft:'-'+(o.sz/2)+'px', marginTop:'-'+(o.sz/2)+'px' }} />
        </div>
      ))}
      {/* Core rings */}
      <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.4)', animation:'glowPulse 2.5s ease-in-out infinite' }} />
      <div style={{ position:'absolute', inset: (size*0.18)+'px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:(size*0.26)+'px', height:(size*0.26)+'px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 8px #22D3EE' }} />
    </div>
  );
}