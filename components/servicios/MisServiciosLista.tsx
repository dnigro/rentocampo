"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import EliminarPublicacion from "@/components/publicaciones/EliminarPublicacion";
import { tituloServicioRural } from "@/data/servicios-rurales";
import { useTranslations } from "@/lib/i18n/useTranslations";
import type { ServicioRural } from "@/types";

export type ServicioPublicacion = {
  id: string;
  servicios_rurales: string[];
  nombre_comercial?: string | null;
  foto_url: string;
  provincia: string;
  localidad: string | null;
  zona: string | null;
  activo: boolean;
};

export default function MisServiciosLista({ publicaciones }: { publicaciones: ServicioPublicacion[] }) {
  const {country}=useTranslations();
  const tt=(es:string,pt:string)=>country==="BR"?pt:es;
  const [lista, setLista] = useState(publicaciones);
  const [notice, setNotice] = useState("");
  const lite = usePathname().startsWith("/lite/");

  async function toggleEstado(id: string, activo: boolean) {
    try {
      const response = await fetch("/api/servicios/estado", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, activo: !activo }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar el servicio");
      setLista((prev) => prev.map((p) => p.id === id ? { ...p, activo: !activo } : p));
      setNotice("");
    } catch {
      setNotice(tt("No se pudo actualizar el estado del servicio.","Não foi possível atualizar o estado do serviço."));
    }
  }

  return <>
  {notice && <p role="status" className="publication-list-notice">{notice}</p>}
  <div className="campos-grid">
    {lista.map((pub) => {
      const rubros = (pub.servicios_rurales ?? []) as ServicioRural[];
      return <article className="campo-card-admin" key={pub.id}>
        <div className="campo-card-img">
          <Image src={pub.foto_url} alt="Servicio rural" fill sizes="(max-width: 720px) 100vw, 320px" />
          <span className={`estado-badge ${pub.activo ? "estado-activo" : "estado-pausado"}`}>{pub.activo ? tt("Activo","Ativo") : tt("Pausado","Pausado")}</span>
        </div>
        <div className="campo-card-body">
          <h2 className="campo-card-titulo">{tituloServicioRural(rubros,country,pub.nombre_comercial)}</h2>
          <p className="campo-card-ubicacion">📍 {[pub.localidad,pub.provincia].filter(Boolean).join(", ")}</p>
          {pub.zona && <p className="campo-card-datos">{pub.zona}</p>}
        </div>
        <div className="campo-card-actions">
          <Link href={lite ? `/lite/servicios/${pub.id}/editar` : `/mis-servicios-rurales/${pub.id}/editar`} className="btn-action">{tt("Editar","Editar")}</Link>
          <button type="button" onClick={()=>toggleEstado(pub.id,pub.activo)} className="btn-action">{pub.activo ? tt("Pausar","Pausar") : tt("Activar","Ativar")}</button>
          {pub.activo && <Link href={lite ? `/lite/servicios/${pub.id}` : `/servicios-rurales/${pub.id}`} className="btn-action">{tt("Ver","Ver")}</Link>}
          <EliminarPublicacion id={pub.id} titulo={tituloServicioRural(rubros,country,pub.nombre_comercial)} tipo="servicio" onDeleted={() => {setLista(prev => prev.filter(item => item.id !== pub.id)); setNotice(tt("Servicio eliminado.", "Serviço excluído."));}} />
        </div>
      </article>;
    })}
  </div>
  </>;
}