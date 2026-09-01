"use client";

import { useState, useRef, useEffect } from "react";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

export interface LugarSeleccionado {
  lat: number;
  lng: number;
  lugar: string;
  localidad?: string;
  departamento?: string;
  provincia?: string;
}

interface Props {
  onSelect: (lugar: LugarSeleccionado) => void;
  valorInicial?: string;
}

interface Sugerencia {
  id: string;
  place_name: string;
  center: [number, number];
  context: { id: string; text: string }[];
  text: string;
}

function normalizarProvincia(nombre: string): string {
  // Limpiar prefijos comunes de Mapbox
  const limpio = nombre
    .replace(/^Provincia de /i, "")
    .replace(/^Provincia del /i, "")
    .replace(/^Ciudad Autónoma de Buenos Aires$/i, "CABA")
    .trim();

  const mapa: Record<string, string> = {
    "Buenos Aires": "Buenos Aires",
    CABA: "CABA",
    Córdoba: "Córdoba",
    "Santa Fe": "Santa Fe",
    Mendoza: "Mendoza",
    Tucumán: "Tucumán",
    "Entre Ríos": "Entre Ríos",
    Salta: "Salta",
    Misiones: "Misiones",
    Chaco: "Chaco",
    Corrientes: "Corrientes",
    "Santiago del Estero": "Santiago del Estero",
    "San Juan": "San Juan",
    Jujuy: "Jujuy",
    "Río Negro": "Río Negro",
    Neuquén: "Neuquén",
    Formosa: "Formosa",
    Chubut: "Chubut",
    "San Luis": "San Luis",
    Catamarca: "Catamarca",
    "La Rioja": "La Rioja",
    "La Pampa": "La Pampa",
    "Santa Cruz": "Santa Cruz",
    "Tierra del Fuego": "Tierra del Fuego",
  };

  return mapa[limpio] ?? limpio;
}

function parsearResultado(feature: Sugerencia): LugarSeleccionado {
  const [lng, lat] = feature.center;
  const ctx = feature.context ?? [];

  let localidad = "";
  let departamento = "";
  let provincia = "";

  // El texto del resultado principal puede ser la localidad
  const tipoResultado = feature.id?.split(".")?.[0];
  if (tipoResultado === "place" || tipoResultado === "locality") {
    localidad = feature.text;
  }

  for (const item of ctx) {
    const tipo = item.id?.split(".")?.[0];
    if (!localidad && (tipo === "place" || tipo === "locality")) {
      localidad = item.text;
    } else if (tipo === "district") {
      departamento = item.text;
    } else if (tipo === "region") {
      provincia = normalizarProvincia(item.text);
    }
  }

  return {
    lat,
    lng,
    lugar: feature.place_name,
    localidad,
    departamento: departamento || "", // dejar vacío, el usuario completa
    provincia,
  };
}

export default function GeocoderInput({ onSelect, valorInicial }: Props) {
  const [query, setQuery] = useState(valorInicial ?? "");
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function buscar(texto: string) {
    if (texto.length < 3) {
      setSugerencias([]);
      return;
    }
    setCargando(true);
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(texto)}.json?access_token=${MAPBOX_TOKEN}&country=ar&language=es&types=place,locality,district,address&limit=6`;
      const res = await fetch(url);
      const data = await res.json();
      setSugerencias(data.features ?? []);
      setAbierto(true);
    } catch {
      setSugerencias([]);
    } finally {
      setCargando(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;

    setQuery(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => buscar(val), 350);
  }

  function handleSeleccionar(sug: Sugerencia) {
    const lugar = parsearResultado(sug);
    setQuery(sug.place_name);
    setSugerencias([]);
    setAbierto(false);
    onSelect(lugar);
  }

  function handleLimpiar() {
    setQuery("");
    setSugerencias([]);
    setAbierto(false);
    onSelect({
      lat: 0,
      lng: 0,
      lugar: "",
      localidad: "",
      departamento: "",
      provincia: "",
    });
  }

  return (
    <div ref={wrapperRef} className="geocoder-custom-wrapper">
      <div className="geocoder-input-row">
        <span className="geocoder-icon">🔍</span>
        <input
          type="text"
          className="geocoder-input"
          placeholder="Buscá la ubicación del campo..."
          value={query}
          onChange={handleInput}
          onFocus={() => sugerencias.length > 0 && setAbierto(true)}
          autoComplete="off"
        />
        {cargando && <span className="geocoder-spinner">⟳</span>}
        {query && !cargando && (
          <button
            type="button"
            className="geocoder-clear"
            onClick={handleLimpiar}
          >
            ×
          </button>
        )}
      </div>

      {abierto && sugerencias.length > 0 && (
        <ul className="geocoder-dropdown">
          {sugerencias.map((sug) => (
            <li
              key={sug.id}
              className="geocoder-option"
              onMouseDown={() => handleSeleccionar(sug)}
            >
              <span className="geocoder-option-icon">📍</span>
              <span className="geocoder-option-text">{sug.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
