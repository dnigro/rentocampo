"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import Link from "next/link";

interface CampoPin {
  id: string;
  titulo: string;
  provincia: string;
  localidad?: string;
  latitud: number;
  longitud: number;
  hectareas: number;
  aptitud: string;
  precio?: number;
  moneda?: string;
}

interface Props {
  campos: CampoPin[];
}

export default function CampoMapa({ campos }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [mapError, setMapError] = useState(false);

  const camposConCoordenadas = useMemo(
    () =>
      campos.filter(
        (campo) =>
          Number.isFinite(campo.latitud) &&
          Number.isFinite(campo.longitud) &&
          campo.latitud >= -90 &&
          campo.latitud <= 90 &&
          campo.longitud >= -180 &&
          campo.longitud <= 180,
      ),
    [campos],
  );

  useEffect(() => {
    let cancelled = false;

    void import("leaflet")
      .then((L) => {
        if (cancelled || map.current || !mapContainer.current) return;

        const leafletMap = L.map(mapContainer.current).setView([-34, -63.5], 4.5);
        map.current = leafletMap;

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMap);
        L.control.zoom({ position: "topright" }).addTo(leafletMap);

        const coordinates: [number, number][] = [];
        camposConCoordenadas.forEach((campo) => {
          const position: [number, number] = [campo.latitud, campo.longitud];
          coordinates.push(position);
          L.circleMarker(position, {
            radius: 9,
            color: "#ffffff",
            weight: 2,
            fillColor: "#2d6a2d",
            fillOpacity: 1,
          })
            .addTo(leafletMap)
            .on("click", () => setSelectedCampo(campo));
        });

        if (coordinates.length > 0) {
          leafletMap.fitBounds(L.latLngBounds(coordinates), {
            padding: [48, 48],
            maxZoom: 12,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setMapError(true);
      });

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [camposConCoordenadas]);

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  return (
    <div className="mapa-wrapper">
      <div ref={mapContainer} className={`mapa-canvas ${mapError ? "mapa-canvas-oculto" : ""}`} />

      {mapError && (
        <div className="mapa-fallback">
          <iframe
            className="mapa-fallback-frame"
            title="Mapa cartográfico de Argentina"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-73.8%2C-55.3%2C-53.4%2C-21.4&layer=mapnik"
            loading="lazy"
          />
          <div className="mapa-fallback-aviso">
            <strong>Mapa de campos publicados</strong>
            <span>No se pudo cargar el mapa interactivo.</span>
            <Link href="/campos">Ver campos disponibles →</Link>
          </div>
        </div>
      )}

      {selectedCampo && (
        <div className="mapa-panel">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedCampo(null)}
            aria-label="Cerrar detalle del campo"
          >
            ×
          </button>
          <p className="mapa-panel-aptitud">
            {APTITUD_LABEL[selectedCampo.aptitud] ?? selectedCampo.aptitud}
          </p>
          <h3 className="mapa-panel-titulo">{selectedCampo.titulo}</h3>
          <p className="mapa-panel-ubicacion">
            {[selectedCampo.localidad, selectedCampo.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-panel-datos">
            <span>{selectedCampo.hectareas.toLocaleString("es-AR")} ha</span>
            {selectedCampo.precio && (
              <span>
                {selectedCampo.moneda}{" "}
                {selectedCampo.precio.toLocaleString("es-AR")} total
              </span>
            )}
          </div>
          <Link href={`/campos/${selectedCampo.id}`} className="mapa-panel-btn">
            Ver campo →
          </Link>
        </div>
      )}

      <div className="mapa-contador">
        {camposConCoordenadas.length} campo{camposConCoordenadas.length !== 1 ? "s" : ""} en el mapa
      </div>
    </div>
  );
}
