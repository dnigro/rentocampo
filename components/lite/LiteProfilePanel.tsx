"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "@/lib/supabase/client";
export default function LiteProfilePanel(){
const [email,setEmail]=useState<string|null>(null);const [loading,setLoading]=useState(true);
useEffect(()=>{let active=true;const supabase=createClient();supabase.auth.getUser().then(({data})=>{if(active){setEmail(data.user?.email??null);setLoading(false)}});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(active)setEmail(session?.user?.email??null)});return()=>{active=false;subscription.unsubscribe()}},[]);
return <section style={{padding:"18px",background:"#fff",border:"1px solid #ddd",borderRadius:15,marginTop:18}}><strong>{loading?"Verificando sesión...":email?"Sesión iniciada":"Accedé a tu cuenta"}</strong>{email&&<p style={{fontSize:13,overflowWrap:"anywhere"}}>{email}</p>}{!loading&&(email?<button onClick={async()=>{await createClient().auth.signOut();setEmail(null)}} style={{padding:"12px 18px",border:"1px solid #aaa",borderRadius:10,background:"#fff"}}>Cerrar sesión</button>:<div style={{display:"flex",gap:16,marginTop:12}}><Link href="/lite/cuenta/ingresar">Ingresar</Link><Link href="/lite/cuenta/registro">Registrarme</Link></div>)}</section>}
