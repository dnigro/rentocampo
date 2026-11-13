import RuralIcon from "../components/RuralIcon";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { MapPin, Search, ArrowUpRight, Tractor, ShieldCheck } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, resolveCountry } from "@/data/countries";
import { SERVICIOS_RURALES, tituloServicioRural, servicioLabel } from "@/data/servicios-rurales";
import { createClient } from "@/lib/supabase/server";
import type { ServicioRural } from "@/types";

export const metadata: Metadata = { title: "Servicios rurales | RentoCampo V3", robots: { index: false, follow: false } };

type Filters = { pais?: string; provincia?: string; servicio?: string };
export default async function V3Servicios({ searchParams }: { searchParams: Promise<Filters> }) {
  const params = await searchParams;
  const country = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
  const service = SERVICIOS_RURALES.find(item => item.value === params.servicio)?.value;
  const supabase = await createClient();
  let query = supabase.from("servicios_publicaciones")
    .select("id, nombre_comercial, foto_url, provincia, localidad, zona, servicios_rurales, country_code")
    .eq("activo", true).eq("country_code", country).limit(120);
  if (params.provincia?.trim()) query = query.eq("provincia", params.provincia.trim());
  if (service) query = query.contains("servicios_rurales", [service]);
  const { data, error } = await query;
  const servicios = (data ?? []).filter(item =>
    !String(item.id).startsWith("20000000-") && !String(item.id).startsWith("10000000-")
  );
  const detailSearch = new URLSearchParams({ pais: country });
  if (params.provincia) detailSearch.set("provincia", params.provincia);
  if (service) detailSearch.set("servicio", service);
  return <section className="v3-catalog v3-services-page">
    <div className="v3-catalog-heading">
      <div><span className="v3-kicker">SERVICIOS PARA EL CAMPO</span>
        <h1>Encontrá el servicio que necesitás.</h1>
        <p>Conectá con prestadores de {COUNTRIES[country].name}. Sin intermediarios.</p>
      </div>
    </div>
    <Form action="/v3/servicios" className="v3-marketplace-filters v3-services-filters">
      <label><span>País</span><select name="pais" defaultValue={country}>
        {COUNTRY_CODES_ALPHABETICAL.map(code => <option value={code} key={code}>{COUNTRIES[code].name}</option>)}
      </select></label>
      <label><span>Provincia</span><input name="provincia" placeholder="Cualquier provincia" defaultValue={params.provincia || ""}/></label>
      <label><span>Especialidad</span><select name="servicio" defaultValue={service || ""}>
        <option value="">Todos los servicios</option>
        {SERVICIOS_RURALES.map(item => <option value={item.value} key={item.value}>{servicioLabel(item.value, country)}</option>)}
      </select></label>
      <button className="v3-filter-submit" type="submit"><Search size={18}/> Buscar</button>
    </Form>
    <div className="v3-marketplace-toolbar"><p><strong>{servicios.length}</strong> prestadores encontrados</p>
      <Link className="v3-quiet-action" href={`/v3/servicios?pais=${country}`}>Limpiar filtros</Link>
    </div>
    {error && <div className="v3-marketplace-empty" role="alert">No pudimos consultar los servicios. Volvé a intentar.</div>}
    {!error && !servicios.length && <div className="v3-marketplace-empty">
      <Tractor size={35}/><h2>Todavía no hay servicios con estos filtros</h2><p>Probá otra especialidad o provincia.</p>
      <Link href={`/v3/servicios?pais=${country}`}>Ver todos los servicios</Link>
    </div>}
    <div className="v3-marketplace-grid v3-service-results">
      {servicios.map(item => {
        const title = tituloServicioRural(item.servicios_rurales as ServicioRural[], country, item.nombre_comercial);
        return <article className="v3-listing-card" key={item.id}>
          <div className="v3-listing-media">
            <Link href={`/v3/servicios/${item.id}?${detailSearch}`} aria-label={`Ver ${title}`}>
              {item.foto_url ? <Image src={item.foto_url} alt={title} fill sizes="(max-width:700px) 90vw, 25vw"/> :
                <div className="v3-listing-placeholder"><Tractor size={36}/></div>}
            </Link>
            <span className="v3-listing-badge">Servicio rural</span>
          </div>
          <Link className="v3-listing-info" href={`/v3/servicios/${item.id}?${detailSearch}`}>
            <strong>{title}</strong>
            <span><MapPin size={14}/>{[item.localidad, item.provincia].filter(Boolean).join(", ") || country}</span>
            <div className="rural-card-features">{(item.servicios_rurales || []).slice(0, 3).map((s: ServicioRural) => <span key={s}><RuralIcon name={s}/>{servicioLabel(s, country)}</span>)}</div>
            <span className="v3-listing-details">Ver prestador <ArrowUpRight size={14}/></span>
          </Link>
        </article>;
      })}
    </div>
    <div className="v3-safety v3-services-safety"><ShieldCheck size={20}/> Preview de solo lectura: las consultas y publicaciones se habilitan después de aislar Supabase UAT.</div>
  </section>;
}
