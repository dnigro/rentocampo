import { demoServiceRegisterHref } from "@/data/visible-demo-services";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { translate } from "@/lib/i18n/messages";
import { servicioLabel } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";

export default async function LiteServiciosListado() {
  const pais = resolveCountry(undefined, (await cookies()).get("rentocampo_country")?.value);
  const t=(key: Parameters<typeof translate>[1])=>translate(pais,key);
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicios_publicaciones")
    .select("id,servicios_rurales,provincia,localidad,zona,activo,country_code")
    .eq("activo",true).eq("country_code",pais).limit(60);
  const { data:demos } = await supabase.from("demo_servicios_rurales")
    .select("id,nombre,servicios_rurales,provincia_servicio,localidad_servicio,zona_servicio,imagen_url")
    .eq("activo",true).eq("country_code",pais).limit(30);
  if(error) return <p role="alert">{t("services.loadError")}</p>;
  return <section style={{display:"grid",gap:12,margin:"24px 0"}}>
    <h2 style={{fontSize:22}}>{t("services.available")} ({(data?.length??0)+(demos?.length??0)})</h2>
    {(data??[]).map(s=><Link key={s.id} href={`/lite/servicios/${s.id}`} style={{padding:18,borderRadius:15,background:"#fff",border:"1px solid #ddd",color:"#222",textDecoration:"none"}}>
      <strong style={{fontSize:18}}>{s.servicios_rurales?.map((v: ServicioRural)=>servicioLabel(v,pais)).join(" · ")||t("services.service")}</strong>
      <p style={{color:"#666"}}>{[s.localidad,s.provincia].filter(Boolean).join(", ")}</p><span style={{float:"right"}}>{t("fields.viewDetails")}</span>
    </Link>)}
    {(demos??[]).map(s=><Link key={s.id} href={demoServiceRegisterHref(pais)} style={{padding:18,borderRadius:15,background:"#fff",border:"1px solid #ddd",color:"#222",textDecoration:"none"}}>
      <Image src={s.imagen_url || "/demo-servicio-veterinaria.jpg"} alt={`Imagen DEMO de ${s.nombre}`} width={460} height={250} style={{display:"block",width:"100%",height:170,objectFit:"cover",borderRadius:9,marginBottom:10}}/><strong>{s.nombre} · DEMO</strong><p>{[s.localidad_servicio,s.provincia_servicio].filter(Boolean).join(", ")}</p><span style={{display:"inline-block",fontSize:13,marginTop:8}}>{pais === "BR" ? "Cadastre-se grátis →" : "Registrate gratis →"}</span>
    </Link>)}
    {!data?.length&&!demos?.length&&<p>{t("services.noResults")}</p>}
    <Link href={`/lite/servicios/mapa?pais=${pais}`} style={{padding:17,textAlign:"center",background:"#222",color:"white",borderRadius:12,textDecoration:"none"}}>{t("services.viewOnMap")}</Link>
  </section>;
}
