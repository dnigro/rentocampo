"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { PROVINCIAS_ARG } from "@/types";
import { COUNTRIES, DEPARTAMENTOS_UY, DEPARTAMENTOS_PY, type CountryCode } from "@/data/countries";

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
    pais: (filtrosActivos.pais ?? "AR") as CountryCode,
    operacion: filtrosActivos.operacion ?? "",
    provincia: filtrosActivos.provincia ?? "",
    aptitud: filtrosActivos.aptitud ?? "",
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
      pais: (filtrosActivos.pais ?? "AR") as CountryCode,
      operacion: "",
      provincia: "",
      aptitud: "",
      disponibilidad: "",
    });
    router.push(pathname);
  }

  const hayFiltros = Boolean(filtros.provincia || filtros.aptitud || filtros.disponibilidad || filtros.operacion);

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

      <div className="filtro-grupo"><label className="filtro-label">País</label><select className="filtro-input" value={filtros.pais} onChange={(e) => setFiltros((p) => ({ ...p, pais: e.target.value as CountryCode, provincia: "" }))}>{(["AR","UY","PY"] as const).map((code) => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}</select></div>
      <div className="filtro-grupo"><label className="filtro-label">Tipo de operación</label><select className="filtro-input" value={filtros.operacion} onChange={(e) => setFiltros((p) => ({ ...p, operacion: e.target.value }))}><option value="">Todas</option><option value="alquiler">Alquiler</option><option value="venta">Venta</option><option value="ambas">Ambas</option></select></div>
      <div className="filtro-grupo">
        <label className="filtro-label">{filtros.pais === "AR" ? "Provincia" : "Departamento"}</label>
        <select
          className="filtro-input"
          value={filtros.provincia}
          onChange={(e) =>
            setFiltros((p) => ({ ...p, provincia: e.target.value }))
          }
        >
          <option value="">Todas</option>
          {(filtros.pais === "UY" ? DEPARTAMENTOS_UY : filtros.pais === "PY" ? DEPARTAMENTOS_PY : PROVINCIAS_ARG).map((p) => (
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

      <button className="listing-button listing-button-full" onClick={aplicar}>
        Aplicar filtros
      </button>
    </div>
  );
}
