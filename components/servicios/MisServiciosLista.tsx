"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SERVICIO_LABEL } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";

export type ServicioPublicacion = {
  id: string;
  servicios_rurales: string[];
  foto_url: string;
  provincia: string;
  localidad: string | null;
  zona: string | null;
  activo: boolean;
};

export default function MisServiciosLista({ publicaciones }: { publicaciones: ServicioPublicacion[] }) {
  const [lista, setLista] = useState(publicaciones);
  const [pendienteEliminar, setPendienteEliminar] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const supabase = createClient();

  async function toggleEstado(id: string, activo: boolean) {
    const { error } = await supabase.from("servicios_publicaciones").update({ activo: !activo }).eq("id", id);
    if (error) return window.alert("No se pudo actualizar el estado del servicio.");
    setLista((prev) => prev.map((p) => p.id === id ? { ...p, activo: !activo } : p));
  }

  async function eliminar() {
    if (!pendienteEliminar || eliminando) return;
    setEliminando(true);
    const { error } = await supabase.from("servicios_publicaciones").delete().eq("id", pendienteEliminar);
    setEliminando(false);
    if (error) return window.alert("No se pudo eliminar la publicación.");
    setLista((prev) => prev.filter((p) => p.id !== pendienteEliminar));
    setPendienteEliminar(null);
  }

  return <>
  <div className="campos-grid">
    {lista.map((pub) => {
      const rubros = (pub.servicios_rurales ?? []) as ServicioRural[];
      return <article className="campo-card-admin" key={pub.id}>
        <div className="campo-card-img">
          <Image src={pub.foto_url} alt="Servicio rural" fill sizes="(max-width: 720px) 100vw, 320px" />
          <span className={`estado-badge ${pub.activo ? "estado-activo" : "estado-pausado"}`}>{pub.activo ? "Activo" : "Pausado"}</span>
        </div>
        <div className="campo-card-body">
          <h2 className="campo-card-titulo">{rubros.slice(0,3).map((x)=>SERVICIO_LABEL[x] ?? x).join(" · ")}</h2>
          <p className="campo-card-ubicacion">📍 {[pub.localidad,pub.provincia].filter(Boolean).join(", ")}</p>
          {pub.zona && <p className="campo-card-datos">{pub.zona}</p>}
        </div>
        <div className="campo-card-actions">
          <Link href={`/mis-servicios-rurales/${pub.id}/editar`} className="btn-action">Editar</Link>
          <button type="button" onClick={()=>toggleEstado(pub.id,pub.activo)} className="btn-action">{pub.activo ? "Pausar" : "Activar"}</button>
          {pub.activo && <Link href={`/servicios-rurales/${pub.id}`} className="btn-action">Ver</Link>}
          <button type="button" onClick={()=>setPendienteEliminar(pub.id)} className="btn-action btn-action-danger">Eliminar</button>
        </div>
      </article>;
    })}
  </div>
  {pendienteEliminar && (
    <div className="servicio-delete-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !eliminando) setPendienteEliminar(null); }}>
      <div className="servicio-delete-modal" role="dialog" aria-modal="true" aria-labelledby="servicio-delete-title">
        <span className="servicio-delete-kicker">RENTOCAMPO</span>
        <h2 id="servicio-delete-title">¿Eliminar este servicio?</h2>
        <p>La publicación dejará de aparecer en RentoCampo. Esta acción no se puede deshacer.</p>
        <div className="servicio-delete-actions">
          <button type="button" className="servicio-delete-cancel" onClick={()=>setPendienteEliminar(null)} disabled={eliminando}>Cancelar</button>
          <button type="button" className="servicio-delete-confirm" onClick={eliminar} disabled={eliminando}>{eliminando ? "Eliminando…" : "Eliminar servicio"}</button>
        </div>
      </div>
    </div>
  )}
  </>;
}