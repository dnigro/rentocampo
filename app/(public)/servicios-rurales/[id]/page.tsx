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
  if (!servicio) {
    const { data: demo } = await supabase.from("demo_servicios_rurales")
      .select("id, nombre, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio")
      .eq("id", id).eq("activo", true).maybeSingle();
    if (!demo) notFound();
    const rubrosDemo = (demo.servicios_rurales ?? []) as ServicioRural[];
    const tituloDemo = rubrosDemo.map((x) => SERVICIO_LABEL[x] ?? x).join(" · ");
    return <div className="page-container">
      <Link href="/campos/mapa?vista=servicios" className="back-link">← Volver al mapa de servicios</Link>
      <article className="campo-detalle">
        <div className="campo-detalle-img">
          <Image src="/demo-servicio-veterinaria.jpg" alt={tituloDemo} width={1200} height={760} />
        </div>
        <div className="campo-detalle-info">
          <span className="prestador-card__badge">SERVICIO DEMO</span>
          <h1 className="page-title">{tituloDemo || demo.nombre}</h1>
          <p className="campo-card-ubicacion">📍 {[demo.localidad_servicio, demo.provincia_servicio].filter(Boolean).join(", ")}</p>
          <p><strong>Prestador:</strong> {demo.nombre}</p>
          {demo.zona_servicio && <p><strong>Zona de cobertura:</strong> {demo.zona_servicio}</p>}
          {demo.bio && <p>{demo.bio}</p>}
          <p>Esta publicación es demostrativa y no representa una oferta comercial activa.</p>
        </div>
      </article>
    </div>;
  }
  const { data: perfil } = await supabase.from("profiles").select("nombre").eq("id", servicio.propietario_id).single();
  const rubros = (servicio.servicios_rurales ?? []) as ServicioRural[];
  const titulo = rubros.map((x) => SERVICIO_LABEL[x] ?? x).join(" · ");

  return <div className="page-container">
    <Link href="/campos/mapa?vista=servicios" className="back-link">← Volver al mapa de servicios</Link>
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