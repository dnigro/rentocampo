"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { V3Campo } from "./V3Explorer";
import { COUNTRIES, type CountryCode } from "@/data/countries";

type Props = { campos: V3Campo[]; country: CountryCode; selectedId: string | null; onSelect: (id: string) => void };

export default function V3Map({ campos, country, selectedId, onSelect }: Props) {
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Map<string, Marker>>(new Map());
  const selectRef = useRef(onSelect);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const markers = markerRef.current;
    async function initialize() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const region = COUNTRIES[country];
      map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true })
        .setView([...region.mapCenter] as [number, number], region.mapZoom);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).on("tileerror", () => { if (!cancelled) setMapError(true); }).addTo(map);
      const locations: [number, number][] = [];
      markers.clear();
      for (const campo of campos) {
        if (campo.lat == null || campo.lng == null) continue;
        const position: [number, number] = [campo.lat, campo.lng];
        locations.push(position);
        const number = campo.hectareas != null ? Number(campo.hectareas).toLocaleString("es-AR") : "";
        const label = number ? number + " ha" : "Campo";
        const marker = L.marker(position, {
          icon: L.divIcon({
            html: '<span class="v3-price-pin">' + label + '</span>',
            className: "v3-pin-wrapper",
            iconSize: [94, 38],
            iconAnchor: [47, 38]
          }),
          title: campo.titulo
        }).addTo(map);
        marker.on("click", () => selectRef.current(campo.id));
        markers.set(campo.id, marker);
      }
      if (locations.length > 0) {
        map.fitBounds(L.latLngBounds(locations).pad(0.2), { maxZoom: 9 });
      }
      resizeObserver = new ResizeObserver(() => { if (!cancelled) map?.invalidateSize(); });
      resizeObserver.observe(containerRef.current);
      window.setTimeout(() => { if (!cancelled) map?.invalidateSize(); }, 100);
    }
    void initialize().catch(() => { if (!cancelled) setMapError(true); });
    return () => {
      cancelled = true;
      markers.clear();
      resizeObserver?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [campos, country]);

  useEffect(() => {
    markerRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      element?.classList.toggle("v3-marker-active", id === selectedId);
      if (id === selectedId) marker.setZIndexOffset(1000);
      else marker.setZIndexOffset(0);
    });
  }, [selectedId, campos]);

  return <div className="v3-map-frame">
    <div className="v3-map-canvas" ref={containerRef} role="region" aria-label="Mapa interactivo de campos publicados" />
    {mapError && <p className="v3-map-error" role="status">No pudimos cargar el mapa completo. Podés seguir consultando las fichas del listado.</p>}
  </div>;
}
