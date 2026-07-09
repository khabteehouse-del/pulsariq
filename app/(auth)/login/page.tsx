'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter(), supabase=createClient();
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const { error:err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); } else router.push('/dashboard');
  };
  return (
    <div style={{ minHeight:'100vh', background:'#030B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'500px', height:'350px', background:'radial-gradient(ellipse,rgba(34,211,238,0.07),transparent)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,79,110,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,79,110,0.07) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:'380px', position:'relative', zIndex:2 }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
            <div style={{ width:'28px', height:'28px', position:'relative' }}>
              <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.5)' }} />
              <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />
            </div>
            <span style={{ fontWeight:900, fontSize:'20px', background:'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulsarIQ</span>
          </div>
          <p style={{ fontSize:'11px', color:'rgba(34,211,238,0.4)', letterSpacing:'1.5px' }}>ENTERPRISE AI</p>
        </div>
        <div style={{ padding:'28px', borderRadius:'16px', background:'rgba(5,18,35,0.92)', border:'1px solid rgba(34,211,238,0.15)', backdropFilter:'blur(40px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
          <h2 style={{ fontSize:'18px', fontWeight:800, margin:'0 0 4px', color:'#E2F8FF' }}>Sign in</h2>
          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', margin:'0 0 20px' }}>Access your knowledge base</p>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Work Email</label><input type='email' required value={email} onChange={e=>setEmail(e.target.value)} placeholder='you@company.com' className='inp-field' /></div>
            <div><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>Password</label><input type='password' required value={password} onChange={e=>setPassword(e.target.value)} placeholder='••••••••' className='inp-field' /></div>
            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            <button type='submit' disabled={loading} className='btn-grad' style={{ padding:'11px', borderRadius:'9px', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', marginTop:'4px', boxShadow:'0 4px 20px rgba(34,211,238,0.3)' }}>{loading?'Signing in...':'Sign In'} {!loading&&<ArrowRight size={14}/>}</button>
          </form>
          <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)', marginTop:'18px', marginBottom:0 }}>New to PulsarIQ? <Link href='/signup' style={{ color:'#22D3EE', fontWeight:600, textDecoration:'none' }}>Create workspace</Link></p>
        </div>
      </div>
    </div>
  );
}