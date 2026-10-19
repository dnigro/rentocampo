"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  const supabase = createClient();

  async function toggleEstado(id: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "pausado" : "activo";
    await supabase.from("campos").update({ status: nuevoEstado }).eq("id", id);
    setLista((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nuevoEstado } : c)),
    );
  }

  async function eliminarCampo(id: string, titulo: string) {
    const confirmar = window.confirm(
      tt(`¿Eliminar “${titulo}”? Esta acción no se puede deshacer y no recupera el cupo de publicación utilizado.`,`Excluir “${titulo}”? Esta ação não pode ser desfeita e não devolve a vaga de anúncio utilizada.`),
    );

    if (!confirmar) return;

    const response = await fetch(`/api/campos/${id}`, {
      method: "DELETE",
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      window.alert(result?.error ?? tt("No se pudo eliminar el campo.","Não foi possível excluir a terra."));
      return;
    }

    setLista((prev) => prev.filter((campo) => campo.id !== id));
  }

  if (!lista.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🌾</span>
        <p className="empty-title">{tt("No tenés campos publicados","Você não tem terras anunciadas")}</p>
        <p className="empty-desc">
          {tt("Publicá tu primer campo y empezá a recibir consultas de productores.","Anuncie sua primeira terra e comece a receber consultas de produtores.")}
        </p>
        <Link href="/mis-campos/nuevo" className="btn-primary-lg">
          {tt("Publicar mi primer campo","Anunciar minha primeira terra")}
        </Link>
      </div>
    );
  }

  return (
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
                href={`/mis-campos/${campo.id}/editar`}
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
                  href={`/campos/${campo.id}`}
                  className="btn-action"
                  target="_blank"
                >
                  {tt("Ver","Ver")}
                </Link>
              )}
              <button
                type="button"
                onClick={() => eliminarCampo(campo.id, campo.titulo)}
                className="btn-action btn-action-danger"
              >
                {tt("Eliminar","Excluir")}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
