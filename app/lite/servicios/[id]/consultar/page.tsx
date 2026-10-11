import Link from "next/link";
import {notFound} from "next/navigation";
import {requireLiteUser} from "@/lib/lite/require-user";
import {createClient} from "@/lib/supabase/server";
import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";

export default async function Page({params}:{params:Promise<{id:string}>}){
 const user=await requireLiteUser();const {id}=await params;const db=await createClient();
 const {data:s}=await db.from("servicios_publicaciones").select("id,propietario_id,servicios_rurales").eq("id",id).eq("activo",true).maybeSingle();
 if(!s)notFound();
 return <LiteWorkflowLayout><div style={{padding:20,maxWidth:520,margin:"auto"}}>
 <Link href={`/lite/servicios/${id}`}>← Volver al servicio</Link>
 <h1 style={{fontSize:27,margin:"22px 0"}}>Consultar servicio</h1>
 {user.id===s.propietario_id?<p>Esta publicación es tuya.</p>:<><p>Podés escribirle al prestador desde el chat. No se enviará ningún mensaje hasta que presiones «Enviar».</p><Link href={`/lite/perfil/mensajes/direct/${s.propietario_id}`} style={{display:"block",padding:17,textAlign:"center",background:"#222",color:"#fff",borderRadius:12,textDecoration:"none",fontWeight:700}}>Abrir chat y escribir mensaje →</Link></>}
 </div></LiteWorkflowLayout>
}