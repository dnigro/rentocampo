import { isV3Preview } from "@/lib/v3-routing";
import { v3Text } from "@/lib/i18n/v3-copy";
import { loadServiceDemos } from "@/lib/v3/load-service-demos";
import { demoListingHref } from "@/lib/v3/demo-listings";
import V3RegionalPanel from "../components/V3RegionalPanel";
import RuralIcon from "../components/RuralIcon";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import V3CardPhotos from "../components/V3CardPhotos";
import { demoServicePhoto } from "@/lib/v3/demo-media";
import { cookies } from "next/headers";
import { MapPin, Search, ArrowUpRight, Tractor, ShieldCheck } from "lucide-react";
import { displayCountryName, COUNTRY_CODES_ALPHABETICAL, resolveCountry } from "@/data/countries";
import { SERVICIOS_RURALES, tituloServicioRural, servicioLabel } from "@/data/servicios-rurales";
import { createClient } from "@/lib/supabase/server";
import type { ServicioRural } from "@/types";

export const metadata: Metadata = { title: "Servicios rurales | RentoCampo V3", ...(process.env.VERCEL_ENV !== "production" || isV3Preview(process.env) ? { robots: { index: false, follow: false } } : {}) };

type Filters = { pais?: string; provincia?: string; servicio?: string };
export default async function V3Servicios({ searchParams }: { searchParams: Promise<Filters> }) {
  const params = await searchParams;
  const country = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
  const t = (source: string) => v3Text(country, source);
  const service = SERVICIOS_RURALES.find(item => item.value === params.servicio)?.value;
  const supabase = await createClient();
  let query = supabase.from("servicios_publicaciones")
    .select("id, nombre_comercial, foto_url, provincia, localidad, zona, servicios_rurales, country_code")
    .eq("activo", true).eq("country_code", country).limit(120);
  if (params.provincia?.trim()) query = query.eq("provincia", params.provincia.trim());
  if (service) query = query.contains("servicios_rurales", [service]);
  const { data, error } = await query;
  let references: Awaited<ReturnType<typeof loadServiceDemos>> = [];
  try { references = await loadServiceDemos(country,params.provincia,service); } catch { /* Real providers remain available. */ }
  const servicios = [...(data || []).map(item=>({...item,demo:false})),...references.map(item=>({id:item.sourceId,nombre_comercial:item.titulo,foto_url:item.foto,provincia:item.provincia,localidad:item.localidad,zona:item.coverage,servicios_rurales:item.services,country_code:country,demo:true}))];
  const detailSearch = new URLSearchParams({ pais: country });
  if (params.provincia) detailSearch.set("provincia", params.provincia);
  if (service) detailSearch.set("servicio", service);
  return <section className="v3-catalog v3-services-page">
    <div className="v3-catalog-heading">
      <div><span className="v3-kicker">{t("SERVICIOS PARA EL CAMPO")}</span>
        <h1>{t("Encontrá el servicio que necesitás.")}</h1>
        <p>{t("Conectá con prestadores de")} {displayCountryName(country, country)}. {t("Sin intermediarios.")}</p>
      </div>
    </div>
    <Form action="/v3/servicios" className="v3-marketplace-filters v3-services-filters">
      <label><span>{t("País")}</span><select name="pais" defaultValue={country}>
        {COUNTRY_CODES_ALPHABETICAL.map(code => <option value={code} key={code}>{displayCountryName(code, country)}</option>)}
      </select></label>
      <label><span>{t("Provincia")}</span><input name="provincia" placeholder={t("Cualquier provincia")} defaultValue={params.provincia || ""}/></label>
      <label><span>{t("Especialidad")}</span><select name="servicio" defaultValue={service || ""}>
        <option value="">{t("Todos los servicios")}</option>
        {SERVICIOS_RURALES.map(item => <option value={item.value} key={item.value}>{servicioLabel(item.value, country)}</option>)}
      </select></label>
      <button className="v3-filter-submit" type="submit"><Search size={18}/>{t("Buscar")}</button>
    </Form>
    <div className="v3-marketplace-toolbar"><p><strong>{servicios.length}</strong>{t("prestadores encontrados")}</p>
      <Link className="v3-quiet-action" href={`/v3/servicios?pais=${country}`}>{t("Limpiar filtros")}</Link>
    </div>
    {error && <div className="v3-marketplace-empty" role="alert">{t("No pudimos consultar los servicios. Volvé a intentar.")}</div>}
    {!error && !servicios.length && <div className="v3-marketplace-empty">
      <Tractor size={35}/><h2>{t("Todavía no hay servicios con estos filtros")}</h2><p>{t("Probá otra especialidad o provincia.")}</p>
      <Link href={`/v3/servicios?pais=${country}`}>{t("Ver todos los servicios")}</Link>
    </div>}
    <div className="v3-marketplace-grid v3-service-results">
      {servicios.map(item => {
        const title = tituloServicioRural(item.servicios_rurales as ServicioRural[], country, item.nombre_comercial);
        const detail = item.demo ? demoListingHref(country,"servicio",item.localidad) : `/v3/servicios/${item.id}?${detailSearch}`;
        return <article data-demo={item.demo} className="v3-listing-card" key={item.id}>
          <div className="v3-listing-media">
            <V3CardPhotos country={country} photos={item.foto_url?[item.foto_url]:[]} fallbackPhoto={item.demo ? demoServicePhoto(item.servicios_rurales || []) : undefined} title={title} href={detail}/>
            <span className="v3-listing-badge">{item.demo ? "DEMO · " : ""}{t("Servicio rural")}</span>
          </div>
          <Link className="v3-listing-info" href={detail}>
            <strong>{title}</strong>{item.demo && <span className="rural-demo-note">{t("Ejemplo de referencia. No es una oferta real.")}</span>}
            <span><MapPin size={14}/>{[item.localidad, item.provincia].filter(Boolean).join(", ") || country}</span>
            <div className="rural-card-features">{(item.servicios_rurales || []).slice(0, 3).map((s: ServicioRural) => <span key={s}><RuralIcon name={s}/>{servicioLabel(s, country)}</span>)}</div>
            <span className="v3-listing-details">{item.demo ? t("Publicar en esta zona") : t("Ver prestador")} <ArrowUpRight size={14}/></span>
          </Link>
        </article>;
      })}
    </div>
    {process.env.VERCEL_ENV !== "production" && <div className="v3-safety v3-services-safety"><ShieldCheck size={20}/> {t("Preview de solo lectura: las consultas y publicaciones se habilitan después de aislar Supabase UAT.")}</div>}
    <V3RegionalPanel country={country} kind="servicio" provincia={params.provincia}/>
  </section>;
}
