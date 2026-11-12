import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, ArrowLeft, ShieldCheck, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ id: string }> };
export const metadata: Metadata = { title: "Detalle de campo | RentoCampo V3", robots: { index: false, follow: false } };

export default async function V3CampoDetalle({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: campo, error } = await supabase
    .from("campos")
    .select("id, titulo, descripcion, localidad, provincia, country_code, hectareas, aptitud, operacion, precio, moneda, mejoras, fotos:campos_fotos(url, orden)")
    .eq("id", id).eq("status", "activo").maybeSingle();
  if (error || !campo || String(campo.id).startsWith("20000000-") || /\bDEMO\b/i.test(campo.titulo ?? "")) notFound();
  const images = [...(campo.fotos || [])].filter(f => Boolean(f.url)).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8);
  const format = (v: number) => Number(v).toLocaleString("es-AR");
  const price = campo.precio != null ? `${campo.moneda ?? ""} ${format(campo.precio)}` : "Precio a consultar";
  return <article className="v3-detail">
    <Link href={`/v3/campos?pais=${campo.country_code || "AR"}`} className="v3-detail-back"><ArrowLeft size={17}/> Volver al explorador</Link>
    <h1>{campo.titulo}</h1>
    <p className="v3-detail-location"><MapPin size={16}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || campo.country_code}</p>
    {images.length ? <div className="v3-detail-gallery">
      {images.map((photo, i) => <div className="v3-detail-gallery-image" key={i}><Image
        src={photo.url} fill alt={`Imagen ${i+1} de ${campo.titulo}`} sizes="(max-width: 700px) 90vw, (max-width: 1100px) 50vw, 33vw" priority={i === 0}/></div>)}
    </div> : <div className="v3-detail-gallery-empty">Esta publicación todavía no tiene fotografías disponibles.</div>}
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
