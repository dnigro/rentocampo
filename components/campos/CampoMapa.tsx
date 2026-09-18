"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import { DEMANDA_ZONAS, type DemandaZona } from "@/data/demanda-zonas";
import { CENTROS_PROVINCIA, SERVICIO_LABEL, SERVICIOS_RURALES } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import { createClient } from "@/lib/supabase/client";

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
  prestadores: ServicioPin[];
  currentUserId?: string;
  initialVista?: "tierra" | "servicios";
}

interface ServicioPin {
  id: string;
  nombre: string;
  bio?: string;
  avatar_url?: string;
  servicios_rurales: ServicioRural[];
  zona_servicio?: string;
  provincia_servicio: string;
  localidad_servicio?: string;
}

export default function CampoMapa({
  campos,
  prestadores,
  currentUserId,
  initialVista = "tierra",
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const camposLayer = useRef<LayerGroup | null>(null);
  const demandaLayer = useRef<LayerGroup | null>(null);
  const serviciosLayer = useRef<LayerGroup | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaZona | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<ServicioPin | null>(null);
  const [vista, setVista] = useState<"tierra" | "servicios">(initialVista);
  const [categoriaServicio, setCategoriaServicio] = useState<ServicioRural | "todas">("todas");
  const [mostrarCampos, setMostrarCampos] = useState(true);
  const [mostrarDemanda, setMostrarDemanda] = useState(true);
  const [mapError, setMapError] = useState(false);
  const [supabase] = useState(createClient);
  const [resolvedUserId, setResolvedUserId] = useState<string | null | undefined>(
    currentUserId,
  );

  useEffect(() => {
    if (currentUserId) {
      setResolvedUserId(currentUserId);
      return;
    }

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setResolvedUserId(data.user?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, supabase]);

  function cambiarVista(nuevaVista: "tierra" | "servicios") {
    setVista(nuevaVista);
    setSelectedCampo(null);
    setSelectedDemanda(null);
    setSelectedServicio(null);
  }

  const prestadoresFiltrados = useMemo(
    () => prestadores.filter((prestador) =>
      categoriaServicio === "todas" || prestador.servicios_rurales?.includes(categoriaServicio),
    ),
    [categoriaServicio, prestadores],
  );

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
        const serviciosGroup = L.layerGroup();
        camposLayer.current = camposGroup;
        demandaLayer.current = demandaGroup;
        serviciosLayer.current = serviciosGroup;

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

        prestadoresFiltrados.forEach((prestador, index) => {
          const centro = CENTROS_PROVINCIA[prestador.provincia_servicio];
          if (!centro) return;
          const offset = ((index % 5) - 2) * 0.16;
          const position: [number, number] = [centro[0] + offset, centro[1] - offset];
          if (vista === "servicios") coordinates.push(position);
          L.circleMarker(position, {
            radius: 10,
            color: "#0b0b0b",
            weight: 2,
            fillColor: "#f6c500",
            fillOpacity: 1,
          })
            .addTo(serviciosGroup)
            .bindTooltip(`${prestador.nombre} · Servicios rurales`)
            .on("click", () => {
              setSelectedCampo(null);
              setSelectedDemanda(null);
              setSelectedServicio(prestador);
            });
        });

        if (vista === "servicios") {
          leafletMap.removeLayer(camposGroup);
          leafletMap.removeLayer(demandaGroup);
          serviciosGroup.addTo(leafletMap);
        }

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
      serviciosLayer.current = null;
    };
  }, [camposConCoordenadas, prestadoresFiltrados, vista]);

  useEffect(() => {
    const leafletMap = map.current;
    if (!leafletMap) return;
    const tierraVisible = vista === "tierra";
    [camposLayer.current, demandaLayer.current].forEach((layer) => {
      if (!layer) return;
      if (tierraVisible && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
      if (!tierraVisible && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
    });
    const serviceLayer = serviciosLayer.current;
    if (serviceLayer) {
      if (!tierraVisible && !leafletMap.hasLayer(serviceLayer)) serviceLayer.addTo(leafletMap);
      if (tierraVisible && leafletMap.hasLayer(serviceLayer)) leafletMap.removeLayer(serviceLayer);
    }
  }, [vista, prestadoresFiltrados]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = camposLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarCampos && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarCampos && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
  }, [mostrarCampos]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = demandaLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarDemanda && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarDemanda && leafletMap.hasLayer(layer)) leafletMap.removeLayer(layer);
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
          <div className="mapa-modos" role="group" aria-label="Qué querés encontrar">
            <button type="button" className={vista === "tierra" ? "activo" : ""} onClick={() => cambiarVista("tierra")}>Tierra productiva</button>
            <button type="button" className={vista === "servicios" ? "activo" : ""} onClick={() => cambiarVista("servicios")}>Servicios rurales</button>
          </div>
          {vista === "tierra" ? <>
          <p className="mapa-filtros-titulo">Mostrar en el mapa</p>
          <button
            type="button"
            className={`mapa-filtro ${mostrarCampos ? "activo" : ""}`}
            aria-pressed={mostrarCampos}
            onClick={() => {
              setMostrarCampos((actual) => !actual);
              setSelectedCampo(null);
            }}
          >
            <span className="mapa-filtro-punto mapa-filtro-punto-campo" />
            Campos disponibles
          </button>
          <button
            type="button"
            className={`mapa-filtro ${mostrarDemanda ? "activo" : ""}`}
            aria-pressed={mostrarDemanda}
            onClick={() => {
              setMostrarDemanda((actual) => !actual);
              setSelectedDemanda(null);
            }}
          >
            <span className="mapa-filtro-punto mapa-filtro-punto-demanda" />
            Demanda por zona
          </button>
          </> : <div className="mapa-servicio-filtro">
            <label htmlFor="categoria-servicio">Tipo de servicio</label>
            <select id="categoria-servicio" value={categoriaServicio} onChange={(event) => setCategoriaServicio(event.target.value as ServicioRural | "todas")}>
              <option value="todas">Todos los servicios</option>
              {SERVICIOS_RURALES.map((servicio) => <option key={servicio.value} value={servicio.value}>{servicio.label}</option>)}
            </select>
          </div>}
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

      {selectedServicio && (
        <div className="mapa-panel mapa-panel-servicio">
          <button className="mapa-panel-close" onClick={() => setSelectedServicio(null)} aria-label="Cerrar detalle del servicio">×</button>
          <p className="mapa-panel-aptitud mapa-panel-aptitud-servicio">Servicios rurales</p>
          <h3 className="mapa-panel-titulo">{selectedServicio.nombre}</h3>
          <p className="mapa-panel-ubicacion">{[selectedServicio.localidad_servicio, selectedServicio.provincia_servicio].filter(Boolean).join(", ")}</p>
          <div className="mapa-servicio-tags">
            {selectedServicio.servicios_rurales.map((servicio) => <span key={servicio}>{SERVICIO_LABEL[servicio] ?? servicio}</span>)}
          </div>
          {selectedServicio.zona_servicio && <p className="mapa-panel-descripcion"><strong>Zona de cobertura:</strong> {selectedServicio.zona_servicio}</p>}
          {selectedServicio.bio && <p className="mapa-panel-descripcion">{selectedServicio.bio}</p>}
          {resolvedUserId === undefined ? (
            <div className="mapa-panel-btn mapa-panel-btn-propio" aria-disabled="true">
              Verificando sesión…
            </div>
          ) : selectedServicio.id === resolvedUserId ? (
            <div className="mapa-panel-btn mapa-panel-btn-propio" aria-disabled="true">
              Este es tu servicio
            </div>
          ) : (
            <Link href={`/mensajes/direct/${selectedServicio.id}`} className="mapa-panel-btn">
              Chatear online →
            </Link>
          )}
        </div>
      )}

      <div className="mapa-contador">
        {vista === "tierra" ? <><strong>{camposConCoordenadas.length}</strong> campos reales · <strong>{DEMANDA_ZONAS.length}</strong> zonas con demanda</> : <><strong>{prestadoresFiltrados.length}</strong> prestadores de servicios</>}
      </div>
    </div>
  );
}
