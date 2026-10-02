"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROVINCIAS_ARG } from "@/types";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";

export default function ServiciosFiltros() {
  const router = useRouter();
  const [provincia, setProvincia] = useState("");
  const [servicio, setServicio] = useState("");

  function aplicar() {
    const params = new URLSearchParams({ vista: "servicios" });
    if (provincia) params.set("provincia", provincia);
    if (servicio) params.set("servicio", servicio);
    router.push(`/campos/mapa?${params.toString()}`);
  }

  function limpiar() {
    setProvincia("");
    setServicio("");
  }

  const hayFiltros = Boolean(provincia || servicio);

  return (
    <div className="servicios-filtros-wrap">
      <div className="filtros-panel servicios-filtros-panel">
        <div className="filtros-header">
          <span className="filtros-title">Filtrá servicios</span>
          {hayFiltros && (
            <button type="button" className="filtros-limpiar" onClick={limpiar}>
              Limpiar
            </button>
          )}
        </div>

        <div className="servicios-filtros-grid">
          <div className="filtro-grupo">
            <label className="filtro-label" htmlFor="servicios-provincia">
              Zona / Provincia
            </label>
            <select
              id="servicios-provincia"
              className="filtro-input"
              value={provincia}
              onChange={(e) => setProvincia(e.target.value)}
            >
              <option value="">Todas</option>
              {PROVINCIAS_ARG.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-label" htmlFor="servicios-rubro">
              Rubro
            </label>
            <select
              id="servicios-rubro"
              className="filtro-input"
              value={servicio}
              onChange={(e) => setServicio(e.target.value)}
            >
              <option value="">Todos los rubros</option>
              {SERVICIOS_RURALES.filter((item) => item.value !== "otro").map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <button type="button" className="btn-aplicar servicios-filtros-aplicar" onClick={aplicar}>
            Buscar servicios
          </button>
        </div>
      </div>
    </div>
  );
}
