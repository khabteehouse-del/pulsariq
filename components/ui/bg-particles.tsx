'use client';
import { useEffect, useRef } from 'react';

export default function BgParticles() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const rsz = () => { c.width=c.offsetWidth; c.height=c.offsetHeight; };
    rsz(); window.addEventListener('resize', rsz);
    const ctx = c.getContext('2d'); if (!ctx) return;
    const pts = Array.from({length:55}, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random()-0.5)*0.00012, vy: (Math.random()-0.5)*0.00012,
      r: Math.random()*1.2+0.2, op: Math.random()*0.25+0.05,
      phase: Math.random()*Math.PI*2, speed: Math.random()*0.008+0.004,
      col: Math.random()>0.5 ? '34,211,238' : '99,102,241',
    }));
    let frame = 0;
    const draw = () => {
      frame++; const W=c.width, H=c.height;
      ctx.clearRect(0,0,W,H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.phase += p.speed;
        if(p.x<0) p.x=1; if(p.x>1) p.x=0;
        if(p.y<0) p.y=1; if(p.y>1) p.y=0;
        const pulse = (Math.sin(p.phase)+1)/2;
        const op = p.op * (0.6 + pulse*0.4);
        ctx.beginPath(); ctx.arc(p.x*W, p.y*H, p.r, 0, Math.PI*2);
        ctx.fillStyle = 'rgba('+p.col+','+op.toFixed(2)+')'; ctx.fill();
      });
      // Faint connection lines
      for(let i=0;i<pts.length;i++){
        for(let j=i+1;j<pts.length;j++){
          const dx=(pts[i].x-pts[j].x)*W, dy=(pts[i].y-pts[j].y)*H;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<90){
            const op=(1-dist/90)*0.06;
            ctx.beginPath(); ctx.moveTo(pts[i].x*W,pts[i].y*H); ctx.lineTo(pts[j].x*W,pts[j].y*H);
            ctx.strokeStyle='rgba(34,211,238,'+op.toFixed(3)+')'; ctx.lineWidth=0.4; ctx.stroke();
          }
        }
      }
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener('resize',rsz); };
  },[]);
  return <canvas ref={ref} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }} />;
}