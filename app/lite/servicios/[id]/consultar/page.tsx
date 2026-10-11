import Link from "next/link";
import {notFound} from "next/navigation";
import {requireLiteUser} from "@/lib/lite/require-user";
import {createClient} from "@/lib/supabase/server";
import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import LiteServiceConfirm from "@/components/lite/LiteServiceConfirm";
export default async function Page({params}:{params:Promise<{id:string}>}){
 const user=await requireLiteUser();const {id}=await params;const db=await createClient();
 const {data:s}=await db.from("servicios_publicaciones").select("id,propietario_id,servicios_rurales").eq("id",id).eq("activo",true).maybeSingle();
 if(!s)notFound();
 return <LiteWorkflowLayout><div style={{padding:20,maxWidth:520,margin:"auto"}}>
 <Link href={`/lite/servicios/${id}`}>← Volver al servicio</Link>
 <h1 style={{fontSize:27,margin:"22px 0"}}>Consultar servicio</h1>
 {user.id===s.propietario_id?<p>Esta publicación es tuya.</p>:<LiteServiceConfirm usuarioId={s.propietario_id}/>}
 </div></LiteWorkflowLayout>
}