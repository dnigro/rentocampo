import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Tractor, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { tituloServicioRural, servicioLabel } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";

export const metadata: Metadata = { title: "Detalle de servicio rural | RentoCampo V3", robots: { index: false, follow: false } };

export default async function V3Servicio({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await createClient();
  const { data, error } = await client.from("servicios_publicaciones")
    .select("id, nombre_comercial, foto_url, zona, provincia, localidad, country_code, servicios_rurales")
    .eq("id", id).eq("activo", true).maybeSingle();
  if (error || !data || String(id).startsWith("10000000-") || String(id).startsWith("20000000-")) notFound();
  const country = data.country_code || "AR";
  const title = tituloServicioRural(data.servicios_rurales as ServicioRural[], country, data.nombre_comercial);
  return <article className="v3-detail">
    <Link href={`/v3/servicios?pais=${country}`} className="v3-detail-back"><ArrowLeft size={17}/> Volver a servicios</Link>
    <h1>{title}</h1>
    <p className="v3-detail-location"><MapPin size={16}/>{[data.localidad, data.provincia].filter(Boolean).join(", ") || country}</p>
    <div className="v3-service-detail-grid">
      <div className="v3-service-detail-image">
        {data.foto_url ? <Image src={data.foto_url} alt={title} fill priority sizes="(max-width: 700px) 100vw, 60vw"/> :
          <div className="v3-detail-gallery-empty"><Tractor size={42}/> Sin foto publicada</div>}
      </div>
      <div className="v3-contact-panel">
        <h2>Servicios disponibles</h2>
        <div className="v3-detail-features">
          {(data.servicios_rurales || []).map((item: ServicioRural) => <span key={item}>{servicioLabel(item, country)}</span>)}
        </div>
        {data.zona && <p>Zona de cobertura: {data.zona}</p>}
        <div className="v3-contact-disabled" aria-disabled="true">Contacto deshabilitado en UAT</div>
        <p><ShieldCheck size={16} style={{display:"inline",verticalAlign:"middle"}}/> El Preview no envía mensajes reales.</p>
      </div>
    </div>
  </article>;
}
