"use client";

import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import Link from "next/link";
import { MAPBOX_TOKEN, MAP_DEFAULTS } from "@/lib/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

interface CampoPin {
  id: string;
  titulo: string;
  provincia: string;
  localidad?: string;
  lat: number;
  lng: number;
  hectareas: number;
  aptitud: string;
  precio_ha?: number;
  moneda?: string;
}

interface Props {
  campos: CampoPin[];
}

export default function CampoMapa({ campos }: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [mapError, setMapError] = useState(!MAPBOX_TOKEN);

  useEffect(() => {
    if (map.current || !mapContainer.current || !MAPBOX_TOKEN) return;

    try {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAP_DEFAULTS.style,
        center: MAP_DEFAULTS.center,
        zoom: MAP_DEFAULTS.zoom,
      });
    } catch {
      queueMicrotask(() => setMapError(true));
      return;
    }

    map.current.on("error", () => setMapError(true));

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      map.current?.resize();

      // Agregar fuente de datos
      map.current.addSource("campos", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: campos.map((c) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [c.lng, c.lat] },
            properties: { ...c },
          })),
        },
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      });

      // Clusters
      map.current.addLayer({
        id: "clusters",
        type: "circle",
        source: "campos",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2d6a2d",
          "circle-radius": ["step", ["get", "point_count"], 20, 5, 28, 20, 36],
          "circle-opacity": 0.9,
        },
      });

      map.current.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "campos",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-size": 13,
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        },
        paint: { "text-color": "#fff" },
      });

      // Pins individuales
      map.current.addLayer({
        id: "campos-pins",
        type: "circle",
        source: "campos",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#2d6a2d",
          "circle-radius": 10,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Click en cluster → zoom
      map.current.on("click", "clusters", (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = features[0].properties?.cluster_id;
        const source = map.current!.getSource(
          "campos",
        ) as mapboxgl.GeoJSONSource;
        const geometry = features[0]?.geometry;
        if (!geometry || geometry.type !== "Point") return;
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return;
          map.current.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom ?? 8,
          });
        });
      });

      // Click en pin individual → mostrar panel
      map.current.on("click", "campos-pins", (e) => {
        const props = e.features?.[0]?.properties;
        if (props) setSelectedCampo(props as CampoPin);
      });

      // Cursores
      map.current.on("mouseenter", "clusters", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "clusters", () => {
        map.current!.getCanvas().style.cursor = "";
      });
      map.current.on("mouseenter", "campos-pins", () => {
        map.current!.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", "campos-pins", () => {
        map.current!.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [campos]);

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
            <span>Abrilo para explorar ubicaciones y detalles.</span>
            <Link href="/campos/mapa">Abrir mapa interactivo →</Link>
          </div>
        </div>
      )}

      {selectedCampo && (
        <div className="mapa-panel">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedCampo(null)}
          >
            ×
          </button>
          <p className="mapa-panel-aptitud">
            {APTITUD_LABEL[selectedCampo.aptitud]}
          </p>
          <h3 className="mapa-panel-titulo">{selectedCampo.titulo}</h3>
          <p className="mapa-panel-ubicacion">
            📍{" "}
            {[selectedCampo.localidad, selectedCampo.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-panel-datos">
            <span>{selectedCampo.hectareas.toLocaleString("es-AR")} ha</span>
            {selectedCampo.precio_ha && (
              <span>
                {selectedCampo.moneda}{" "}
                {selectedCampo.precio_ha.toLocaleString("es-AR")}/ha
              </span>
            )}
          </div>
          <Link href={`/campos/${selectedCampo.id}`} className="mapa-panel-btn">
            Ver campo →
          </Link>
        </div>
      )}

      <div className="mapa-contador">
        {campos.length} campo{campos.length !== 1 ? "s" : ""} en el mapa
      </div>
    </div>
  );
}
