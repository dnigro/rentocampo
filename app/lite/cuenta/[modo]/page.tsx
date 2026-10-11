import LiteHeader from "@/components/lite/LiteHeader";
import LiteAuth from "@/components/lite/LiteAuth";
import Link from "next/link";
export default async function Page({params}:{params:Promise<{modo:string}>}){const {modo}=await params;if(modo!=="ingresar"&&modo!=="registro"&&modo!=="recuperar")return <Link href="/lite/perfil">Volver</Link>;return <><LiteHeader/><LiteAuth mode={modo}/></>}