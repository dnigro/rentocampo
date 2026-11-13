"use client";

import { Maximize2, Minimize2, Plus, Minus, Layers, LocateFixed, Scan, X } from "lucide-react";
import { v3Text } from "@/lib/i18n/v3-copy";
import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import type { V3Campo } from "./V3Explorer";
import { type MapBounds } from "@/lib/campos/map-search";
import { COUNTRIES, type CountryCode } from "@/data/countries";

type Props = { campos: V3Campo[]; country: CountryCode; selectedId: string | null; onSelect: (id: string) => void; onViewportChange: (bounds: MapBounds) => void; initialBounds?: MapBounds | null; getHref?: (id: string) => string };

export default function V3Map({ campos, country, selectedId, onSelect, onViewportChange, initialBounds, getHref }: Props) {
  const [expanded,setExpanded]=useState(false);
  const [basemap,setBasemap]=useState<"standard"|"satellite">("standard");
  const [layerMenu,setLayerMenu]=useState(false);
  const [locating,setLocating]=useState(false);
  const [locationError,setLocationError]=useState("");
  const baseLayerRef=useRef<import("leaflet").TileLayer | null>(null);
  const allBoundsRef=useRef<import("leaflet").LatLngBounds | null>(null);
  const frameRef=useRef<HTMLDivElement>(null);
  const expandButtonRef=useRef<HTMLButtonElement>(null);
  const t=(es:string,pt:string,en:string)=>country==="BR"?pt:country==="US"?en:es;
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Map<string, Marker>>(new Map());
  const selectRef = useRef(onSelect);
  const hrefRef = useRef(getHref);
  useEffect(() => { hrefRef.current = getHref; }, [getHref]);
  const viewportRef = useRef(onViewportChange);
  const selectedRef = useRef(selectedId);
  const zoomLockedUntil = useRef(0);
  const markControlInteraction = useRef<() => void>(() => {});
  const initialBoundsRef = useRef(initialBounds);
  useEffect(() => { initialBoundsRef.current = initialBounds; }, [initialBounds]);
  useEffect(() => { viewportRef.current = onViewportChange; }, [onViewportChange]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  const camposRef = useRef(campos);
  useEffect(() => { camposRef.current = campos; }, [campos]);
  useEffect(() => {
    let cancelled = false;
    let map: LeafletMap | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let viewportTimer: ReturnType<typeof setTimeout> | undefined;
    let cleanupInteractions: (() => void) | null = null;
    const markers = markerRef.current;
    async function initialize() {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;
      const region = COUNTRIES[country];
      map = L.map(containerRef.current, { scrollWheelZoom: true, zoomControl: false, zoomAnimation: true, fadeAnimation: true, markerZoomAnimation: true })
        .setView([...region.mapCenter] as [number, number], region.mapZoom);
      mapRef.current = map;
      const tileLayer=L.tileLayer(basemap==="satellite" ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: basemap==="satellite" ? 'Tiles &copy; Esri' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
      }).on("tileerror", () => { if (!cancelled) setMapError(true); }).addTo(map);
      baseLayerRef.current=tileLayer;
      const locations: [number, number][] = [];
      markers.clear();
      const colocated = new Map<string, number>();
      for (const item of camposRef.current) {
        if (item.lat == null || item.lng == null) continue;
        const key = `${item.lat},${item.lng}`;
        colocated.set(key,(colocated.get(key)||0)+1);
      }
      const seen = new Map<string,number>();
      for (const campo of camposRef.current) {
        if (campo.lat == null || campo.lng == null) continue;
        const position: [number,number] = [campo.lat,campo.lng];
        locations.push(position);
        const key = `${campo.lat},${campo.lng}`;
        seen.set(key,(seen.get(key)||0)+1);
        const count = colocated.get(key)||1;
        const dot=document.createElement("span");
        dot.className="v3-dot-pin "+(campo.kind==="servicio"?"v3-dot-service":"v3-dot-field");
        dot.textContent=count>1?String(count):"";
        const marker=L.marker(position,{
          icon:L.divIcon({html:dot,className:"v3-dot-wrapper",iconSize:[26,26],iconAnchor:[13,13]}),
          title:campo.titulo,
          keyboard:true
        }).addTo(map);
        marker.bindTooltip(campo.titulo, { direction:"top", offset:[0,-14] });
        const popup = document.createElement("div");
        popup.className="rural-pro-popup";
        popup.style.cssText="display:flex;flex-direction:column;gap:8px;min-width:220px;max-width:280px;overflow-wrap:anywhere;white-space:normal;line-height:1.4";
        const heading = document.createElement("strong");
        heading.textContent = campo.titulo;
        heading.style.cssText = "font-size:15px;line-height:1.3";
        popup.appendChild(heading);
        const kind=document.createElement("span");kind.className="rural-pro-popup-kind";kind.textContent=campo.kind==="campo"?"Campo":"Servicio rural";popup.prepend(kind);
        const location = document.createElement("span");
        location.textContent = [campo.localidad, campo.provincia].filter(Boolean).join(", ");
        location.style.cssText = "color:#667085;font-size:13px";
        popup.appendChild(location);
        if(campo.kind==="campo" && campo.hectareas != null){const area=document.createElement("span");area.textContent=`${campo.hectareas.toLocaleString()} ha`;popup.appendChild(area);}
        if(campo.kind==="servicio" && "coverage" in campo && typeof campo.coverage === "string" && campo.coverage){const coverage=document.createElement("span");coverage.textContent=`Cobertura: ${campo.coverage}`;popup.appendChild(coverage);}
        const link = document.createElement("a");
        link.textContent = "Ver publicación ↗";
        link.href = hrefRef.current?.(campo.id) || "#";
        link.style.cssText = "font-weight:700;color:#12324b;text-decoration:underline";
        popup.appendChild(link);
        marker.bindPopup(popup, { autoPan: true, autoPanPaddingTopLeft: [24, 95], autoPanPaddingBottomRight: [24, 24], minWidth:240, maxWidth:300, closeButton:true, className:"rural-pro-leaflet-popup" });
        marker.on("click",()=>{
          selectRef.current(campo.id);
          // Keep current zoom and viewport: popup opens anchored to the clicked marker.
        });
        markers.set(campo.id,marker);
      }
      const viewport = initialBoundsRef.current;
      allBoundsRef.current=locations.length ? L.latLngBounds(locations).pad(0.2) : null;
      if (viewport) {
        const east = viewport.east < viewport.west ? viewport.east + 360 : viewport.east;
        map.fitBounds([[viewport.south, viewport.west], [viewport.north, east]], { animate: false });
      } else if (locations.length > 0) {
        map.fitBounds(L.latLngBounds(locations).pad(0.2), { maxZoom: 9, animate: false });
      }
      let userMoved = false;
      markControlInteraction.current = () => { userMoved = true; };
      map.on("dragstart", () => { userMoved = true; });
      const container = containerRef.current;
      const markInteraction = (event: Event) => {
        if (event.type === "wheel" && !map?.scrollWheelZoom.enabled()) return;
        if (event.type === "keydown" && !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "+", "-", "="].includes((event as KeyboardEvent).key)) return;
        if (event.type === "click" && !(event.target instanceof Element && event.target.closest("[data-map-zoom]"))) return;
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
        clearTimeout(viewportTimer);
        viewportTimer = setTimeout(() => {
          if (cancelled || !map) return;
          const bounds = map.getBounds();
          viewportRef.current({ north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() });
        }, 350);
      });
      resizeObserver = new ResizeObserver(() => { if (!cancelled) map?.invalidateSize(); });
      resizeObserver.observe(containerRef.current);
      setMapReady(true);
      window.setTimeout(() => { if (!cancelled) map?.invalidateSize(); }, 100);
    }
    void initialize().catch(() => { if (!cancelled) setMapError(true); });
    return () => {
      cancelled = true;
      clearTimeout(viewportTimer);
      markControlInteraction.current = () => {};
      markers.clear();
      resizeObserver?.disconnect();
      cleanupInteractions?.();
      map?.remove();
      mapRef.current = null;
    };
  }, [country]);

  useEffect(()=>{
    const map=mapRef.current;
    if(!map || !baseLayerRef.current)return;
    const url=basemap==="satellite" ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    baseLayerRef.current.setUrl(url);
    baseLayerRef.current.options.attribution=basemap==="satellite" ? "Tiles © Esri" : "© OpenStreetMap contributors";
    map.attributionControl.setPrefix(false);
    map.attributionControl.removeAttribution(basemap==="satellite" ? "© OpenStreetMap contributors" : "Tiles © Esri");
    map.attributionControl.addAttribution(baseLayerRef.current.options.attribution);
    setMapError(false);
  },[basemap,mapReady]);

  useEffect(() => {
    markerRef.current.forEach((marker, id) => {
      const element = marker.getElement();
      element?.classList.toggle("v3-marker-active", id === selectedId);
      if (id === selectedId) {
        marker.setZIndexOffset(1000);

      }
      else marker.setZIndexOffset(0);
    });
  }, [selectedId, campos]);

  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow;document.body.style.overflow="hidden";
    const escape=(event:KeyboardEvent)=>{if(event.key==="Escape"){setExpanded(false);expandButtonRef.current?.focus();}};
    document.addEventListener("keydown",escape);
    return ()=>{document.body.style.overflow=previous;document.removeEventListener("keydown",escape);};
  },[expanded]);
  useEffect(()=>{
    const sync=()=>{if(!document.fullscreenElement)setExpanded(false);};
    document.addEventListener("fullscreenchange",sync);
    return ()=>document.removeEventListener("fullscreenchange",sync);
  },[]);
  function changeZoom(delta:number){
    const map = mapRef.current;
    if (!map || performance.now() < zoomLockedUntil.current) return;
    const nextZoom = Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), map.getZoom() + delta));
    if (nextZoom === map.getZoom()) return;
    zoomLockedUntil.current = performance.now() + 450;
    markControlInteraction.current();
    map.setZoom(nextZoom, { animate: !window.matchMedia("(prefers-reduced-motion: reduce)").matches });
  }
  function showAll(){const map=mapRef.current;const b=allBoundsRef.current;if(map&&b){map.closePopup();map.fitBounds(b,{maxZoom:10,animate:false,padding:[28,28]});}}
  function locate(){if(!navigator.geolocation){setLocationError("Ubicación no disponible");return;}setLocating(true);setLocationError("");navigator.geolocation.getCurrentPosition(pos=>{setLocating(false);const map=mapRef.current;if(map){map.closePopup();map.setView([pos.coords.latitude,pos.coords.longitude],11,{animate:false});}},()=>{setLocating(false);setLocationError("No se pudo acceder a tu ubicación");},{enableHighAccuracy:false,timeout:9000});}
  async function toggleExpanded(){
    if(expanded){if(document.fullscreenElement===frameRef.current)await document.exitFullscreen();setExpanded(false);expandButtonRef.current?.focus();return;}
    setExpanded(true);
    try{await frameRef.current?.requestFullscreen?.();}catch{/* CSS expansion also works without native fullscreen. */}
  }
  return <div ref={frameRef} className={`v3-map-frame ${expanded?"v3-map-expanded":""}`} aria-busy={!mapReady && !mapError}>
    <div className="rural-pro-map-toolbar" aria-label="Herramientas del mapa"><button type="button" onClick={showAll} disabled={!mapReady} title="Ver todas las publicaciones"><Scan size={17}/> Ver todos</button><button type="button" onClick={locate} disabled={!mapReady||locating} title="Buscar cerca de mi ubicación"><LocateFixed size={17}/>{locating?"Ubicando…":"Cerca de mí"}</button><button type="button" aria-expanded={layerMenu} onClick={()=>setLayerMenu(v=>!v)}><Layers size={17}/> Capas</button>{layerMenu&&<div className="rural-pro-layer-menu" role="group" aria-label="Tipo de mapa"><button type="button" aria-pressed={basemap==="standard"} onClick={()=>{setBasemap("standard");setLayerMenu(false)}}>Mapa</button><button type="button" aria-pressed={basemap==="satellite"} onClick={()=>{setBasemap("satellite");setLayerMenu(false)}}>Satélite</button></div>}</div>
    {locationError&&<div className="rural-pro-location-error" role="status">{locationError}<button type="button" onClick={()=>setLocationError("")} aria-label="Cerrar"><X size={14}/></button></div>}
    <div className="v3-map-tools">
      <button ref={expandButtonRef} type="button" onClick={toggleExpanded} aria-pressed={expanded} aria-label={expanded?t("Restaurar mapa","Restaurar mapa","Restore map"):t("Ampliar mapa","Ampliar mapa","Expand map")}>{expanded?<Minimize2 size={20}/>:<Maximize2 size={20}/>}</button>
      <div className="v3-map-zoom-tools">
        <button type="button" data-map-zoom disabled={!mapReady} onClick={()=>changeZoom(1)} aria-label={t("Acercar mapa","Aproximar mapa","Zoom in")}><Plus size={24}/></button>
        <button type="button" data-map-zoom disabled={!mapReady} onClick={()=>changeZoom(-1)} aria-label={t("Alejar mapa","Afastar mapa","Zoom out")}><Minus size={24}/></button>
      </div>
    </div>
    <div className="v3-map-canvas" ref={containerRef} role="region" aria-label={country === "BR" ? "Mapa de terras e serviços" : country === "US" ? "Farmland and services map" : "Mapa de campos y servicios"} />
    {mapError && <p className="v3-map-error" role="status">{v3Text(country,"No pudimos cargar el mapa completo. Podés seguir consultando las fichas del listado.")}</p>}
  </div>;
}
