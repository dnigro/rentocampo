import type { Metadata } from "next";
import V3PhotoGallery from "../../components/V3PhotoGallery";
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldCheck, MessageCircle } from "lucide-react";
import { addMapBounds, parseMapBounds } from "@/lib/campos/map-search";
import { campoFilterParams } from "@/lib/campos/filter-params";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };
export const metadata: Metadata = { title: "Detalle de campo | RentoCampo V3", robots: { index: false, follow: false } };

export default async function V3CampoDetalle({ params, searchParams }: Props) {
  const { id } = await params;
  const filters = await searchParams;
  const supabase = await createClient();
  const { data: campo, error } = await supabase
    .from("campos")
    .select("id, titulo, descripcion, localidad, provincia, country_code, hectareas, aptitud, operacion, precio, moneda, mejoras, fotos:campos_fotos(url, orden)")
    .eq("id", id).eq("status", "activo").maybeSingle();
  if (error || !campo || String(campo.id).startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "")) notFound();
  const images = [...(campo.fotos || [])].filter(f => Boolean(f.url)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8);
  const format = (v: number) => Number(v).toLocaleString("es-AR");
  const price = campo.precio != null ? `${campo.moneda ?? ""} ${format(campo.precio)}` : "Precio a consultar";
  const backSearch = addMapBounds(campoFilterParams({ ...filters, pais: campo.country_code || "AR" }), parseMapBounds(filters));
  if (filters.moneda && /^[A-Z]{3}$/.test(filters.moneda)) backSearch.set("moneda", filters.moneda);
  return <article className="v3-detail">
    <Link href={`/v3/campos?${backSearch.toString()}`} className="v3-detail-back"><ArrowLeft size={17}/> Volver al explorador</Link>
    <h1>{campo.titulo}</h1>
    <p className="v3-detail-location"><MapPin size={16}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || campo.country_code}</p>
    <V3PhotoGallery photos={images.map(photo => photo.url)} title={campo.titulo}/>
    <div className="v3-detail-columns">
      <div>
        <h2>Acerca de este campo</h2>
        <div className="v3-detail-features">
          {campo.hectareas != null && <span>{format(campo.hectareas)} hectáreas</span>}
          {campo.aptitud && <span>{campo.aptitud}</span>}
          {campo.operacion && <span>{campo.operacion === "ambas" ? "Alquiler y venta" : campo.operacion}</span>}
          {campo.mejoras === "Sí" && <span>Con mejoras</span>}
        </div>
        <h2>Descripción</h2>
        <p className="v3-detail-description">{campo.descripcion || "El anunciante todavía no agregó una descripción de este campo."}</p>
        <h2>Contacto directo, sin intermediarios</h2>
        <p className="v3-detail-description">Las publicaciones se consultan en modo lectura. Para probar los mensajes y las acciones de usuario hace falta un entorno de UAT independiente.</p>
      </div>
      <aside className="v3-contact-panel">
        <strong>{price.trim()}</strong>
        <p><ShieldCheck size={16} style={{display:"inline",verticalAlign:"middle"}}/> Publicación visible en RentoCampo</p>
        <div className="v3-contact-disabled" aria-disabled="true"><MessageCircle size={17} style={{display:"inline",verticalAlign:"middle"}}/> Mensajería no habilitada en UAT</div>
        <p>Este Preview no envía mensajes ni modifica publicaciones reales.</p>
      </aside>
    </div>
  </article>;
}
