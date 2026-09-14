"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import { DEMANDA_ZONAS, type DemandaZona } from "@/data/demanda-zonas";

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
  const camposLayer = useRef<LayerGroup | null>(null);
  const demandaLayer = useRef<LayerGroup | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaZona | null>(null);
  const [mostrarCampos, setMostrarCampos] = useState(true);
  const [mostrarDemanda, setMostrarDemanda] = useState(true);
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

        const camposGroup = L.layerGroup().addTo(leafletMap);
        const demandaGroup = L.layerGroup().addTo(leafletMap);
        camposLayer.current = camposGroup;
        demandaLayer.current = demandaGroup;

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
            .addTo(camposGroup)
            .bindTooltip("Campo disponible")
            .on("click", () => {
              setSelectedDemanda(null);
              setSelectedCampo(campo);
            });
        });

        DEMANDA_ZONAS.forEach((demanda) => {
          const position: [number, number] = [demanda.latitud, demanda.longitud];
          coordinates.push(position);
          L.circleMarker(position, {
            radius: 11,
            color: "#1a3a1a",
            weight: 2,
            dashArray: "4 3",
            fillColor: "#f4c542",
            fillOpacity: 0.82,
          })
            .addTo(demandaGroup)
            .bindTooltip(`Demanda en ${demanda.zona}`)
            .on("click", () => {
              setSelectedCampo(null);
              setSelectedDemanda(demanda);
            });
        });

        if (coordinates.length > 0) {
          leafletMap.fitBounds(L.latLngBounds(coordinates), {
            padding: [48, 48],
            maxZoom: 7,
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
      camposLayer.current = null;
      demandaLayer.current = null;
    };
  }, [camposConCoordenadas]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = camposLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarCampos && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarCampos && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
    if (!mostrarCampos) setSelectedCampo(null);
  }, [mostrarCampos]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = demandaLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarDemanda && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarDemanda && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
    if (!mostrarDemanda) setSelectedDemanda(null);
  }, [mostrarDemanda]);

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  return (
    <div className="mapa-wrapper">
      <div
        ref={mapContainer}
        className={`mapa-canvas ${mapError ? "mapa-canvas-oculto" : ""}`}
      />

      {mapError && (
        <div className="mapa-fallback">
          <iframe
            className="mapa-fallback-frame"
            title="Mapa cartográfico de Argentina"
            src="https://www.openstreetmap.org/export/embed.html?bbox=-73.8%2C-55.3%2C-53.4%2C-21.4&layer=mapnik"
            loading="lazy"
          />
          <div className="mapa-fallback-aviso">
            <strong>Mapa de oportunidades rurales</strong>
            <span>No se pudo cargar el mapa interactivo.</span>
            <Link href="/campos">Ver campos disponibles →</Link>
          </div>
        </div>
      )}

      {!mapError && (
        <div className="mapa-filtros" aria-label="Capas visibles del mapa">
          <p className="mapa-filtros-titulo">Mostrar en el mapa</p>
          <button
            type="button"
            className={`mapa-filtro ${mostrarCampos ? "activo" : ""}`}
            aria-pressed={mostrarCampos}
            onClick={() => setMostrarCampos((actual) => !actual)}
          >
            <span className="mapa-filtro-punto mapa-filtro-punto-campo" />
            Campos disponibles
          </button>
          <button
            type="button"
            className={`mapa-filtro ${mostrarDemanda ? "activo" : ""}`}
            aria-pressed={mostrarDemanda}
            onClick={() => setMostrarDemanda((actual) => !actual)}
          >
            <span className="mapa-filtro-punto mapa-filtro-punto-demanda" />
            Demanda por zona
          </button>
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

      {selectedDemanda && (
        <div className="mapa-panel mapa-panel-demanda">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedDemanda(null)}
            aria-label="Cerrar detalle de la demanda"
          >
            ×
          </button>
          <p className="mapa-panel-aptitud mapa-panel-aptitud-demanda">
            Demanda por zona
          </p>
          <h3 className="mapa-panel-titulo">
            Productores buscan campos en {selectedDemanda.zona}
          </h3>
          <p className="mapa-panel-ubicacion">{selectedDemanda.provincia}</p>
          <p className="mapa-panel-descripcion">{selectedDemanda.descripcion}</p>
          <p className="mapa-panel-aclaracion">
            Marcador institucional de RentoCampo. No representa un campo publicado.
          </p>
          <Link
            href={`/register?tipo=propietario&zona=${encodeURIComponent(selectedDemanda.zona)}`}
            className="mapa-panel-btn mapa-panel-btn-demanda"
          >
            Publicar campo en esta zona
          </Link>
        </div>
      )}

      <div className="mapa-contador">
        <strong>{camposConCoordenadas.length}</strong> campo
        {camposConCoordenadas.length !== 1 ? "s" : ""} real
        {camposConCoordenadas.length !== 1 ? "es" : ""} ·{" "}
        <strong>{DEMANDA_ZONAS.length}</strong> zonas con demanda
      </div>
    </div>
  );
}
