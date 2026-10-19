import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";
import { translate } from "@/lib/i18n/messages";

export default async function LiteCamposListado() {
  const pais = resolveCountry(undefined, (await cookies()).get("rentocampo_country")?.value);
  const t=(key: Parameters<typeof translate>[1])=>translate(pais,key);
  const supabase = await createClient();
  let query = supabase.from("campos")
    .select("id,titulo,provincia,localidad,hectareas,aptitud,status,country_code,created_at")
    .eq("status","activo");
  query = pais === "AR" ? query.or("country_code.eq.AR,country_code.is.null") : query.eq("country_code",pais);
  const { data, error } = await query.order("created_at",{ascending:false}).limit(80);
  if (error) return <p role="alert">{t("fields.loadError")}</p>;
  const campos = seleccionarCamposPublicos(data ?? []);
  return <section style={{display:"grid",gap:12,margin:"24px 0"}}>
    <h2 style={{fontSize:22}}>{t("fields.available")} ({campos.length})</h2>
    {campos.map(c=><Link key={c.id} href={`/lite/campos/${c.id}`} style={{padding:18,borderRadius:15,background:"#fff",border:"1px solid #ddd",color:"#222",textDecoration:"none"}}>
      <strong style={{fontSize:18}}>{c.titulo||t("fields.availableSingle")}</strong>
      <p style={{color:"#666",marginBottom:8}}>{[c.localidad,c.provincia].filter(Boolean).join(", ")}</p>
      <span style={{fontSize:13}}>{c.hectareas?c.hectareas+" ha":""} {c.aptitud?" · "+c.aptitud:""}</span><span style={{float:"right"}}>{t("fields.viewDetails")}</span>
    </Link>)}
    {campos.length===0&&<p>{t("fields.noResults")}</p>}
    <Link href={`/lite/campos/mapa?pais=${pais}`} style={{padding:17,textAlign:"center",background:"#222",color:"white",borderRadius:12,textDecoration:"none"}}>{t("fields.viewOnMap")}</Link>
  </section>;
}
