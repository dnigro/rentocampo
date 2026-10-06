import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import "@/styles/servicios-rurales.css";
import "@/styles/campos.css";

export default async function ServicioDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: servicio } = await supabase.from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, detalle, activo")
    .eq("id", id).eq("activo", true).single();
  if (!servicio) notFound();
  const { data: perfil } = await supabase.from("profiles").select("nombre").eq("id", servicio.propietario_id).single();
  const rubros = (servicio.servicios_rurales ?? []) as ServicioRural[];
  const titulo = rubros.map((x) => SERVICIO_LABEL[x] ?? x).join(" · ");

  return <div className="page-container">
    <Link href="/servicios-rurales" className="back-link">← Volver a Servicios rurales</Link>
    <article className="campo-detalle">
      <div className="campo-detalle-img"><Image src={servicio.foto_url} alt={titulo} width={1200} height={760} /></div>
      <div className="campo-detalle-info">
        <span className="prestador-card__badge">SERVICIO RURAL</span>
        <h1 className="page-title">{titulo}</h1>
        <p className="campo-card-ubicacion">📍 {[servicio.localidad, servicio.provincia].filter(Boolean).join(", ")}</p>
        {perfil?.nombre && <p><strong>Prestador:</strong> {perfil.nombre}</p>}
        {servicio.zona && <p><strong>Zona de cobertura:</strong> {servicio.zona}</p>}
        {servicio.detalle && <p>{servicio.detalle}</p>}
        <div className="form-actions">
          {user?.id === servicio.propietario_id
            ? <Link href={`/mis-servicios-rurales/${servicio.id}/editar`} className="btn-primary-lg">Editar publicación</Link>
            : user
              ? <Link href={`/mensajes/direct/${servicio.propietario_id}`} className="btn-primary-lg">Contactar prestador</Link>
              : <Link href={`/login?next=/servicios-rurales/${servicio.id}`} className="btn-primary-lg">Ingresá para contactar</Link>}
        </div>
      </div>
    </article>
  </div>;
}