"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PROVINCIAS_ARG } from "@/types";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";

interface Props {
  provinciaInicial?: string;
  servicioInicial?: string;
}

export default function ServiciosFiltros({
  provinciaInicial = "",
  servicioInicial = "",
}: Props) {
  const router = useRouter();
  const [provincia, setProvincia] = useState(provinciaInicial);
  const [servicio, setServicio] = useState(servicioInicial);

  function aplicar() {
    const params = new URLSearchParams();
    if (provincia) params.set("provincia", provincia);
    if (servicio) params.set("servicio", servicio);
    const query = params.toString();
    router.push(query ? `/servicios-rurales?${query}` : "/servicios-rurales");
  }

  function limpiar() {
    setProvincia("");
    setServicio("");
    router.push("/servicios-rurales");
  }

  const hayFiltros = Boolean(provincia || servicio);

  return (
    <div>
      <div className="filtros-panel">
        <div className="filtros-header">
          <span className="filtros-title">Filtros</span>
          {hayFiltros && (
            <button type="button" className="filtros-limpiar" onClick={limpiar}>
              Limpiar
            </button>
          )}
        </div>

        <div className="listing-filters-grid">
          <div className="filtro-grupo">
            <label className="filtro-label" htmlFor="servicios-provincia">
              Provincia
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

          <button
            type="button"
            className="listing-button listing-button-full"
            onClick={aplicar}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
