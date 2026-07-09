'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Topbar from '@/components/layout/topbar';
import { Shield, Users, Crown, Eye, Edit, Mail } from 'lucide-react';

const C: React.CSSProperties = { background:'rgba(5,18,35,0.88)', border:'1px solid rgba(34,211,238,0.12)', borderRadius:'14px', backdropFilter:'blur(20px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' };
const ROLES:Record<string,{col:string;icon:any;desc:string}> = {
  admin:   {col:'#F59E0B',icon:Crown,desc:'Full access — manage users, documents and settings'},
  manager: {col:'#6366F1',icon:Edit, desc:'Upload documents and manage team content'},
  viewer:  {col:'#22D3EE',icon:Eye,  desc:'Read-only access to documents and AI chat'},
};

export default function AccessPage() {
  const [profile,setProfile]=useState<any>(null);
  const [members,setMembers]=useState<any[]>([]);
  const [invite,setInvite]=useState('');
  const [role,setRole]=useState('viewer');
  const [msg,setMsg]=useState('');
  const supabase=createClient();
  useEffect(()=>{
    supabase.auth.getUser().then(async({data:{user}})=>{
      if(!user) return;
      const{data:p}=await supabase.from('profiles').select('*').eq('id',user.id).single();
      setProfile({...p,email:user.email});
      if(p?.org_id){const{data:m}=await supabase.from('profiles').select('*').eq('org_id',p.org_id);setMembers(m||[]);}
    });
  },[]);
  const send=()=>{ if(!invite) return; setMsg('Invite sent to '+invite); setInvite(''); setTimeout(()=>setMsg(''),4000); };
  const ri=ROLES[profile?.role]||ROLES.viewer;
  const RIcon=ri.icon;
  return(
    <div style={{ minHeight:'100vh',background:'transparent' }}>
      <Topbar title='Access Control'/>
      <div style={{ padding:'24px',display:'flex',flexDirection:'column',gap:'18px',maxWidth:'800px' }}>
        <div style={{ ...C,padding:'22px',background:'linear-gradient(135deg,rgba(245,158,11,0.06),rgba(5,18,35,0.95))',border:'1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'12px' }}>
            <div style={{ width:'44px',height:'44px',borderRadius:'12px',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',display:'flex',alignItems:'center',justifyContent:'center' }}><Shield size={20} color='#F59E0B'/></div>
            <div>
              <div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)',marginBottom:'2px' }}>YOUR ROLE</div>
              <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                <span style={{ fontSize:'18px',fontWeight:800,color:'#E2F8FF' }}>{profile?.role?.toUpperCase()||'VIEWER'}</span>
                <div style={{ padding:'3px 9px',borderRadius:'12px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.25)',fontSize:'10px',fontWeight:700,color:'#F59E0B' }}>ACTIVE</div>
              </div>
              <div style={{ fontSize:'12px',color:'rgba(226,248,255,0.4)',marginTop:'2px' }}>{ri.desc}</div>
            </div>
          </div>
        </div>
        <div style={C}>
          <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)' }}><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Permission Levels</h3></div>
          <div style={{ padding:'14px',display:'flex',flexDirection:'column',gap:'8px' }}>
            {Object.entries(ROLES).map(([r,m])=>{ const Icon=m.icon; const isMe=profile?.role===r; return(
              <div key={r} className='list-row' style={{ cursor:'default',background:isMe?m.col+'0A':'rgba(34,211,238,0.02)',border:'1px solid '+(isMe?m.col+'25':'rgba(34,211,238,0.07)') }}>
                <div style={{ width:'32px',height:'32px',borderRadius:'9px',background:m.col+'14',border:'1px solid '+m.col+'22',display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={14} color={m.col}/></div>
                <div style={{ flex:1 }}><div style={{ fontSize:'12px',fontWeight:700,color:'#E2F8FF',textTransform:'capitalize' }}>{r}{isMe&&<span style={{ fontSize:'9px',color:m.col,marginLeft:'6px' }}>YOU</span>}</div><div style={{ fontSize:'11px',color:'rgba(226,248,255,0.4)' }}>{m.desc}</div></div>
                <div style={{ width:'8px',height:'8px',borderRadius:'50%',background:m.col,boxShadow:'0 0 6px '+m.col }} />
              </div>);})}
          </div>
        </div>
        <div style={C}>
          <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Team Members</h3>
            <div style={{ display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'rgba(34,211,238,0.5)' }}><Users size={12}/>{members.length}</div>
          </div>
          <div style={{ padding:'10px' }}>
            {members.map(m=>{ const meta=ROLES[m.role]||ROLES.viewer; const Icon=meta.icon; return(
              <div key={m.id} className='list-row' style={{ marginBottom:'5px',cursor:'default' }}>
                <div style={{ width:'32px',height:'32px',borderRadius:'50%',background:'linear-gradient(135deg,#22D3EE,#6366F1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:700,color:'#fff',flexShrink:0 }}>{m.full_name?.[0]?.toUpperCase()||m.email?.[0]?.toUpperCase()||'U'}</div>
                <div style={{ flex:1,overflow:'hidden' }}><div style={{ fontSize:'12px',color:'#E2F8FF',fontWeight:500 }}>{m.full_name||'No name'}</div><div style={{ fontSize:'10px',color:'rgba(226,248,255,0.35)' }}>{m.email}</div></div>
                <div style={{ display:'flex',alignItems:'center',gap:'4px',padding:'2px 8px',borderRadius:'9px',background:meta.col+'12',border:'1px solid '+meta.col+'25',fontSize:'9px',fontWeight:700,color:meta.col,flexShrink:0 }}><Icon size={9}/>{m.role}</div>
              </div>);
            })}
            {members.length===0&&<div style={{ padding:'20px',textAlign:'center',fontSize:'12px',color:'rgba(226,248,255,0.3)' }}>No members found.</div>}
          </div>
        </div>
        {profile?.role==='admin'&&(
          <div style={C}>
            <div style={{ padding:'16px 18px',borderBottom:'1px solid rgba(34,211,238,0.07)' }}><h3 style={{ fontSize:'13px',fontWeight:700,color:'#E2F8FF',margin:0 }}>Invite Team Member</h3></div>
            <div style={{ padding:'16px',display:'flex',gap:'10px' }}>
              <input value={invite} onChange={e=>setInvite(e.target.value)} placeholder='colleague@company.com' className='inp-field' style={{ flex:1 }}/>
              <select value={role} onChange={e=>setRole(e.target.value)} className='inp-field' style={{ flex:'0 0 110px' }}><option value='viewer'>Viewer</option><option value='manager'>Manager</option><option value='admin'>Admin</option></select>
              <button onClick={send} className='btn-glass' style={{ display:'flex',alignItems:'center',gap:'5px',padding:'9px 16px',borderRadius:'9px',fontSize:'12px',whiteSpace:'nowrap',flexShrink:0 }}><Mail size={13}/>Send Invite</button>
            </div>
            {msg&&<div style={{ padding:'8px 16px',fontSize:'12px',color:'#22C55E' }}>{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}