"use client";

import { useState, useRef, useEffect } from "react";
import { PROVINCIAS_ARG } from "@/types";

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
  onChange?: (texto: string) => void;
  valorInicial?: string;
}

interface ResultadoOsm {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    province?: string;
  };
}

function seleccionarResultado(resultado: ResultadoOsm): LugarSeleccionado {
  const address = resultado.address ?? {};
  return {
    lat: Number(resultado.lat),
    lng: Number(resultado.lon),
    lugar: resultado.display_name,
    localidad: address.city ?? address.town ?? address.village ?? address.municipality ?? "",
    departamento: address.county ?? "",
    provincia: address.state ?? address.province ?? "",
  };
}

export default function GeocoderInput({ onSelect, onChange, valorInicial }: Props) {
  const [query, setQuery] = useState(valorInicial ?? "");
  const [resultados, setResultados] = useState<ResultadoOsm[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorUbicacion, setErrorUbicacion] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const provinciasVisibles = PROVINCIAS_ARG.filter((provincia) =>
    provincia.toLocaleLowerCase("es-AR").includes(query.toLocaleLowerCase("es-AR")),
  );

  async function buscar(texto: string) {
    if (texto.trim().length < 2) {
      setResultados([]);
      return;
    }

    setCargando(true);
    try {
      const response = await fetch(`/api/geocoding?q=${encodeURIComponent(texto)}`);
      const data = await response.json();
      setResultados(response.ok ? data.results ?? [] : []);
      setAbierto(true);
    } catch {
      setResultados([]);
    } finally {
      setCargando(false);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setQuery(value);
    onChange?.(value);
    setAbierto(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => buscar(value), 350);
  }

  function handleSeleccionarProvincia(provincia: string) {
    setQuery(provincia);
    onChange?.(provincia);
    buscar(provincia);
  }

  function handleSeleccionar(resultado: ResultadoOsm) {
    const lugar = seleccionarResultado(resultado);
    setQuery(lugar.lugar);
    onChange?.(lugar.lugar);
    setResultados([]);
    setAbierto(false);
    onSelect(lugar);
  }

  function usarUbicacionActual() {
    if (!navigator.geolocation) {
      setErrorUbicacion("Tu navegador no permite geolocalización.");
      return;
    }

    setCargando(true);
    setErrorUbicacion("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `/api/geocoding?lat=${coords.latitude}&lon=${coords.longitude}`,
          );
          const data = await response.json();
          const resultado = data.results?.[0] as ResultadoOsm | undefined;
          const lugar = resultado
            ? seleccionarResultado(resultado)
            : {
                lat: coords.latitude,
                lng: coords.longitude,
                lugar: `Ubicación precisa (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
              };
          setQuery(lugar.lugar);
          onChange?.(lugar.lugar);
          onSelect(lugar);
        } catch {
          const lugar = {
            lat: coords.latitude,
            lng: coords.longitude,
            lugar: `Ubicación precisa (${coords.latitude.toFixed(5)}, ${coords.longitude.toFixed(5)})`,
          };
          setQuery(lugar.lugar);
          onChange?.(lugar.lugar);
          onSelect(lugar);
        } finally {
          setCargando(false);
        }
      },
      () => {
        setErrorUbicacion("No pudimos obtener tu ubicación. Revisá los permisos del navegador.");
        setCargando(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }

  function handleLimpiar() {
    setQuery("");
    onChange?.("");
    setResultados([]);
    setAbierto(false);
    setErrorUbicacion("");
    onSelect({ lat: 0, lng: 0, lugar: "", localidad: "", departamento: "", provincia: "" });
  }

  const mostrarListado = abierto && (resultados.length > 0 || provinciasVisibles.length > 0);

  return (
    <div ref={wrapperRef} className="geocoder-custom-wrapper">
      <div className="geocoder-input-row">
        <span className="geocoder-icon" aria-hidden="true">⌕</span>
        <input
          type="text"
          className="geocoder-input"
          placeholder="Buscá provincia, localidad, partido o dirección..."
          value={query}
          onChange={handleInput}
          onFocus={() => setAbierto(true)}
          autoComplete="off"
        />
        {cargando && <span className="geocoder-spinner">⟳</span>}
        {query && !cargando && <button type="button" className="geocoder-clear" onClick={handleLimpiar} aria-label="Limpiar ubicación">×</button>}
      </div>
      <button type="button" className="geocoder-precise" onClick={usarUbicacionActual} disabled={cargando}>
        Usar mi ubicación precisa
      </button>
      {errorUbicacion && <span className="geocoder-error">{errorUbicacion}</span>}

      {mostrarListado && (
        <ul className="geocoder-dropdown">
          {resultados.map((resultado) => (
            <li key={resultado.place_id} className="geocoder-option" onMouseDown={() => handleSeleccionar(resultado)}>
              <span className="geocoder-option-icon" aria-hidden="true">⌖</span>
              <span className="geocoder-option-text">{resultado.display_name}</span>
            </li>
          ))}
          {!resultados.length && provinciasVisibles.map((provincia) => (
            <li key={provincia} className="geocoder-option" onMouseDown={() => handleSeleccionarProvincia(provincia)}>
              <span className="geocoder-option-icon" aria-hidden="true">⌖</span>
              <span className="geocoder-option-text">{provincia}, Argentina</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
