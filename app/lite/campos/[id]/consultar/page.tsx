import Link from "next/link";
import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import MensajeHilo from "@/components/mensajes/MensajeHilo";
import {requireLiteUser} from "@/lib/lite/require-user";
import {createClient} from "@/lib/supabase/server";
import {notFound} from "next/navigation";
import "@/styles/mensajes.css";
export default async function Page({params}:{params:Promise<{id:string}>}){
 const user=await requireLiteUser();const {id}=await params;const db=await createClient();
 const {data:c}=await db.from("campos").select("id,titulo,propietario_id,status").eq("id",id).eq("status","activo").maybeSingle();
 if(!c)notFound();
 const {data:mensajes}=await db.from("mensajes").select("id,contenido,created_at,leido,remitente_id,remitente:profiles!mensajes_remitente_id_fkey(id,nombre,avatar_url)").eq("campo_id",id).or(`remitente_id.eq.${user.id},destinatario_id.eq.${user.id}`).order("created_at",{ascending:true});
 const iniciales=(mensajes??[]).map(m=>({...m,remitente:Array.isArray(m.remitente)?(m.remitente[0]??null):m.remitente}));
 return <LiteWorkflowLayout><div style={{padding:"20px 16px",maxWidth:580,margin:"auto"}}>
 <Link href={`/lite/campos/${id}`}>← Volver al campo</Link>
 <h1 style={{fontSize:26,margin:"18px 0"}}>Consultar: {c.titulo}</h1>
 {user.id===c.propietario_id?<p>Esta publicación es tuya.</p>:<>
 <p style={{color:"#555"}}>Escribí tu consulta. <strong>No se enviará nada hasta que pulses «Enviar».</strong></p>
 <MensajeHilo campoId={id} userId={user.id} destinatarioId={c.propietario_id} mensajesIniciales={iniciales}/>
 </>}</div></LiteWorkflowLayout>
}