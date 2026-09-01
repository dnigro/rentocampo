"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Campo } from "@/types";

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
  const [lista, setLista] = useState(campos);
  const supabase = createClient();

  async function toggleEstado(id: string, estadoActual: string) {
    const nuevoEstado = estadoActual === "activo" ? "pausado" : "activo";
    await supabase.from("campos").update({ estado: nuevoEstado }).eq("id", id);
    setLista((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado: nuevoEstado as any } : c)),
    );
  }

  if (!lista.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🌾</span>
        <p className="empty-title">No tenés campos publicados</p>
        <p className="empty-desc">
          Publicá tu primer campo y empezá a recibir consultas de productores.
        </p>
        <Link href="/mis-campos/nuevo" className="btn-primary-lg">
          Publicar mi primer campo
        </Link>
      </div>
    );
  }

  return (
    <div className="campos-grid">
      {lista.map((campo) => {
        const foto = campo.fotos?.sort((a, b) => a.orden - b.orden)[0];
        const estado = ESTADO_LABEL[campo.estado] ?? ESTADO_LABEL.borrador;

        return (
          <div key={campo.id} className="campo-card-admin">
            <div className="campo-card-img">
              {foto ? (
                <img src={foto.url} alt={campo.titulo} />
              ) : (
                <div className="campo-card-img-placeholder">🌿</div>
              )}
              <span className={`estado-badge ${estado.class}`}>
                {estado.label}
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
                <span>{campo.hectareas.toLocaleString("es-AR")} ha</span>
                <span className="dot">·</span>
                <span className="capitalize">{campo.aptitud}</span>
                {campo.precio_ha && (
                  <>
                    <span className="dot">·</span>
                    <span>
                      {campo.moneda} {campo.precio_ha.toLocaleString("es-AR")}
                      /ha
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
                Editar
              </Link>
              <button
                onClick={() => toggleEstado(campo.id, campo.estado)}
                className="btn-action"
              >
                {campo.estado === "activo" ? "Pausar" : "Activar"}
              </button>
              {campo.estado === "activo" && (
                <Link
                  href={`/campos/${campo.id}`}
                  className="btn-action"
                  target="_blank"
                >
                  Ver
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
