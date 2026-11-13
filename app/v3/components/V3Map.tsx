"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { V3Campo } from "./V3Explorer";
import { markerLabel, type MapBounds } from "@/lib/campos/map-search";
import { COUNTRIES, type CountryCode } from "@/data/countries";

type Props = { campos: V3Campo[]; country: CountryCode; selectedId: string | null; onSelect: (id: string) => void; onViewportChange: (bounds: MapBounds) => void; initialBounds?: MapBounds | null };

export default function V3Map({ campos, country, selectedId, onSelect, onViewportChange, initialBounds }: Props) {
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Map<string, Marker>>(new Map());
  const selectRef = useRef(onSelect);
  const viewportRef = useRef(onViewportChange);
  const selectedRef = useRef(selectedId);
  const initialBoundsRef = useRef(initialBounds);
  useEffect(() => { initialBoundsRef.current = initialBounds; }, [initialBounds]);
  useEffect(() => { viewportRef.current = onViewportChange; }, [onViewportChange]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let cleanupInteractions: (() => void) | null = null;
    const markers = markerRef.current;
    async function initialize() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const region = COUNTRIES[country];
      map = L.map(containerRef.current, { scrollWheelZoom: false, zoomControl: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false })
        .setView([...region.mapCenter] as [number, number], region.mapZoom);
      mapRef.current = map;
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).on("tileerror", () => { if (!cancelled) setMapError(true); }).addTo(map);
      const locations: [number, number][] = [];
      markers.clear();
      const colocated = new Map<string, { total: number; seen: number }>();
      for (const item of campos) {
        if (item.lat == null || item.lng == null) continue;
        const key = `${item.lat},${item.lng}`;
        const group = colocated.get(key) || { total: 0, seen: 0 };
        group.total++; colocated.set(key, group);
      }
      for (const campo of campos) {
        if (campo.lat == null || campo.lng == null) continue;
        const position: [number, number] = [campo.lat, campo.lng];
        const group = colocated.get(`${campo.lat},${campo.lng}`)!;
        const slot = group.seen++;
        // Offset labels at shared coordinates; never invent a different geographic location.
        const columns = Math.min(group.total, 3);
        const anchorX = 66 + ((slot % 3) - (columns - 1) / 2) * 136;
        const anchorY = 38 + Math.floor(slot / 3) * 40;
        locations.push(position);
        const label = campo.kind === "servicio" ? (country === "BR" ? "Serviço" : country === "US" ? "Service" : "Servicio") : markerLabel(campo, region.locale);
        // Build text with DOM APIs: currency/data must never be interpreted as HTML.
        const pin = document.createElement("span");
        pin.className = `v3-price-pin ${campo.kind === "servicio" ? "rural-service-pin" : "rural-field-pin"}`;
        pin.textContent = label;
        const marker = L.marker(position, {
          icon: L.divIcon({
            html: pin,
            className: "v3-pin-wrapper",
            iconSize: [132, 38],
            iconAnchor: [anchorX, anchorY]
          }),
          title: `${campo.titulo} · ${label}`
        }).addTo(map);
        marker.on("click", () => selectRef.current(campo.id));
        markers.set(campo.id, marker);
        if (campo.id === selectedRef.current) {
          marker.getElement()?.classList.add("v3-marker-active");
          marker.setZIndexOffset(1000);
        }
      }
      const viewport = initialBoundsRef.current;
      if (viewport) {
        const east = viewport.east < viewport.west ? viewport.east + 360 : viewport.east;
        map.fitBounds([[viewport.south, viewport.west], [viewport.north, east]], { animate: false });
      } else if (locations.length > 0) {
        map.fitBounds(L.latLngBounds(locations).pad(0.2), { maxZoom: 9, animate: false });
      }
      let userMoved = false;
      map.on("dragstart", () => { userMoved = true; });
      const container = containerRef.current;
      const markInteraction = (event: Event) => {
        if (event.type === "wheel" && !map?.scrollWheelZoom.enabled()) return;
        if (event.type === "keydown" && !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-", "="].includes((event as KeyboardEvent).key)) return;
        if (event.type === "click" && !(event.target instanceof Element && event.target.closest(".leaflet-control-zoom"))) return;
        userMoved = true;
      };
      // Track real interactions, excluding initial fitBounds and selection panTo.
      for (const type of ["click", "wheel", "keydown", "touchstart"]) container.addEventListener(type, markInteraction, { capture: true, passive: true });
      cleanupInteractions = () => {
        for (const type of ["click", "wheel", "keydown", "touchstart"]) container.removeEventListener(type, markInteraction, true);
      };
      map.on("moveend", () => {
        if (!map || !userMoved) return;
        userMoved = false;
        const bounds = map.getBounds();
        viewportRef.current({ north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() });
      });
      resizeObserver = new ResizeObserver(() => { if (!cancelled) map?.invalidateSize(); });
      resizeObserver.observe(containerRef.current);
      setMapReady(true);
      window.setTimeout(() => { if (!cancelled) map?.invalidateSize(); }, 100);
    }
    void initialize().catch(() => { if (!cancelled) setMapError(true); });
    return () => {
      cancelled = true;
      markers.clear();
      resizeObserver?.disconnect();
      cleanupInteractions?.();
      map?.remove();
      mapRef.current = null;
    };
  }, [campos, country]);

  useEffect(() => {
    markerRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      element?.classList.toggle("v3-marker-active", id === selectedId);
      if (id === selectedId) {
        marker.setZIndexOffset(1000);
        // Keep the selected location visible without changing the user's zoom.
        const position = marker.getLatLng();
        if (mapRef.current && !mapRef.current.getBounds().contains(position)) mapRef.current.panTo(position, { animate: false });
      }
      else marker.setZIndexOffset(0);
    });
  }, [selectedId, campos]);

  return <div className="v3-map-frame" aria-busy={!mapReady && !mapError}>
    <div className="v3-map-canvas" ref={containerRef} role="region" aria-label={country === "BR" ? "Mapa de terras e serviços" : country === "US" ? "Farmland and services map" : "Mapa de campos y servicios"} />
    {mapError && <p className="v3-map-error" role="status">No pudimos cargar el mapa completo. Podés seguir consultando las fichas del listado.</p>}
  </div>;
}
