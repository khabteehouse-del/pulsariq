// PulsarIQ — fix3.js
// Replaces broken CSS 3D panel stacking with JS-driven 2D carousel orbit
// Panels never tilt (no lying flat), proper z-index depth every frame
// Run: node fix3.js

const fs   = require('fs');
const path = require('path');
const root = process.cwd();

const pagePath = path.join(root, 'app', 'page.tsx');
let page = fs.readFileSync(pagePath, 'utf8');

const SCENE_START = "      {/* Orbital panels";
const SCENE_END   = "      {/* Nav";

const si = page.indexOf(SCENE_START);
const ei = page.indexOf(SCENE_END);

if (si === -1 || ei === -1) {
  console.log('  ! Could not find panel section markers in app/page.tsx');
  console.log('  si=' + si + ' ei=' + ei);
  process.exit(1);
}

// 1. Add panelRefs + RAF positioning hook right after the canvas useEffect closes
// Find a safe insertion point: right before "const handleLogin"
const hookInsertMarker = '  const handleLogin = async (e: React.FormEvent) => {';
const hookIdx = page.indexOf(hookInsertMarker);

if (hookIdx === -1) {
  console.log('  ! Could not find handleLogin marker');
  process.exit(1);
}

const carouselHook = `  // Carousel-style panel orbit \u2014 JS driven, guarantees correct depth stacking
  const panelRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];
  const panelRaf = useRef<number>(0);

  useEffect(() => {
    const RADIUS_X = 260;
    const RADIUS_Y = 70;
    const SPEED    = 0.0022; // slow, readable
    const OFFSETS  = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    let angle = 0;

    const animate = () => {
      angle += SPEED;
      panelRefs.forEach((ref, i) => {
        const el = ref.current;
        if (!el) return;
        const a = angle + OFFSETS[i];
        const x = Math.cos(a) * RADIUS_X;
        const y = Math.sin(a) * RADIUS_Y;
        const depth = Math.sin(a); // -1 (back) to 1 (front)
        const scale = 0.72 + (depth + 1) / 2 * 0.32;
        const opacity = 0.55 + (depth + 1) / 2 * 0.45;
        const z = Math.round((depth + 1) * 50);
        el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 70).toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
        el.style.zIndex = String(z);
        el.style.opacity = opacity.toFixed(2);
      });
      panelRaf.current = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(panelRaf.current);
  }, []);

`;

page = page.slice(0, hookIdx) + carouselHook + page.slice(hookIdx);

// Re-find scene markers (indices shifted after insertion)
const si2 = page.indexOf(SCENE_START);
const ei2 = page.indexOf(SCENE_END);

const newScene = `      {/* Orbital panels \u2014 JS carousel, flat-facing, correct depth */}
      <div style={{ position:'absolute', inset:0, zIndex:3, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        <div style={{ position:'relative', width:0, height:0 }}>
          <div style={{ position:'absolute', width:'20px', height:'20px', marginLeft:'-10px', marginTop:'-10px', borderRadius:'50%', background:'radial-gradient(circle,#fff 0%,#A5F3FC 35%,rgba(34,211,238,0.1) 100%)', boxShadow:'0 0 30px rgba(34,211,238,0.9)', animation:'corePulse 2s ease-in-out infinite', zIndex:25 }} />
          {PANELS.map((panel, i) => (
            <div key={i} ref={panelRefs[i]} style={{ position:'absolute', width:'170px', marginLeft:'-85px', top:0, left:0, willChange:'transform' }}>
              <div style={{ padding:'13px', borderRadius:'12px', background:'rgba(4,14,28,0.94)', border:'1px solid '+panel.col+'30', backdropFilter:'blur(24px)', boxShadow:'0 0 24px '+panel.col+'15, 0 16px 44px rgba(0,0,0,0.6)', position:'relative', overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'7px' }}>
                  <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:panel.col, boxShadow:'0 0 5px '+panel.col, animation:'glowPulse 2s ease-in-out '+(i*0.4)+'s infinite', flexShrink:0 }} />
                  <span style={{ fontSize:'9px', fontWeight:700, color:panel.col }}>{panel.title}</span>
                </div>
                <div style={{ fontSize:'8px', color:'rgba(226,248,255,0.3)', marginBottom:'8px' }}>{panel.sub}</div>
                {i === 0 && MSGS.map((msg, mi) => (
                  <div key={mi} style={{ display:'flex', justifyContent:msg.r==='user'?'flex-end':'flex-start', marginBottom:'4px' }}>
                    <div style={{ maxWidth:'88%', padding:'3px 7px', borderRadius:msg.r==='user'?'6px 6px 2px 6px':'2px 6px 6px 6px', background:msg.r==='user'?'rgba(34,211,238,0.1)':'rgba(255,255,255,0.04)', border:'1px solid '+(msg.r==='user'?'rgba(34,211,238,0.18)':'rgba(255,255,255,0.06)'), fontSize:'8px', color:msg.r==='ai'?'rgba(226,248,255,0.7)':'#E2F8FF', lineHeight:1.4 }}>{msg.m}</div>
                  </div>
                ))}
                {i === 1 && ['PDF Parsed','Chunks: 847','pgvector: READY'].map((s, si3) => (
                  <div key={si3} style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'4px', animation:'dataFade 3s ease-in-out '+(si3*0.5)+'s infinite' }}>
                    <div style={{ width:'3px', height:'3px', borderRadius:'50%', background:'#6366F1', flexShrink:0 }} />
                    <span style={{ fontSize:'8px', color:'rgba(226,248,255,0.5)' }}>{s}</span>
                  </div>
                ))}
                {i === 2 && (
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'2px', height:'38px' }}>
                    {BARS.map((h, bi) => (
                      <div key={bi} style={{ flex:1, background:'linear-gradient(to top,rgba(34,211,238,0.5),rgba(34,211,238,0.06) 70%,transparent)', borderRadius:'2px 2px 0 0', height:h+'%', minWidth:'3px', border:'1px solid rgba(34,211,238,0.1)', borderBottom:'none' }} />
                    ))}
                  </div>
                )}
                {i === 3 && ['Q4 Financial Report.pdf','Compliance Manual v2.docx','Board Meeting Notes.pdf'].map((d, di) => (
                  <div key={di} style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'3px', padding:'3px 5px', borderRadius:'5px', background:'rgba(245,158,11,0.05)', border:'1px solid rgba(245,158,11,0.1)' }}>
                    <div style={{ width:'3px', height:'3px', borderRadius:'50%', background:'#F59E0B', flexShrink:0 }} />
                    <span style={{ fontSize:'8px', color:'rgba(226,248,255,0.45)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d}</span>
                  </div>
                ))}
                <div style={{ position:'absolute', left:0, right:0, height:'1px', background:'linear-gradient(90deg,transparent,'+panel.col+'40,transparent)', animation:'scanLine 3s linear '+(i*0.8)+'s infinite', top:0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

`;

page = page.slice(0, si2) + newScene + page.slice(ei2);
fs.writeFileSync(pagePath, page, 'utf8');
console.log('  \u2713 app/page.tsx \u2014 panels now use JS carousel orbit (no more stacking, no more lying flat)');
console.log('\n  Run: rmdir /s /q .next && npm run dev\n');
