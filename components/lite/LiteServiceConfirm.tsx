"use client";
import {useState} from "react";
import Link from "next/link";
export default function LiteServiceConfirm({usuarioId}:{usuarioId:string}){
 const [confirmed,setConfirmed]=useState(false);
 return <section style={{background:"white",padding:22,border:"1px solid #ddd",borderRadius:16}}>
 <p>Vas a abrir una conversación con el prestador. <strong>No se enviará ningún mensaje automáticamente.</strong></p>
 <label style={{display:"flex",gap:12,alignItems:"flex-start",margin:"20px 0"}}>
 <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} style={{width:22,height:22,flexShrink:0}}/>
 <span>Confirmo que quiero contactar al prestador.</span></label>
 {confirmed?<Link href={`/lite/perfil/mensajes/direct/${usuarioId}`} style={{display:"block",textAlign:"center",padding:17,borderRadius:12,background:"#222",color:"white",textDecoration:"none",fontWeight:700}}>Continuar al chat</Link>:<div style={{padding:17,borderRadius:12,background:"#aaa",color:"white",textAlign:"center"}}>Confirmá para continuar</div>}
 </section>
}