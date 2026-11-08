"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import EliminarPublicacion from "@/components/publicaciones/EliminarPublicacion";
import type { Campo } from "@/types";
import { useTranslations } from "@/lib/i18n/useTranslations";

interface Props {
  campos: (Campo & { fotos: { url: string; orden: number }[] })[];
}

const ESTADO_LABEL: Record<string, { label: string; class: string }> = {
  activo: { label: "Activo", class: "estado-activo" },
  borrador: { label: "Borrador", class: "estado-borrador" },
  pausado: { label: "Pausado", class: "estado-pausado" },
  arrendado: { label: "Arrendado", class: "estado-arrendado" },
};

export default function MisCamposLista({ campos }: Props) {
  const {country}=useTranslations();
  const tt=(es:string,pt:string)=>country==="BR"?pt:es;
  const [lista, setLista] = useState(campos);
  const [notice, setNotice] = useState("");
  const lite = usePathname().startsWith("/lite/");

  async function toggleEstado(id: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "pausado" : "activo";
    try {
      const response = await fetch("/api/campos/estado", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nuevoEstado }),
      });
      if (!response.ok) throw new Error("No se pudo actualizar la publicación");
      setLista((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: nuevoEstado } : c)),
      );
      setNotice("");
    } catch {
      setNotice(tt("No se pudo actualizar el estado del campo.", "Não foi possível atualizar o estado da terra."));
    }
  }


  if (!lista.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🌾</span>
        <p className="empty-title">{tt("No tenés campos publicados","Você não tem terras anunciadas")}</p>
        <p className="empty-desc">
          {tt("Publicá tu primer campo y empezá a recibir consultas de productores.","Anuncie sua primeira terra e comece a receber consultas de produtores.")}
        </p>
        <Link href={lite ? "/lite/campos/publicar" : "/mis-campos/nuevo"} className="btn-primary-lg">
          {tt("Publicar mi primer campo","Anunciar minha primeira terra")}
        </Link>
      </div>
    );
  }

  return (
    <>
      {notice && <p role="status" className="publication-list-notice">{notice}</p>}
    <div className="campos-grid">
      {lista.map((campo) => {
        const foto = campo.fotos
          ? [...campo.fotos].sort((a, b) => a.orden - b.orden)[0]
          : undefined;
        const estado = ESTADO_LABEL[campo.status] ?? ESTADO_LABEL.borrador;

        return (
          <div key={campo.id} className="campo-card-admin">
            <div className="campo-card-img">
              {foto ? (
                <Image
                  src={foto.url}
                  alt={campo.titulo}
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                />
              ) : (
                <div className="campo-card-img-placeholder">🌿</div>
              )}
              <span className={`estado-badge ${estado.class}`}>
                {tt(estado.label,({Activo:"Ativo",Borrador:"Rascunho",Pausado:"Pausado",Arrendado:"Arrendado"} as Record<string,string>)[estado.label]??estado.label)}
              </span>
            </div>

            <div className="campo-card-body">
              <h3 className="campo-card-titulo">{campo.titulo}</h3>
              <p className="campo-card-ubicacion">
                {[campo.localidad, campo.departamento, campo.provincia]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="campo-card-datos">
                <span>{campo.hectareas.toLocaleString(country==="BR"?"pt-BR":"es-AR")} ha</span>
                <span className="dot">·</span>
                <span className="capitalize">{campo.aptitud}</span>
                {campo.precio && (
                  <>
                    <span className="dot">·</span>
                    <span>
                      {campo.moneda} {campo.precio.toLocaleString(country==="BR"?"pt-BR":"es-AR")}
                      total
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="campo-card-actions">
              <Link
                href={lite ? `/lite/campos/${campo.id}/editar` : `/mis-campos/${campo.id}/editar`}
                className="btn-action"
              >
                {tt("Editar","Editar")}
              </Link>
              <button
                onClick={() => toggleEstado(campo.id, campo.status)}
                className="btn-action"
              >
                {campo.status === "activo" ? tt("Pausar","Pausar") : tt("Activar","Ativar")}
              </button>
              {campo.status === "activo" && (
                <Link
                  href={lite ? `/lite/campos/${campo.id}` : `/campos/${campo.id}`}
                  className="btn-action"
                  target="_blank"
                >
                  {tt("Ver","Ver")}
                </Link>
              )}
              <EliminarPublicacion id={campo.id} titulo={campo.titulo} tipo="campo" onDeleted={() => {setLista(prev => prev.filter(item => item.id !== campo.id)); setNotice(tt("Campo eliminado.", "Terra excluída."));}} />
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
