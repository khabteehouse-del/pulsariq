'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [form,setForm]=useState({name:'',email:'',password:'',org:''});
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();
  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res=await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
      const data=await res.json();
      if (!res.ok) throw new Error(data.error||'Signup failed');
      const {createClient}=await import('@/lib/supabase/client');
      const {error:se}=await createClient().auth.signInWithPassword({email:form.email,password:form.password});
      if (se) throw se;
      router.push('/dashboard');
    } catch (err:any) { setError(err.message||'Something went wrong'); setLoading(false); }
  };
  const inp: React.CSSProperties = { width:'100%', padding:'10px 12px', background:'rgba(34,211,238,0.04)', border:'1px solid rgba(34,211,238,0.18)', borderRadius:'9px', color:'#E2F8FF', fontSize:'13px', outline:'none', boxSizing:'border-box' as const, fontFamily:'Inter,sans-serif' };
  return (
    <div style={{ minHeight:'100vh', background:'#030B14', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:'600px', height:'400px', background:'radial-gradient(ellipse,rgba(34,211,238,0.07),transparent)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(13,79,110,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(13,79,110,0.07) 1px,transparent 1px)', backgroundSize:'48px 48px', pointerEvents:'none' }} />
      <div style={{ width:'100%', maxWidth:'400px', position:'relative', zIndex:2 }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px' }}>
            <div style={{ width:'28px', height:'28px', position:'relative' }}>
              <div style={{ position:'absolute', inset:0, border:'1.5px solid #22D3EE', borderRadius:'50%', boxShadow:'0 0 10px rgba(34,211,238,0.5)' }} />
              <div style={{ position:'absolute', inset:'5px', border:'1px solid rgba(99,102,241,0.5)', borderRadius:'50%' }} />
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:'7px', height:'7px', borderRadius:'50%', background:'radial-gradient(circle,#fff,#22D3EE)', boxShadow:'0 0 6px #22D3EE' }} />
            </div>
            <span style={{ fontWeight:900, fontSize:'20px', background:'linear-gradient(90deg,#E2F8FF,#22D3EE)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>PulsarIQ</span>
          </div>
        </div>
        <div style={{ padding:'28px', borderRadius:'16px', background:'rgba(5,18,35,0.92)', border:'1px solid rgba(34,211,238,0.15)', backdropFilter:'blur(40px)', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
          <h2 style={{ fontSize:'18px', fontWeight:800, margin:'0 0 4px', color:'#E2F8FF' }}>Create workspace</h2>
          <p style={{ fontSize:'12px', color:'rgba(226,248,255,0.4)', margin:'0 0 20px' }}>Set up your enterprise knowledge base</p>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'11px' }}>
            {[{k:'name',l:'Full Name',t:'text',ph:'John Smith'},{k:'org',l:'Organisation',t:'text',ph:'Acme Corp'},{k:'email',l:'Work Email',t:'email',ph:'you@company.com'},{k:'password',l:'Password',t:'password',ph:'••••••••'}].map(({k,l,t,ph})=>(
              <div key={k}><label style={{ fontSize:'11px', color:'rgba(226,248,255,0.45)', display:'block', marginBottom:'5px' }}>{l}</label><input type={t} required value={(form as any)[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} placeholder={ph} style={inp} /></div>
            ))}
            {error && <div style={{ fontSize:'11px', color:'#EF4444', padding:'7px 10px', background:'rgba(239,68,68,0.08)', borderRadius:'7px', border:'1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
            <button type='submit' disabled={loading} style={{ padding:'11px', borderRadius:'9px', background:'linear-gradient(135deg,#22D3EE,#6366F1)', border:'none', color:'#fff', fontSize:'13px', fontWeight:700, cursor:loading?'wait':'pointer', opacity:loading?0.7:1, boxShadow:'0 4px 20px rgba(34,211,238,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'7px', marginTop:'4px' }}>{loading?'Creating...':'Create Workspace'} {!loading&&<ArrowRight size={14}/>}</button>
          </form>
          <p style={{ textAlign:'center', fontSize:'12px', color:'rgba(226,248,255,0.3)', marginTop:'16px', marginBottom:0 }}>Already have an account? <Link href='/login' style={{ color:'#22D3EE', fontWeight:600, textDecoration:'none' }}>Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}