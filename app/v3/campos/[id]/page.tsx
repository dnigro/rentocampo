import ConsultaButton from "@/components/campos/ConsultaButton";
import FavoritoBtn from "@/components/campos/FavoritoBtn";
import { isV3Enabled, isV3Preview } from "@/lib/v3-routing";
import { v3Text } from "@/lib/i18n/v3-copy";
import { unifiedExplorerHref } from "@/lib/campos/unified-search";
import RuralIcon from "../../components/RuralIcon";
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
export const metadata: Metadata = { title: "Detalle de campo | RentoCampo V3", ...(process.env.VERCEL_ENV !== "production" || isV3Preview(process.env) ? { robots: { index: false, follow: false } } : {}) };

export default async function V3CampoDetalle({ params, searchParams }: Props) {
  const { id } = await params;
  if (!/^[\da-f-]{36}$/i.test(id)) notFound();
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: campo, error } = await supabase
    .from("campos")
    .select("id, propietario_id, titulo, descripcion, localidad, provincia, country_code, hectareas, aptitud, operacion, precio, moneda, mejoras, ambiente, departamento, disponibilidad, disponibilidad_desde, rendimiento_estimado, latitud, longitud, fotos:campos_fotos(url, orden)")
    .eq("id", id).eq("status", "activo").maybeSingle();
  if (error || !campo || String(campo.id).startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "")) notFound();
  const production = isV3Enabled(process.env) && process.env.VERCEL_ENV === "production";
  const userId = production ? (await supabase.auth.getUser()).data.user?.id : undefined;
  const images = [...(campo.fotos || [])].filter(f => Boolean(f.url)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8);
  const country = resolveCountry(campo.country_code);
  const t = (source: string) => v3Text(country, source);
  const format = (v: number) => Number(v).toLocaleString(COUNTRIES[country].locale);
  const lat = normalizarCoordenada(campo.latitud), lng = normalizarCoordenada(campo.longitud);
  const hasLocation = lat != null && lng != null && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  const price = campo.precio != null ? `${campo.moneda || t("Moneda a confirmar")} ${format(campo.precio)}` : t("Precio a consultar");
  const aptitude = ({agricola:t("Agrícola"),ganadera:t("Ganadera"),mixta:t("Mixta"),forestal:t("Forestal")} as Record<string,string>)[campo.aptitud || ""] || campo.aptitud;
  const backSearch = addMapBounds(campoFilterParams({ ...filters, pais: campo.country_code || "AR" }), parseMapBounds(filters));
  if (filters.moneda && /^[A-Z]{3}$/.test(filters.moneda)) backSearch.set("moneda", filters.moneda);
  return <article className="v3-detail v3-detail-refined">
    <Link href={filters.origen === "home" ? unifiedExplorerHref(filters,country) : `/v3/campos?${backSearch.toString()}`} className="v3-detail-back"><ArrowLeft size={17}/>{t("Volver al explorador")}</Link>
    <div className="v3-detail-eyebrow">{t("Campo rural").toUpperCase()} · {t(campo.operacion === "ambas" ? "Alquiler y venta" : campo.operacion === "venta" ? "Venta" : "Alquiler").toUpperCase()}</div>
    <h1>{campo.titulo}</h1>
    <p className="v3-detail-location"><MapPin size={16}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || campo.country_code}</p>
    <V3PhotoGallery country={country} photos={images.map(photo => photo.url)} title={campo.titulo}/>
    <nav className="v3-detail-jump" aria-label={t("En esta publicación")}><a href="#informacion">{t("Información")}</a><a href="#descripcion">{t("Descripción")}</a><a href="#ubicacion">{t("Ubicación")}</a></nav>
    <div className="v3-detail-columns">
      <div>
        <section id="informacion" className="v3-detail-section"><h2>{t("Acerca de este campo")}</h2>
        <div className="v3-detail-features">
          {campo.hectareas != null && <span><RuralIcon name="superficie"/>{format(campo.hectareas)} {t("Hectáreas")}</span>}
          {aptitude && <span><RuralIcon name={campo.aptitud || "campo"}/>{t(aptitude || "")}</span>}
          {campo.operacion && <span><RuralIcon name="operacion"/>{campo.operacion === "ambas" ? t("Alquiler y venta") : t(campo.operacion === "venta" ? "Venta" : "Alquiler")}</span>}
          {campo.mejoras === "Sí" && <span>{t("Con mejoras")}</span>}
        </div>
        <V3DetailFacts facts={[
          {label:t("Superficie"),value:campo.hectareas != null ? `${format(campo.hectareas)} ha` : null},
          {label:t("País"),value:displayCountryName(country,country)},
          {label:t("Departamento"),value:campo.departamento},
          {label:t("Ambiente"),value:campo.ambiente},
          {label:t("Rendimiento informado"),value:campo.rendimiento_estimado},
          {label:t("Disponibilidad"),value:campo.disponibilidad},
          {label:t("Disponible desde"),value:campo.disponibilidad_desde ? new Intl.DateTimeFormat(COUNTRIES[country].locale,{dateStyle:"medium",timeZone:"UTC"}).format(new Date(campo.disponibilidad_desde)) : null},
          {label:t("Mejoras"),value:campo.mejoras},
        ]}/></section>
        <section id="descripcion" className="v3-detail-section"><h2>{t("Descripción")}</h2>
        <p className="v3-detail-description">{campo.descripcion || t("El anunciante todavía no agregó una descripción de este campo.")}</p>
        </section>
        <section id="ubicacion" className="v3-detail-section"><h2>{t("Ubicación del establecimiento")}</h2><p className="v3-detail-description">{[campo.localidad,campo.provincia].filter(Boolean).join(", ") || displayCountryName(country,country)}</p>
        {hasLocation ? <V3LocationMap lat={lat!} lng={lng!} country={country} title={campo.titulo}/> : <p className="v3-detail-description">{t("Esta publicación no informa coordenadas precisas. No se muestra una ubicación estimada.")}</p>}</section>
      </div>
      <aside className="v3-contact-panel">
        <span className="v3-kicker">{t("INFORMACIÓN COMERCIAL")}</span>
        <strong>{price.trim()}</strong>
        <p><ShieldCheck size={16} style={{display:"inline",verticalAlign:"middle"}}/>{t("Publicación visible en RentoCampo")}</p>
        {production ? <>
          <ConsultaButton campoId={campo.id} propietarioId={campo.propietario_id} userId={userId}/>
          <FavoritoBtn campoId={campo.id} userId={userId}/>
        </> : <>
        <div className="v3-contact-disabled" aria-disabled="true"><MessageCircle size={17} style={{display:"inline",verticalAlign:"middle"}}/>{t("Mensajería no habilitada en UAT")}</div>
        <p>{t("Esta vista previa no envía consultas.")}</p></>}
      </aside>
    </div>
  </article>;
}
