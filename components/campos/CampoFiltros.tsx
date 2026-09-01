"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { PROVINCIAS_ARG } from "@/types";

interface Props {
  filtrosActivos: Record<string, string | undefined>;
}

const APTITUDES = [
  { value: "", label: "Todas" },
  { value: "agricola", label: "Agrícola" },
  { value: "ganadera", label: "Ganadera" },
  { value: "mixta", label: "Mixta" },
  { value: "forestal", label: "Forestal" },
  { value: "otro", label: "Otro" },
];

const DISPONIBILIDADES = [
  { value: "", label: "Cualquiera" },
  { value: "inmediata", label: "Inmediata" },
  { value: "campaña_próxima", label: "Campaña próxima" },
  { value: "a_convenir", label: "A convenir" },
];

export default function CampoFiltros({ filtrosActivos }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [filtros, setFiltros] = useState({
    provincia: filtrosActivos.provincia ?? "",
    aptitud: filtrosActivos.aptitud ?? "",
    hectareas_min: filtrosActivos.hectareas_min ?? "",
    hectareas_max: filtrosActivos.hectareas_max ?? "",
    precio_min: filtrosActivos.precio_min ?? "",
    precio_max: filtrosActivos.precio_max ?? "",
    disponibilidad: filtrosActivos.disponibilidad ?? "",
  });

  function aplicar() {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function limpiar() {
    setFiltros({
      provincia: "",
      aptitud: "",
      hectareas_min: "",
      hectareas_max: "",
      precio_min: "",
      precio_max: "",
      disponibilidad: "",
    });
    router.push(pathname);
  }

  const hayFiltros = Object.values(filtros).some(Boolean);

  return (
    <div className="filtros-panel">
      <div className="filtros-header">
        <span className="filtros-title">Filtros</span>
        {hayFiltros && (
          <button className="filtros-limpiar" onClick={limpiar}>
            Limpiar
          </button>
        )}
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">Provincia</label>
        <select
          className="filtro-input"
          value={filtros.provincia}
          onChange={(e) =>
            setFiltros((p) => ({ ...p, provincia: e.target.value }))
          }
        >
          <option value="">Todas</option>
          {PROVINCIAS_ARG.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">Aptitud</label>
        <div className="filtro-chips">
          {APTITUDES.map((a) => (
            <button
              key={a.value}
              className={`filtro-chip ${filtros.aptitud === a.value ? "active" : ""}`}
              onClick={() => setFiltros((p) => ({ ...p, aptitud: a.value }))}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">Hectáreas</label>
        <div className="filtro-rango">
          <input
            type="number"
            className="filtro-input filtro-input-sm"
            placeholder="Mín"
            value={filtros.hectareas_min}
            onChange={(e) =>
              setFiltros((p) => ({ ...p, hectareas_min: e.target.value }))
            }
            min={0}
          />
          <span className="rango-sep">—</span>
          <input
            type="number"
            className="filtro-input filtro-input-sm"
            placeholder="Máx"
            value={filtros.hectareas_max}
            onChange={(e) =>
              setFiltros((p) => ({ ...p, hectareas_max: e.target.value }))
            }
            min={0}
          />
        </div>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">Precio/ha (USD)</label>
        <div className="filtro-rango">
          <input
            type="number"
            className="filtro-input filtro-input-sm"
            placeholder="Mín"
            value={filtros.precio_min}
            onChange={(e) =>
              setFiltros((p) => ({ ...p, precio_min: e.target.value }))
            }
            min={0}
          />
          <span className="rango-sep">—</span>
          <input
            type="number"
            className="filtro-input filtro-input-sm"
            placeholder="Máx"
            value={filtros.precio_max}
            onChange={(e) =>
              setFiltros((p) => ({ ...p, precio_max: e.target.value }))
            }
            min={0}
          />
        </div>
      </div>

      <div className="filtro-grupo">
        <label className="filtro-label">Disponibilidad</label>
        <select
          className="filtro-input"
          value={filtros.disponibilidad}
          onChange={(e) =>
            setFiltros((p) => ({ ...p, disponibilidad: e.target.value }))
          }
        >
          {DISPONIBILIDADES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <button className="btn-aplicar" onClick={aplicar}>
        Aplicar filtros
      </button>
    </div>
  );
}
