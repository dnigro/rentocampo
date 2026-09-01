"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROVINCIAS_ARG } from "@/types";

const APTITUDES = [
  { value: "", label: "Cualquier aptitud" },
  { value: "agricola", label: "Agrícola" },
  { value: "ganadera", label: "Ganadera" },
  { value: "mixta", label: "Mixta" },
  { value: "forestal", label: "Forestal" },
];

export default function BuscadorHero() {
  const router = useRouter();
  const [provincia, setProvincia] = useState("");
  const [aptitud, setAptitud] = useState("");
  const [hectareas, setHectareas] = useState("");

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (provincia) params.set("provincia", provincia);
    if (aptitud) params.set("aptitud", aptitud);
    if (hectareas) params.set("hectareas_min", hectareas);
    router.push(`/campos?${params.toString()}`);
  }

  return (
    <form className="buscador-hero" onSubmit={handleBuscar}>
      <div className="buscador-fields">
        <div className="buscador-field">
          <label className="buscador-label">Provincia</label>
          <select
            className="buscador-input"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          >
            <option value="">Todas las provincias</option>
            {PROVINCIAS_ARG.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="buscador-divider" />
        <div className="buscador-field">
          <label className="buscador-label">Aptitud</label>
          <select
            className="buscador-input"
            value={aptitud}
            onChange={(e) => setAptitud(e.target.value)}
          >
            {APTITUDES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div className="buscador-divider" />
        <div className="buscador-field">
          <label className="buscador-label">Mínimo de hectáreas</label>
          <input
            type="number"
            className="buscador-input"
            placeholder="Sin mínimo"
            value={hectareas}
            onChange={(e) => setHectareas(e.target.value)}
            min={0}
          />
        </div>
      </div>
      <button type="submit" className="buscador-btn">
        Buscar campos
      </button>
    </form>
  );
}
