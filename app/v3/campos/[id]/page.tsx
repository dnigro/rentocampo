import type { Metadata } from "next";
import V3PhotoGallery from "../../components/V3PhotoGallery";
import Link from "next/link";
import V3DetailFacts from "../../components/V3DetailFacts";
import V3LocationMap from "../../components/V3LocationMap";
import { COUNTRIES, resolveCountry, displayCountryName } from "@/data/countries";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
import { MapPin, ArrowLeft, ShieldCheck, MessageCircle } from "lucide-react";
import { addMapBounds, parseMapBounds } from "@/lib/campos/map-search";
import { campoFilterParams } from "@/lib/campos/filter-params";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };
export const metadata: Metadata = { title: "Detalle de campo | RentoCampo V3", robots: { index: false, follow: false } };

export default async function V3CampoDetalle({ params, searchParams }: Props) {
  const { id } = await params;
  if (!/^[\da-f-]{36}$/i.test(id)) notFound();
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: campo, error } = await supabase
    .from("campos")
    .select("id, titulo, descripcion, localidad, provincia, country_code, hectareas, aptitud, operacion, precio, moneda, mejoras, ambiente, departamento, disponibilidad, disponibilidad_desde, rendimiento_estimado, latitud, longitud, fotos:campos_fotos(url, orden)")
    .eq("id", id).eq("status", "activo").maybeSingle();
  if (error || !campo || String(campo.id).startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "")) notFound();
  const images = [...(campo.fotos || [])].filter(f => Boolean(f.url)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8);
  const country = resolveCountry(campo.country_code);
  const format = (v: number) => Number(v).toLocaleString(COUNTRIES[country].locale);
  const lat = normalizarCoordenada(campo.latitud), lng = normalizarCoordenada(campo.longitud);
  const hasLocation = lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const price = campo.precio != null ? `${campo.moneda || "Moneda a confirmar"} ${format(campo.precio)}` : "Precio a consultar";
  const aptitude = ({agricola:"Agrícola",ganadera:"Ganadera",mixta:"Mixta",forestal:"Forestal"} as Record<string,string>)[campo.aptitud || ""] || campo.aptitud;
  const backSearch = addMapBounds(campoFilterParams({ ...filters, pais: campo.country_code || "AR" }), parseMapBounds(filters));
  if (filters.moneda && /^[A-Z]{3}$/.test(filters.moneda)) backSearch.set("moneda", filters.moneda);
  return <article className="v3-detail v3-detail-refined">
    <Link href={`/v3/campos?${backSearch.toString()}`} className="v3-detail-back"><ArrowLeft size={17}/> Volver al explorador</Link>
    <div className="v3-detail-eyebrow">CAMPOS · {campo.operacion === "ambas" ? "ALQUILER Y VENTA" : campo.operacion?.toUpperCase() || "PUBLICACIÓN RURAL"}</div>
    <h1>{campo.titulo}</h1>
    <p className="v3-detail-location"><MapPin size={16}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || campo.country_code}</p>
    <V3PhotoGallery photos={images.map(photo => photo.url)} title={campo.titulo}/>
    <nav className="v3-detail-jump" aria-label="En esta publicación"><a href="#informacion">Información</a><a href="#descripcion">Descripción</a><a href="#ubicacion">Ubicación</a></nav>
    <div className="v3-detail-columns">
      <div>
        <section id="informacion" className="v3-detail-section"><h2>Acerca de este campo</h2>
        <div className="v3-detail-features">
          {campo.hectareas != null && <span>{format(campo.hectareas)} hectáreas</span>}
          {aptitude && <span>{aptitude}</span>}
          {campo.operacion && <span>{campo.operacion === "ambas" ? "Alquiler y venta" : campo.operacion}</span>}
          {campo.mejoras === "Sí" && <span>Con mejoras</span>}
        </div>
        <V3DetailFacts facts={[
          {label:"Superficie",value:campo.hectareas != null ? `${format(campo.hectareas)} ha` : null},
          {label:"País",value:displayCountryName(country,country)},
          {label:"Departamento",value:campo.departamento},
          {label:"Ambiente",value:campo.ambiente},
          {label:"Rendimiento informado",value:campo.rendimiento_estimado},
          {label:"Disponibilidad",value:campo.disponibilidad},
          {label:"Disponible desde",value:campo.disponibilidad_desde ? new Intl.DateTimeFormat(COUNTRIES[country].locale,{dateStyle:"medium",timeZone:"UTC"}).format(new Date(campo.disponibilidad_desde)) : null},
          {label:"Mejoras",value:campo.mejoras},
        ]}/></section>
        <section id="descripcion" className="v3-detail-section"><h2>Descripción</h2>
        <p className="v3-detail-description">{campo.descripcion || "El anunciante todavía no agregó una descripción de este campo."}</p>
        </section>
        <section id="ubicacion" className="v3-detail-section"><h2>Ubicación del establecimiento</h2><p className="v3-detail-description">{[campo.localidad,campo.provincia].filter(Boolean).join(", ") || displayCountryName(country,country)}</p>
        {hasLocation ? <V3LocationMap lat={lat!} lng={lng!} country={country} title={campo.titulo}/> : <p className="v3-detail-description">Esta publicación no informa coordenadas precisas. No se muestra una ubicación estimada.</p>}</section>
      </div>
      <aside className="v3-contact-panel">
        <span className="v3-kicker">INFORMACIÓN COMERCIAL</span>
        <strong>{price.trim()}</strong>
        <p><ShieldCheck size={16} style={{display:"inline",verticalAlign:"middle"}}/> Publicación visible en RentoCampo</p>
        <div className="v3-contact-disabled" aria-disabled="true"><MessageCircle size={17} style={{display:"inline",verticalAlign:"middle"}}/> Mensajería no habilitada en UAT</div>
        <p>Esta vista previa no envía consultas.</p>
      </aside>
    </div>
  </article>;
}
