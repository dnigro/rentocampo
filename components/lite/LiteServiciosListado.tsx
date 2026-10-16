import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";

export default async function LiteServiciosListado() {
  const pais = resolveCountry(undefined, (await cookies()).get("rentocampo_country")?.value);
  const supabase = await createClient();
  const { data, error } = await supabase.from("servicios_publicaciones")
    .select("id,servicios_rurales,provincia,localidad,zona,activo,country_code")
    .eq("activo",true).eq("country_code",pais).limit(60);
  const { data:demos } = await supabase.from("demo_servicios_rurales")
    .select("id,nombre,servicios_rurales,provincia_servicio,localidad_servicio,zona_servicio")
    .eq("activo",true).eq("country_code",pais).limit(30);
  if(error) return <p role="alert">No pudimos cargar los servicios.</p>;
  return <section style={{display:"grid",gap:12,margin:"24px 0"}}>
    <h2 style={{fontSize:22}}>Servicios disponibles ({(data?.length??0)+(demos?.length??0)})</h2>
    {(data??[]).map(s=><Link key={s.id} href={`/lite/servicios/${s.id}`} style={{padding:18,borderRadius:15,background:"#fff",border:"1px solid #ddd",color:"#222",textDecoration:"none"}}>
      <strong style={{fontSize:18}}>{s.servicios_rurales?.join(" · ")||"Servicio rural"}</strong>
      <p style={{color:"#666"}}>{[s.localidad,s.provincia].filter(Boolean).join(", ")}</p><span style={{float:"right"}}>Ver ficha ↗</span>
    </Link>)}
    {(demos??[]).map(s=><Link key={s.id} href={`/lite/servicios/filtrar?pais=${pais}`} style={{padding:18,borderRadius:15,background:"#fff",border:"1px solid #ddd",color:"#222",textDecoration:"none"}}>
      <strong>{s.nombre} · DEMO</strong><p>{[s.localidad_servicio,s.provincia_servicio].filter(Boolean).join(", ")}</p>
    </Link>)}
    {!data?.length&&!demos?.length&&<p>No hay servicios publicados en este momento.</p>}
    <Link href={`/lite/servicios/mapa?pais=${pais}`} style={{padding:17,textAlign:"center",background:"#222",color:"white",borderRadius:12,textDecoration:"none"}}>Ver servicios en el mapa ↗</Link>
  </section>;
}
