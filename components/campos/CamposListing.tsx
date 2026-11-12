import CamposMapaUnificado from "@/components/campos/CamposMapaUnificado";
import "@/styles/campos-unificados-v2.css";
import { COUNTRIES, resolveCountry, type CountryCode } from "@/data/countries";
import { campoFilterParams } from "@/lib/campos/filter-params";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import ListingHeader from "@/components/listings/ListingHeader";
import ListingExplorerToolbar from "@/components/listings/ListingExplorerToolbar";
import CampoCard from "@/components/campos/CampoCard";
import CampoFiltros from "@/components/campos/CampoFiltros";
import ListingFiltersPanel from "@/components/listings/ListingFiltersPanel";
import DemandaZonasPanel from "@/components/campos/DemandaZonasPanel";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";
import { regionalText } from "@/lib/i18n/regional";
import { regionalPublicationHref, regionalPublicationLabel } from "@/lib/publicacion-regional";

export interface CamposSearchParams {
  [key: string]: string | undefined;
  pais?: string;
  operacion?: string;
  provincia?: string;
  aptitud?: string;
  hectareas_min?: string;
  hectareas_max?: string;
  precio_min?: string;
  precio_max?: string;
  disponibilidad?: string;
  page?: string;
}

interface Props {
  params: CamposSearchParams;
  titulo?: string;
  descripcion?: string;
  soloAlquiler?: boolean;
}

const PAGE_SIZE = 12;

export default async function CamposListing({ params, titulo, descripcion, soloAlquiler = false }: Props) {
  const page = Math.max(1, Number(params.page ?? 1) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;
  const supabase = await createClient();

  const saved = (await cookies()).get("rentocampo_country")?.value;
  // This SEO landing explicitly describes Argentina, regardless of a visitor's saved region.
  const pais = soloAlquiler ? "AR" : resolveCountry(params.pais, saved);
  const tt=(es:string,pt:string)=>regionalText(pais,es,pt);
  const mapParams = campoFilterParams({ ...params, pais, ...(soloAlquiler ? { operacion: "alquiler_o_ambas" } : {}) });
  let query = supabase
    .from("campos")
    .select("*, fotos:campos_fotos(id, url, orden, storage_path)")
    .eq("status", "activo")
    .eq("country_code", pais)
    .order("created_at", { ascending: false });

  // En landings de alquiler, no presentar avisos declarados solo para venta.
  if (soloAlquiler) query = query.in("operacion", ["alquiler", "ambas"]);
  else if (["alquiler", "venta", "ambas"].includes(params.operacion ?? "")) query = query.eq("operacion", params.operacion!);
  if (params.provincia) query = query.eq("provincia", params.provincia);
  if (params.aptitud) query = query.eq("aptitud", params.aptitud);
  if (params.hectareas_min) query = query.gte("hectareas", Number(params.hectareas_min));
  if (params.hectareas_max) query = query.lte("hectareas", Number(params.hectareas_max));
  if (params.precio_min) query = query.gte("precio", Number(params.precio_min));
  if (params.precio_max) query = query.lte("precio", Number(params.precio_max));
  if (params.disponibilidad === "inmediata") {
    query = query.or(
      `disponibilidad_desde.is.null,disponibilidad_desde.lte.${new Date().toISOString().slice(0, 10)}`,
    );
  }
  if (params.disponibilidad === "campaña_próxima") {
    query = query.gt("disponibilidad_desde", new Date().toISOString().slice(0, 10));
  }

  const [{ data: camposRaw }, { data: { user } }] = await Promise.all([
    query,
    supabase.auth.getUser(),
  ]);

  const camposVisibles = seleccionarCamposPublicos(camposRaw ?? []);
  const count = camposVisibles.length;
  const campos = camposVisibles.slice(from, to);
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const hayFiltros = Object.keys(params).some(
    (key) => key !== "page" && key !== "pais" && params[key],
  );

  const filterHref=(key:string,value:string)=>{const p=new URLSearchParams();for(const [k,v] of Object.entries(params)){if(v&&k!=="page")p.set(k,v)}p.set("pais",pais);if(p.get(key)===value)p.delete(key);else p.set(key,value);return `/campos?${p.toString()}`;};
  const aptitudes=[["agricola","Agrícola"],["ganadera","Ganadero"],["mixta","Mixto"]];
  return <main className="rc-v2-shell">
    <div className="rc-v2-top"><div><h1>{titulo??tt(`Campos disponibles en ${COUNTRIES[pais].name}`,`Terras disponíveis em ${COUNTRIES[pais].name}`)}</h1><p className="rc-v2-sub">{count} {tt("publicaciones · Venta, alquiler y oportunidades rurales","anúncios · Venda, arrendamento e oportunidades rurais")}</p></div><a className="rc-v2-chip" href={regionalPublicationHref({country:pais,kind:"campo",authenticated:Boolean(user)})}>{tt("Publicar gratis","Anunciar grátis")}</a></div>
    <nav className="rc-v2-filters" aria-label="Filtros de campos">
      <a className="rc-v2-chip" href={`/campos?pais=${pais}`}>⚙ {tt("Filtros","Filtros")}</a>
      {([["venta","Venta"],["alquiler","Alquiler"]] as const).map(([value,label])=><Link key={value} className={`rc-v2-chip ${params.operacion===value?"active":""}`} href={filterHref("operacion",value)}>{label}</Link>)}
      {aptitudes.map(([value,label])=><Link key={value} className={`rc-v2-chip ${params.aptitud===value?"active":""}`} href={filterHref("aptitud",value)}>{label}</Link>)}
      <details className="rc-v2-chip"><summary>Hectáreas</summary><div><Link href={filterHref("hectareas_min","100")}>100+ ha</Link> · <Link href={filterHref("hectareas_min","500")}>500+ ha</Link></div></details>
      <Link className="rc-v2-chip" href={`/servicios-rurales?pais=${pais}`}>{tt("Servicios","Serviços")} ↗</Link>
      {hayFiltros&&<Link className="rc-v2-chip" href={`/campos?pais=${pais}`}>✕ Limpiar</Link>}
    </nav>
    <div className="rc-v2-grid">
      <section aria-label="Campos disponibles">
        {campos.length>0?<div className="rc-v2-cards">{campos.map(campo=><div key={campo.id}><CampoCard campo={campo} userId={user?.id}/></div>)}</div>:<div className="rc-v2-empty">{tt("Todavía no hay campos publicados con estos filtros.","Ainda não há terras com estes filtros.")}</div>}
        {totalPages>1&&<nav className="rc-v2-bottom" aria-label="Paginación">{page>1&&<Link className="rc-v2-chip" href={`? ${new URLSearchParams({...params,page:String(page-1)})}`.replace("? ","?")}>← Anterior</Link>} <span>Página {page} de {totalPages}</span> {page<totalPages&&<Link className="rc-v2-chip" href={`?${new URLSearchParams({...params,page:String(page+1)})}`}>Siguiente →</Link>}</nav>}
      </section>
      <aside className="rc-v2-map" aria-label="Mapa interactivo de campos"><CamposMapaUnificado campos={camposVisibles} pais={pais as CountryCode}/></aside>
    </div>
    <div className="rc-v2-bottom"><DemandaZonasPanel country={pais} provincia={params.provincia} authenticated={Boolean(user)} kind="campo"/></div>
  </main>;
}
