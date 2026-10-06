import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import "@/styles/dashboard.css";
import "@/styles/campos.css";

export default async function MisServiciosRuralesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: publicaciones } = await supabase
    .from("servicios_publicaciones")
    .select("id, servicios_rurales, foto_url, provincia, localidad, zona, activo")
    .eq("propietario_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis servicios rurales</h1>
          <p className="page-subtitle">Tus publicaciones de servicios rurales.</p>
        </div>
        <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">
          + Publicar nuevo servicio
        </Link>
      </div>

      {!publicaciones?.length ? (
        <div className="empty-state">
          <span className="empty-icon">⚙️</span>
          <p className="empty-title">Todavía no publicaste servicios rurales</p>
          <p className="empty-desc">Creá una publicación por servicio o zona. Podés publicar todas las que necesites.</p>
          <Link href="/mis-servicios-rurales/nuevo" className="btn-primary-lg">Publicar servicio</Link>
        </div>
      ) : (
        <div className="campos-grid">
          {publicaciones.map((pub) => {
            const rubros = (pub.servicios_rurales ?? []) as ServicioRural[];
            return (
              <article className="campo-card-admin" key={pub.id}>
                <div className="campo-card-img">
                  <Image src={pub.foto_url} alt="Servicio rural" fill sizes="(max-width: 720px) 100vw, 320px" />
                </div>
                <div className="campo-card-body">
                  <span className="estado-badge estado-activo" style={{ position: "static", display: "inline-flex", marginBottom: 12 }}>
                    {pub.activo ? "Activo" : "Inactivo"}
                  </span>
                  <h2 className="campo-card-titulo">
                    {rubros.slice(0, 3).map((item) => SERVICIO_LABEL[item] ?? item).join(" · ")}
                  </h2>
                  <p className="campo-card-ubicacion">📍 {[pub.localidad, pub.provincia].filter(Boolean).join(", ")}</p>
                  {pub.zona && <p className="campo-card-datos">{pub.zona}</p>}
                </div>
                <div className="campo-card-actions">
                  <Link href="/servicios-rurales" className="btn-action">Ver publicación</Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}