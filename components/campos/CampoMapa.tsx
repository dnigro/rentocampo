"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
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

interface DemandaZona {
  id: string;
  zona: string;
  provincia: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}

interface Props {
  campos: CampoPin[];
}

const DEMANDA_ZONAS: DemandaZona[] = [
  { id: "pergamino", zona: "Pergamino", provincia: "Buenos Aires", latitud: -33.89, longitud: -60.57, descripcion: "Interés de productores en campos agrícolas de la zona núcleo." },
  { id: "junin", zona: "Junín", provincia: "Buenos Aires", latitud: -34.59, longitud: -60.95, descripcion: "Búsquedas de lotes agrícolas y establecimientos mixtos." },
  { id: "tandil", zona: "Tandil", provincia: "Buenos Aires", latitud: -37.33, longitud: -59.14, descripcion: "Interés en campos agrícolas, ganaderos y mixtos." },
  { id: "azul", zona: "Azul", provincia: "Buenos Aires", latitud: -36.78, longitud: -59.86, descripcion: "Demanda potencial de establecimientos ganaderos y mixtos." },
  { id: "trenque-lauquen", zona: "Trenque Lauquen", provincia: "Buenos Aires", latitud: -35.97, longitud: -62.73, descripcion: "Productores interesados en campos agrícolas y ganaderos." },
  { id: "bahia-blanca", zona: "Bahía Blanca", provincia: "Buenos Aires", latitud: -38.72, longitud: -62.27, descripcion: "Búsquedas en el sudoeste bonaerense y áreas cercanas." },
  { id: "rio-cuarto", zona: "Río Cuarto", provincia: "Córdoba", latitud: -33.13, longitud: -64.35, descripcion: "Interés en campos agrícolas y mixtos del sur cordobés." },
  { id: "marcos-juarez", zona: "Marcos Juárez", provincia: "Córdoba", latitud: -32.69, longitud: -62.11, descripcion: "Demanda de lotes productivos en el sudeste provincial." },
  { id: "villa-maria", zona: "Villa María", provincia: "Córdoba", latitud: -32.41, longitud: -63.24, descripcion: "Búsquedas agrícolas, ganaderas y tamberas en la región." },
  { id: "jesus-maria", zona: "Jesús María", provincia: "Córdoba", latitud: -30.98, longitud: -64.09, descripcion: "Interés productivo en el centro y norte de Córdoba." },
  { id: "venado-tuerto", zona: "Venado Tuerto", provincia: "Santa Fe", latitud: -33.75, longitud: -61.97, descripcion: "Demanda potencial en campos agrícolas de alta productividad." },
  { id: "rosario", zona: "Rosario", provincia: "Santa Fe", latitud: -32.95, longitud: -60.67, descripcion: "Productores buscando oportunidades en el sur santafesino." },
  { id: "rafaela", zona: "Rafaela", provincia: "Santa Fe", latitud: -31.25, longitud: -61.49, descripcion: "Interés en establecimientos mixtos, agrícolas y tamberos." },
  { id: "reconquista", zona: "Reconquista", provincia: "Santa Fe", latitud: -29.15, longitud: -59.65, descripcion: "Búsquedas ganaderas y agrícolas en el norte provincial." },
  { id: "parana", zona: "Paraná", provincia: "Entre Ríos", latitud: -31.74, longitud: -60.52, descripcion: "Interés en campos agrícolas y ganaderos entrerrianos." },
  { id: "gualeguaychu", zona: "Gualeguaychú", provincia: "Entre Ríos", latitud: -33.01, longitud: -58.52, descripcion: "Demanda potencial de establecimientos productivos." },
  { id: "general-pico", zona: "General Pico", provincia: "La Pampa", latitud: -35.66, longitud: -63.76, descripcion: "Productores interesados en campos mixtos y ganaderos." },
  { id: "mendoza", zona: "Mendoza", provincia: "Mendoza", latitud: -32.89, longitud: -68.84, descripcion: "Interés en tierras productivas y proyectos bajo riego." },
  { id: "salta", zona: "Salta", provincia: "Salta", latitud: -24.79, longitud: -65.41, descripcion: "Búsquedas agrícolas y ganaderas en el noroeste argentino." },
  { id: "alto-valle", zona: "Alto Valle", provincia: "Río Negro", latitud: -38.95, longitud: -67.99, descripcion: "Interés en tierras productivas y establecimientos bajo riego." },
];

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
