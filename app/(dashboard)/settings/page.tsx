'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Topbar from '@/components/layout/topbar';
import { User, Shield, Database, Save, CheckCircle } from 'lucide-react';

const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', padding:'22px' };

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [saved,   setSaved]   = useState(false);
  const supabase = createClient();
  useEffect(()=>{
    supabase.auth.getUser().then(async({data:{user}})=>{
      if(!user) return;
      const{data:p}=await supabase.from('profiles').select('*').eq('id',user.id).single();
      setProfile({...(p||{}),email:user.email});
    });
  },[]);
  const save=async()=>{
    const{data:{user}}=await supabase.auth.getUser();
    if(!user||!profile) return;
    await supabase.from('profiles').update({full_name:profile.full_name}).eq('id',user.id);
    setSaved(true); setTimeout(()=>setSaved(false),2500);
  };
  return (
    <div style={{ minHeight:'100vh', background:'transparent' }}>
      <Topbar title='Settings' />
      <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'16px', maxWidth:'600px' }}>
        <div style={C}>
          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'18px' }}><User size={15} color='#22D3EE'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Profile</h3></div>
          <div style={{ display:'flex',flexDirection:'column',gap:'12px' }}>
            {[{l:'Full Name',k:'full_name',t:'text'},{l:'Email',k:'email',t:'email'}].map(({l,k,t})=>(
              <div key={k}><label style={{ fontSize:'11px',color:'rgba(226,248,255,0.45)',display:'block',marginBottom:'5px' }}>{l}</label><input type={t} value={profile?.[k]||''} disabled={k==='email'} onChange={e=>setProfile((p:any)=>({...p,[k]:e.target.value}))} className='inp-field' style={{ opacity:k==='email'?0.5:1 }}/></div>
            ))}
            <button onClick={save} className='btn-glass' style={{ padding:'9px 18px',borderRadius:'9px',fontSize:'12px',width:'fit-content' }}>
              {saved?<><CheckCircle size={13}/>Saved!</>:<><Save size={13}/>Save Changes</>}
            </button>
          </div>
        </div>
        <div style={C}>
          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'14px' }}><Shield size={15} color='#F59E0B'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Security</h3></div>
          {[{l:'Role',v:profile?.role||'viewer'},{l:'Org ID',v:(profile?.org_id||'—').slice(0,18)+'...'}].map(({l,v})=>(<div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(34,211,238,0.06)' }}><span style={{ fontSize:'12px',color:'rgba(226,248,255,0.45)' }}>{l}</span><span style={{ fontSize:'12px',color:'#E2F8FF',fontWeight:600 }}>{v}</span></div>))}
        </div>
        <div style={C}>
          <div style={{ display:'flex',alignItems:'center',gap:'7px',marginBottom:'14px' }}><Database size={15} color='#6366F1'/><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>AI Configuration</h3></div>
          {[{l:'Embedding Model',v:'all-minilm (384D)'},{l:'Chat Model',v:'tinyllama'},{l:'Vector Dims',v:'384'},{l:'Search',v:'pgvector + fallback'}].map(({l,v})=>(<div key={l} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid rgba(34,211,238,0.06)' }}><span style={{ fontSize:'12px',color:'rgba(226,248,255,0.45)' }}>{l}</span><span style={{ fontSize:'11px',color:'#22D3EE',fontWeight:600,fontFamily:'monospace' }}>{v}</span></div>))}
        </div>
      </div>
    </div>
  );
}