"use client";

import { demoServiceRegisterHref } from "@/data/visible-demo-services";
import { regionalPublicationHref, regionalPublicationLabel } from "@/lib/publicacion-regional";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import Link from "next/link";
import Image from "next/image";
import { ZONAS_PRODUCTIVAS_LATAM, type DemandaZona } from "@/data/demanda-zonas";
import {
  CENTROS_PROVINCIA,
  servicioLabel,
} from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, displayCountryName, type CountryCode } from "@/data/countries";
import { selectRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import { createClient } from "@/lib/supabase/client";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";

interface CampoPin {
  id: string;
  titulo: string;
  country_code?: CountryCode;
  provincia: string;
  localidad?: string;
  latitud: number | string;
  longitud: number | string;
  hectareas: number;
  aptitud: string;
  operacion?: "alquiler" | "venta" | "ambas";
  precio?: number;
  moneda?: string;
  fotos?: Array<{ id?: string; url: string; orden?: number | null; storage_path?: string | null }>;
}

interface Props {
  campos: CampoPin[];
  prestadores: ServicioPin[];
  currentUserId?: string;
  initialVista?: "tierra" | "servicios";
  initialServicio?: ServicioRural;
  initialCountry?: CountryCode;
  camposListHref: string;
  serviciosListHref: string;
}

interface ServicioPin {
  id: string;
  publicacion_id?: string;
  titulo: string;
  country_code?: CountryCode;
  bio?: string;
  avatar_url?: string;
  service_photo_url?: string;
  servicios_rurales: ServicioRural[];
  zona_servicio?: string;
  provincia_servicio: string;
  localidad_servicio?: string;
  latitud?: number;
  longitud?: number;
  is_demo?: boolean;
}

export default function CampoMapa({
  campos,
  prestadores,
  currentUserId,
  initialVista = "tierra",
  initialCountry = "AR",
  camposListHref,
  serviciosListHref,
}: Props) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const camposLayer = useRef<LayerGroup | null>(null);
  const demandaLayer = useRef<LayerGroup | null>(null);
  const serviciosLayer = useRef<LayerGroup | null>(null);
  const [selectedCampo, setSelectedCampo] = useState<CampoPin | null>(null);
  const [selectedDemanda, setSelectedDemanda] = useState<DemandaZona | null>(
    null,
  );
  const [selectedServicio, setSelectedServicio] = useState<ServicioPin | null>(
    null,
  );
  const [vista, setVista] = useState<"tierra" | "servicios">(initialVista);
  const countryCode = initialCountry;
  const tt = useCallback((es: string, pt: string) => regionalText(countryCode, es, pt), [countryCode]);
  const [mostrarCampos, setMostrarCampos] = useState(true);
  const [mobileMap, setMobileMap] = useState(false);
  const [resultsPage, setResultsPage] = useState(1);
  const resultsPageSize = 10;
  useEffect(() => { if (mobileMap) { const id = window.setTimeout(() => map.current?.invalidateSize(), 80); return () => window.clearTimeout(id); } }, [mobileMap]);
  const [mapError, setMapError] = useState(false);
  const [viewport, setViewport] = useState<{zoom:number;north:number;south:number;east:number;west:number}|null>(null);
  const [supabase] = useState(createClient);
  const [fetchedUserId, setFetchedUserId] = useState<
    string | null | undefined
  >();
  const resolvedUserId = currentUserId ?? fetchedUserId;

  useEffect(() => {
    if (currentUserId !== undefined) return;

    let cancelled = false;
    void supabase.auth.getUser().then(({ data }) => {
      if (!cancelled) setFetchedUserId(data.user?.id ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, [currentUserId, supabase]);

  function cambiarVista(nuevaVista: "tierra" | "servicios") {
    setVista(nuevaVista);
    setResultsPage(1);
    setSelectedCampo(null);
    setSelectedDemanda(null);
    setSelectedServicio(null);
  }

  function cambiarPais(nuevoPais: CountryCode) {
    const pais = COUNTRIES[nuevoPais];
    // El país elegido define SIEMPRE el centro y el zoom, en ambas capas.
    // Centrar inmediatamente para que la interacción tenga respuesta visual.
    map.current?.setView([...pais.mapCenter] as [number, number], pais.mapZoom, { animate: false });
    if (nuevoPais === countryCode) return;

    setSelectedCampo(null);
    setSelectedDemanda(null);
    setSelectedServicio(null);

    // Igual que el selector del encabezado: navegar de forma completa.
    // Un router.refresh() después de history.replaceState puede reutilizar
    // los datos del país anterior. Reload fuerza las nuevas consultas
    // servidoras para campos, servicios y DEMOs, también en App Lite.
    selectRegionalCountry(nuevoPais);
    const destino = new URL(window.location.href);
    destino.searchParams.set("vista", vista);
    window.history.replaceState(
      window.history.state,
      "",
      `${destino.pathname}${destino.search}${destino.hash}`,
    );
    window.location.reload();
  }

  const prestadoresFiltrados = useMemo(
    () =>
      prestadores.filter(
        (prestador) =>
          (prestador.country_code ?? "AR") === countryCode,
      ),
    [countryCode, prestadores],
  );

  const camposConCoordenadas = useMemo(
    () =>
      campos.filter((campo) => (campo.country_code ?? "AR") === countryCode),
    [campos, countryCode],
  );

  useEffect(() => {
    let cancelled = false;

    void import("leaflet")
      .then((L) => {
        if (cancelled || map.current || !mapContainer.current) return;

        const country = COUNTRIES[countryCode];
        const leafletMap = L.map(mapContainer.current).setView(
          [...country.mapCenter] as [number, number],
          country.mapZoom,
        );
        map.current = leafletMap;
        const updateViewport = () => { const b = leafletMap.getBounds(); setViewport({zoom:leafletMap.getZoom(),north:b.getNorth(),south:b.getSouth(),east:b.getEast(),west:b.getWest()}); };
        leafletMap.on("moveend zoomend",updateViewport);
        leafletMap.whenReady(updateViewport);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMap);
        L.control.zoom({ position: "topright" }).addTo(leafletMap);

        const demandaGroup = L.layerGroup().addTo(leafletMap);
        const camposGroup = L.layerGroup().addTo(leafletMap);
        const serviciosGroup = L.layerGroup();
        camposLayer.current = camposGroup;
        demandaLayer.current = demandaGroup;
        serviciosLayer.current = serviciosGroup;


        ZONAS_PRODUCTIVAS_LATAM.filter((z) => z.country_code === countryCode).forEach((demanda) => {
          const position: [number, number] = [
            demanda.latitud,
            demanda.longitud,
          ];
          L.circleMarker(position, {
            radius: 9,
            color: "#6d561f",
            weight: 2,
            dashArray: "3 3",
            fillColor: "#f4c542",
            fillOpacity: 0.95,
          })
            .addTo(demandaGroup)
            .bindTooltip(`${tt("Zona productiva (no es un campo):", "Região produtiva (não é uma terra):")} ${demanda.zona}`)
            .on("click", () => {
              setSelectedCampo(null);
              setSelectedDemanda(demanda);
            });
        });

        camposConCoordenadas.forEach((campo, index) => {
          const lat = normalizarCoordenada(campo.latitud);
          const lng = normalizarCoordenada(campo.longitud);
          const centroProvincia = CENTROS_PROVINCIA[campo.provincia];
          const offset = ((index % 5) - 2) * 0.045;
          const position: [number, number] | null =
            lat !== null &&
            lng !== null &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180
              ? [lat, lng]
              : centroProvincia
                ? [centroProvincia[0] + offset, centroProvincia[1] - offset]
                : null;
          if (!position) return;
          const esDemo = campo.id.startsWith("20000000-") || campo.titulo.toUpperCase().includes("DEMO");
          L.circleMarker(position, {
            radius: 9,
            color: "#ffffff",
            weight: 2,
            fillColor: "#2d6a2d",
            fillOpacity: 1,
          })
            .addTo(camposGroup)
            .bindTooltip(esDemo ? tt("Campo de demostración", "Terra de demonstração") : tt("Campo disponible", "Terra disponível"))
            .on("click", () => {
              setSelectedDemanda(null);
              setSelectedCampo(campo);
            });
        });

        prestadoresFiltrados.forEach((prestador, index) => {
          const tieneCoordenadas =
            Number.isFinite(prestador.latitud) && Number.isFinite(prestador.longitud);
          const centro = CENTROS_PROVINCIA[prestador.provincia_servicio];
          if (!tieneCoordenadas && !centro) return;
          const offset = ((index % 5) - 2) * 0.16;
          const position: [number, number] = tieneCoordenadas
            ? [prestador.latitud as number, prestador.longitud as number]
            : [centro![0] + offset, centro![1] - offset];
          L.circleMarker(position, {
            radius: 10,
            color: "#7a3158",
            weight: 2,
            fillColor: "#e58ac0",
            fillOpacity: 1,
          })
            .addTo(serviciosGroup)
            .bindTooltip(
              `${prestador.titulo} · ${tt("Servicios rurales", "Serviços rurais")}${prestador.is_demo ? " · DEMO" : ""}`,
            )
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

        // Regla UX: nunca ajustar el viewport a los marcadores.
        // Algunos marcadores están concentrados en una sola región;
        // fitBounds los centraría allí en vez de mostrar el país seleccionado.
        leafletMap.setView([...country.mapCenter] as [number, number], country.mapZoom, {
          animate: false,
        });

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
  }, [camposConCoordenadas, countryCode, prestadoresFiltrados, vista, tt]);

  useEffect(() => {
    const leafletMap = map.current;
    if (!leafletMap) return;
    const tierraVisible = vista === "tierra";
    [demandaLayer.current, camposLayer.current].forEach((layer) => {
      if (!layer) return;
      if (tierraVisible && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
      if (!tierraVisible && leafletMap.hasLayer(layer))
        leafletMap.removeLayer(layer);
    });
    const serviceLayer = serviciosLayer.current;
    if (serviceLayer) {
      if (!tierraVisible && !leafletMap.hasLayer(serviceLayer))
        serviceLayer.addTo(leafletMap);
      if (tierraVisible && leafletMap.hasLayer(serviceLayer))
        leafletMap.removeLayer(serviceLayer);
    }
  }, [vista, prestadoresFiltrados]);

  useEffect(() => {
    const leafletMap = map.current;
    const layer = camposLayer.current;
    if (!leafletMap || !layer) return;

    if (mostrarCampos && !leafletMap.hasLayer(layer)) layer.addTo(leafletMap);
    if (!mostrarCampos && leafletMap.hasLayer(layer))
      leafletMap.removeLayer(layer);
  }, [mostrarCampos]);

  const visibleCards = useMemo(() => {
    if (!viewport || viewport.zoom < 9) return [];
    const inside = (lat:number,lng:number) => lat >= viewport.south && lat <= viewport.north && lng >= viewport.west && lng <= viewport.east;
    if (vista === "tierra") return mostrarCampos ? camposConCoordenadas.filter((c,i) => {
      const lat = normalizarCoordenada(c.latitud), lng = normalizarCoordenada(c.longitud);
      const center = CENTROS_PROVINCIA[c.provincia], offset = ((i % 5) - 2) * 0.045;
      return lat !== null && lng !== null && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 ? inside(lat,lng) : Boolean(center && inside(center[0]+offset,center[1]-offset));
    }).slice(0,12).map(c => ({id:c.id,title:c.titulo,place:[c.localidad,c.provincia].filter(Boolean).join(", "),kind:"campo"})) : [];
    return prestadoresFiltrados.filter((p,i) => {
      const center = CENTROS_PROVINCIA[p.provincia_servicio], offset = ((i % 5) - 2) * 0.16;
      return Number.isFinite(p.latitud) && Number.isFinite(p.longitud) ? inside(p.latitud!,p.longitud!) : Boolean(center && inside(center[0]+offset,center[1]-offset));
    }).slice(0,12).map(p => ({id:p.id,title:p.titulo,place:[p.localidad_servicio,p.provincia_servicio].filter(Boolean).join(", "),kind:"servicio"}));
  },[viewport,vista,mostrarCampos,camposConCoordenadas,prestadoresFiltrados]);

  const APTITUD_LABEL: Record<string, string> = {
    agricola: "Agrícola",
    ganadera: "Ganadera",
    mixta: "Mixta",
    forestal: "Forestal",
    otro: "Otro",
  };

  return (
    <div className="mapa-wrapper" data-country={countryCode} data-map-center={COUNTRIES[countryCode].mapCenter.join(",")}>
      <aside className={`explorador-sidebar ${mobileMap ? "explorador-mobile-hidden" : ""}`} aria-label={tt("Publicaciones rurales", "Anúncios rurais")}>
        <div className="explorador-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:24,flexWrap:"wrap",padding:"28px 32px",background:"#fff"}}>
          <div style={{minWidth:260,flex:"1 1 360px"}}>
            <p style={{fontSize:13,letterSpacing:2,fontWeight:700,color:"#64748b",margin:"0 0 8px"}}>{vista==="tierra" ? tt("CAMPOS Y OPORTUNIDADES","TERRAS E OPORTUNIDADES") : tt("SERVICIOS PARA PRODUCIR","SERVIÇOS PARA PRODUZIR")}</p>
            <h1 style={{fontSize:"clamp(30px,3vw,48px)",lineHeight:1.1,margin:"0 0 10px",color:"#102b43"}}>{vista==="tierra" ? tt("Campos disponibles","Terras disponíveis") : tt("Servicios rurales","Serviços rurais")}</h1>
            <p className="rc-map-header-description">{vista==="tierra" ? tt("Explorá campos para venta o alquiler en Argentina. Contactá directamente a sus propietarios.","Explore terras para venda ou arrendamento na Argentina. Entre em contato diretamente com os proprietários.") : tt("Encontrá profesionales y servicios rurales en Argentina. Contactalos directamente.","Encontre profissionais e serviços rurais na Argentina. Entre em contato diretamente.")}</p>
            <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginTop:24}}>
              <Link href={vista==="tierra"?camposListHref:serviciosListHref} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minHeight:56,padding:"0 26px",borderRadius:999,background:"#102b43",color:"#fff",fontSize:16,fontWeight:700,textDecoration:"none"}}>▤ {tt("Ver en lista","Ver na lista")}</Link>
              <label htmlFor="rc-map-country" style={{fontWeight:700,fontSize:15,color:"#102b43"}}>{tt("País","País")}</label>
              <select id="rc-map-country" value={countryCode} onChange={e=>selectRegionalCountry(e.target.value as CountryCode)} style={{minHeight:56,minWidth:220,border:"1px solid #bfd0de",borderRadius:999,padding:"0 18px",fontWeight:600,color:"#102b43",background:"#fff"}}>
                {COUNTRY_CODES_ALPHABETICAL.map(code=><option key={code} value={code}>{displayCountryName(code,code)}</option>)}
              </select>
            </div>

            <p style={{fontSize:17,margin:0,color:"#526477"}}>{vista === "tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length} {vista === "tierra" ? tt("campos publicados","terras anunciadas") : tt("servicios rurales","serviços rurais")} · {displayCountryName(countryCode,countryCode)}</p>
          </div>
          <nav className="rc-map-header-actions" aria-label={tt("Navegación del mapa","Navegação do mapa")}>
            <button type="button" className="rc-map-action-secondary" onClick={()=>cambiarVista(vista==="tierra"?"servicios":"tierra")}>
              ☰  {vista==="tierra" ? tt("Explorar servicios rurales","Explorar serviços rurais") : tt("Explorar campos","Explorar terras")}
            </button>
            <button type="button" className="rc-map-action-primary" onClick={()=>document.querySelector(".explorador-results")?.scrollTo({top:0,behavior:"smooth"})}>
              {vista==="tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length} {vista==="tierra" ? tt("campos encontrados","terras encontradas") : tt("prestadores encontrados","prestadores encontrados")} ↓
            </button>
          </nav>
        </div>
        <div className="explorador-results">
          {vista==="tierra" ? camposConCoordenadas.slice((resultsPage-1)*resultsPageSize,resultsPage*resultsPageSize).map(campo=>{
            const foto=[...(campo.fotos??[])].sort((a,b)=>(a.orden??0)-(b.orden??0))[0]?.url;
            return <button type="button" key={campo.id} className={`explorador-card ${selectedCampo?.id===campo.id?"selected":""}`} onClick={()=>{setSelectedCampo(campo);setSelectedServicio(null);setSelectedDemanda(null);const lat=normalizarCoordenada(campo.latitud),lng=normalizarCoordenada(campo.longitud);if(lat!==null&&lng!==null)map.current?.flyTo([lat,lng],Math.max(map.current.getZoom(),10));setMobileMap(true);}}>
              <span className="explorador-thumb">{foto ? <Image src={foto} alt={campo.titulo} width={320} height={220} /> : <span>{tt("Sin fotografía","Sem foto")}</span>}</span>
              <span className="explorador-info"><strong>{campo.titulo}</strong><small>{[campo.localidad,campo.provincia].filter(Boolean).join(", ")}</small><small>{campo.hectareas?.toLocaleString(COUNTRIES[countryCode].locale)} ha · {campo.operacion==="venta"?tt("Venta","Venda"):campo.operacion==="ambas"?tt("Alquiler o venta","Arrendamento ou venda"):tt("Alquiler","Arrendamento")}</small><span className="explorador-ver">{tt("Ver en el mapa","Ver no mapa")} ↗</span></span>
            </button>;
          }) : prestadoresFiltrados.slice((resultsPage-1)*resultsPageSize,resultsPage*resultsPageSize).map(servicio=><button type="button" key={servicio.publicacion_id??servicio.id} className={`explorador-card ${selectedServicio?.id===servicio.id?"selected":""}`} onClick={()=>{setSelectedServicio(servicio);setSelectedCampo(null);setSelectedDemanda(null);if(Number.isFinite(servicio.latitud)&&Number.isFinite(servicio.longitud))map.current?.flyTo([servicio.latitud!,servicio.longitud!],Math.max(map.current.getZoom(),10));setMobileMap(true);}}>
            <span className="explorador-thumb">{servicio.service_photo_url ? <Image src={servicio.service_photo_url} alt={servicio.titulo} width={320} height={220}/> : <span>{tt("Sin fotografía","Sem foto")}</span>}</span>
            <span className="explorador-info"><strong>{servicio.titulo}</strong><small>{[servicio.localidad_servicio,servicio.provincia_servicio].filter(Boolean).join(", ")}</small><small>{servicio.zona_servicio||tt("Servicio rural","Serviço rural")}</small><span className="explorador-ver">{tt("Ver en el mapa","Ver no mapa")} ↗</span></span>
          </button>)}
        </div>
        {Math.ceil((vista==="tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length)/resultsPageSize)>1 && (
          <div className="explorador-pagination">
            <button type="button" disabled={resultsPage===1} onClick={()=>setResultsPage(p=>Math.max(1,p-1))}>← {tt("Anterior","Anterior")}</button>
            <span>{tt("Página","Página")} {resultsPage} / {Math.ceil((vista==="tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length)/resultsPageSize)}</span>
            <button type="button" disabled={resultsPage>=Math.ceil((vista==="tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length)/resultsPageSize)} onClick={()=>setResultsPage(p=>p+1)}>{tt("Siguiente","Próxima")} →</button>
          </div>
        )}
      </aside>
      <button type="button" className="explorador-mobile-toggle" onClick={()=>setMobileMap(v=>!v)}>{mobileMap?tt("Ver publicaciones","Ver anúncios"):tt("Ver mapa","Ver mapa")}</button>
      <div className={`explorador-map-area ${mobileMap?"explorador-map-visible":""}`}>
      <div
        ref={mapContainer}
        className={`mapa-canvas ${mapError ? "mapa-canvas-oculto" : ""}`}
      />

      {mapError && (
        <div className="mapa-fallback">
          <iframe
            className="mapa-fallback-frame"
            title={`Mapa cartográfico de ${COUNTRIES[countryCode].name}`}
            src={
              countryCode === "UY"
                ? "https://www.openstreetmap.org/export/embed.html?bbox=-58.7%2C-35.2%2C-53.0%2C-30.0&layer=mapnik"
                : countryCode === "PY"
                  ? "https://www.openstreetmap.org/export/embed.html?bbox=-62.7%2C-27.8%2C-54.2%2C-19.2&layer=mapnik"
                  : countryCode === "BR"
                  ? "https://www.openstreetmap.org/export/embed.html?bbox=-74.1%2C-34.0%2C-34.7%2C5.3&layer=mapnik"
                  : (() => { const [lat, lon] = COUNTRIES[countryCode].mapCenter; const dLat = countryCode === "AR" ? 16 : 4; const dLon = countryCode === "AR" ? 10 : 5; return "https://www.openstreetmap.org/export/embed.html?bbox=" + encodeURIComponent([lon-dLon,lat-dLat,lon+dLon,lat+dLat].join(",")) + "&layer=mapnik"; })()
            }
            loading="lazy"
          />
          <div className="mapa-fallback-aviso">
            <strong>{tt("Mapa de oportunidades rurales","Mapa de oportunidades rurais")}</strong>
            <span>{tt("No se pudo cargar el mapa interactivo.","Não foi possível carregar o mapa interativo.")}</span>
            <Link href="/campos">{tt("Ver campos disponibles →","Ver terras disponíveis →")}</Link>
          </div>
        </div>
      )}

      {!mapError && (
        <div className="mapa-filtros mapa-filtros-compactos explorador-old-controls" aria-label={tt("Controles del mapa", "Controles do mapa")}>
          <div className="mapa-modos" role="group" aria-label={tt("Qué querés encontrar", "O que você procura")}>
            <button type="button" className={vista === "tierra" ? "activo" : ""} aria-pressed={vista === "tierra"} onClick={() => cambiarVista("tierra")}>
              {tt("Tierra productiva", "Terra produtiva")}
            </button>
            <button type="button" className={vista === "servicios" ? "activo activo-servicios" : ""} aria-pressed={vista === "servicios"} onClick={() => cambiarVista("servicios")}>
              {tt("Servicios rurales", "Serviços rurais")}
            </button>
          </div>
          <div className="mapa-compacto-resumen">
            <span className="mapa-compacto-cantidad" aria-live="polite">
              <span className="mapa-filtro-punto mapa-filtro-punto-campo" aria-hidden="true" />
              <strong>{vista === "tierra" ? camposConCoordenadas.length : prestadoresFiltrados.length}</strong>{" "}
              {vista === "tierra" ? tt("campos disponibles", "terras disponíveis") : tt("servicios disponibles", "serviços disponíveis")}
              <span className="mapa-compacto-pais"> · {displayCountryName(countryCode, countryCode)}</span>
            </span>
            {vista === "tierra" && (
              <button type="button" className="mapa-compacto-filtro" aria-pressed={!mostrarCampos} onClick={() => { setMostrarCampos((actual) => !actual); setSelectedCampo(null); }}>
                {mostrarCampos ? tt("Ocultar", "Ocultar") : tt("Mostrar", "Mostrar")}
              </button>
            )}
          </div>
          <div className={visibleCards.length ? "mapa-compacto-publicar mapa-publicar-con-fichas" : "mapa-compacto-publicar"}>
            <Link href={regionalPublicationHref({ country: countryCode, kind: vista === "tierra" ? "campo" : "servicio", authenticated: Boolean(resolvedUserId) })}>
              + {vista === "tierra" ? tt("Publicar un campo", "Anunciar terra") : tt("Publicar mis servicios", "Anunciar meus serviços")}
            </Link>
          </div>
        </div>
      )}

      {!mapError && false && visibleCards.length > 0 && !selectedCampo && !selectedServicio && !selectedDemanda && (
        <div className="mapa-fichas-carrusel" aria-label={tt("Publicaciones en esta zona","Anúncios nesta região")}>
          {visibleCards.map(card => (
            <button key={card.kind+card.id} type="button" className="mapa-ficha-mini" onClick={() => {
              setSelectedDemanda(null);
              if (card.kind === "campo") { setSelectedCampo(camposConCoordenadas.find(c => c.id === card.id) ?? null); setSelectedServicio(null); }
              else { setSelectedServicio(prestadoresFiltrados.find(p => p.id === card.id) ?? null); setSelectedCampo(null); }
            }}>
              <span>{card.kind === "campo" ? tt("Campo","Terra") : tt("Servicio rural","Serviço rural")}</span>
              <strong>{card.title}</strong>
              <small>{card.place}</small>
            </button>
          ))}
        </div>
      )}
      {selectedCampo && (
        <div className="mapa-panel mapa-panel-campo">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedCampo(null)}
            aria-label={tt("Cerrar detalle del campo","Fechar detalhes da terra")}
          >
            ×
          </button>
          {(selectedCampo.fotos?.[0]?.url || selectedCampo.id.startsWith("20000000-")) && (
            <div className="mapa-campo-foto">
              <Image
                src={selectedCampo.fotos?.length ? [...selectedCampo.fotos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0].url : "/rentocampo-hero-campo-bn-1920x1080.webp"}
                alt={selectedCampo.titulo}
                width={640}
                height={360}
              />
            </div>
          )}
          <div className="mapa-campo-tags">
            <span className="mapa-panel-aptitud">
              {(selectedCampo.id.startsWith("20000000-") || selectedCampo.titulo.toUpperCase().includes("DEMO")) ? tt("PUBLICACIÓN DEMO · ","ANÚNCIO DEMO · ") : ""}
              {countryCode==="BR"?({agricola:"Agrícola",ganadera:"Pecuária",mixta:"Mista",forestal:"Florestal",otro:"Outro"} as Record<string,string>)[selectedCampo.aptitud]??selectedCampo.aptitud:countryCode==="US"?regionalText(countryCode,APTITUD_LABEL[selectedCampo.aptitud]??selectedCampo.aptitud,APTITUD_LABEL[selectedCampo.aptitud]??selectedCampo.aptitud):APTITUD_LABEL[selectedCampo.aptitud]??selectedCampo.aptitud}
            </span>
            {selectedCampo.operacion && (
              <span className="operacion-tag">
                {selectedCampo.operacion === "venta"
                  ? tt("Venta","Venda")
                  : selectedCampo.operacion === "ambas"
                    ? tt("Alquiler + Venta","Arrendamento + Venda")
                    : tt("Alquiler","Arrendamento")}
              </span>
            )}
          </div>
          <h3 className="mapa-panel-titulo">{selectedCampo.titulo}</h3>
          <p className="mapa-panel-ubicacion">
            {[selectedCampo.localidad, selectedCampo.provincia]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-panel-datos">
            <span>{selectedCampo.hectareas.toLocaleString(COUNTRIES[selectedCampo.country_code ?? "AR"].locale)} ha</span>
            {selectedCampo.precio && (
              <span>
                {selectedCampo.moneda}{" "}
                {selectedCampo.precio.toLocaleString(COUNTRIES[selectedCampo.country_code ?? "AR"].locale)} {tt("total","total")}
              </span>
            )}
          </div>
          <Link href={(selectedCampo.id.startsWith("20000000-") || /\bDEMO\b/i.test(selectedCampo.titulo)) ? regionalPublicationHref({ country: countryCode, kind: "campo", authenticated: Boolean(resolvedUserId), zona: selectedCampo.localidad || undefined }) : `/campos/${selectedCampo.id}`} className="mapa-panel-btn">
            {(selectedCampo.id.startsWith("20000000-") || /\bDEMO\b/i.test(selectedCampo.titulo)) ? regionalPublicationLabel({ country: countryCode, kind: "campo", authenticated: Boolean(resolvedUserId) }) + " →" : tt("Ver campo →","Ver terra →")}
          </Link>
        </div>
      )}

      {selectedDemanda && (
        <div className="mapa-panel mapa-panel-demanda">
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedDemanda(null)}
            aria-label={tt("Cerrar detalle de la zona productiva","Fechar detalhes da zona produtiva")}
          >
            ×
          </button>
          <p className="mapa-panel-aptitud mapa-panel-aptitud-demanda">
            {tt("Zona productiva · referencia (no es un campo)", "Região produtiva · referência (não é uma terra)")}
          </p>
          <h3 className="mapa-panel-titulo">
            {tt("Región productiva de referencia:","Região produtiva de referência:")} {selectedDemanda.zona}
          </h3>
          <p className="mapa-panel-ubicacion">{selectedDemanda.provincia}</p>
          <p className="mapa-panel-descripcion">
            {selectedDemanda.descripcion}
          </p>
          <p className="mapa-panel-aclaracion">
            {tt("Referencia editorial, no representa demanda verificada ni un campo publicado.","Referência editorial, não representa demanda verificada nem anúncio.")}
          </p>
          <Link
            href={regionalPublicationHref({ country: countryCode, kind: "campo", authenticated: Boolean(resolvedUserId), zona: selectedDemanda.zona })}
            className="mapa-panel-btn mapa-panel-btn-demanda"
          >
            {tt("Publicar campo en esta zona","Anunciar terra nesta região")}
          </Link>
        </div>
      )}

      {selectedServicio && (
        <div className="mapa-panel mapa-panel-servicio" data-demo={selectedServicio.is_demo ? "true" : "false"}>
          <button
            className="mapa-panel-close"
            onClick={() => setSelectedServicio(null)}
            aria-label={tt("Cerrar detalle del servicio","Fechar detalhes do serviço")}
          >
            ×
          </button>
          {selectedServicio.service_photo_url && (
            <div className="mapa-servicio-foto">
              <Image
                src={selectedServicio.service_photo_url}
                alt={`${selectedServicio.titulo} · servicio rural`}
                width={640}
                height={360}
              />
            </div>
          )}
          <p className="mapa-panel-aptitud mapa-panel-aptitud-servicio">
            {selectedServicio.is_demo ? tt("SERVICIO DEMO","SERVIÇO DEMO") : tt("Servicios rurales","Serviços rurais")}
          </p>
          <h3 className="mapa-panel-titulo">{selectedServicio.titulo}</h3>
          <p className="mapa-panel-ubicacion">
            {[
              selectedServicio.localidad_servicio,
              selectedServicio.provincia_servicio,
            ]
              .filter(Boolean)
              .join(", ")}
          </p>
          <div className="mapa-servicio-tags">
            {selectedServicio.servicios_rurales.map((servicio) => (
              <span key={servicio}>{servicioLabel(servicio,countryCode)}</span>
            ))}
          </div>
          {selectedServicio.zona_servicio && (
            <p className="mapa-panel-descripcion">
              <strong>{tt("Zona de cobertura:","Área de atendimento:")}</strong> {selectedServicio.zona_servicio}
            </p>
          )}
          <Link
            href={selectedServicio.is_demo
              ? demoServiceRegisterHref(countryCode, Boolean(resolvedUserId))
              : `/servicios-rurales/${selectedServicio.publicacion_id ?? selectedServicio.id}?from=mapa`}
            className="mapa-panel-btn mapa-panel-btn-servicio"
          >
            {selectedServicio.is_demo
              ? regionalPublicationLabel({ country: countryCode, kind: "servicio", authenticated: Boolean(resolvedUserId) }) + " →"
              : tt("Ver servicio →","Ver serviço →")}
          </Link>
        </div>
      )}

      </div>
    </div>
  );
}
