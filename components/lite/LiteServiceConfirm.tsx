"use client";
import {useState} from "react";
import Link from "next/link";
import { useTranslations } from "@/lib/i18n/useTranslations";
export default function LiteServiceConfirm({usuarioId}:{usuarioId:string}){
 const {country}=useTranslations();const tt=(es:string,pt:string)=>country==="BR"?pt:es;
 const [confirmed,setConfirmed]=useState(false);
 return <section style={{background:"white",padding:22,border:"1px solid #ddd",borderRadius:16}}>
 <p>{tt("Vas a abrir una conversación con el prestador.","Você iniciará uma conversa com o prestador.")} <strong>{tt("No se enviará ningún mensaje automáticamente.","Nenhuma mensagem será enviada automaticamente.")}</strong></p>
 <label style={{display:"flex",gap:12,alignItems:"flex-start",margin:"20px 0"}}>
 <input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)} style={{width:22,height:22,flexShrink:0}}/>
 <span>{tt("Confirmo que quiero contactar al prestador.","Confirmo que quero contatar o prestador.")}</span></label>
 {confirmed?<Link href={`/lite/perfil/mensajes/direct/${usuarioId}?borrador=servicio`} style={{display:"block",textAlign:"center",padding:17,borderRadius:12,background:"#222",color:"white",textDecoration:"none",fontWeight:700}}>{tt("Continuar al chat","Continuar para o chat")}</Link>:<div style={{padding:17,borderRadius:12,background:"#aaa",color:"white",textAlign:"center"}}>{tt("Confirmá para continuar","Confirme para continuar")}</div>}
 </section>
}