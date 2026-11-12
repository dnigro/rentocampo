"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { campoFilterParams } from "@/lib/campos/filter-params";
import V3CardPhotos from "./V3CardPhotos";
import { Heart, Map as MapIcon, MapPin, SlidersHorizontal, Search, List, ArrowUpRight } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, type CountryCode } from "@/data/countries";
import { addMapBounds, isWithinBounds, type MapBounds } from "@/lib/campos/map-search";
import V3Map from "./V3Map";

export type V3Campo = {
  id: string; titulo: string; localidad: string | null; provincia: string | null;
  hectareas: number | null; aptitud: string | null; operacion: string | null;
  precio: number | null; moneda: string | null; foto: string | null; fotos?: string[];
  lat: number | null; lng: number | null;
};

type Props = { campos: V3Campo[]; country: CountryCode; filter: {
  provincia?: string; operacion?: string; aptitud?: string; hectareas_min?: string; hectareas_max?: string; precio_min?: string; precio_max?: string; moneda?: string;
}; error?: boolean; initialBounds?: MapBounds | null; truncated?: boolean };

const aptitudeLabels: Record<string, string> = {
  agricola: "Agrícola", ganadera: "Ganadero", mixta: "Mixto", forestal: "Forestal"
};

function priceText(campo: V3Campo) {
  if (campo.precio == null || !Number.isFinite(campo.precio)) return "Precio a consultar";
  return [campo.moneda, campo.precio.toLocaleString("es-AR")].filter(Boolean).join(" ");
}

export default function V3Explorer({ campos, country, filter, error, initialBounds = null, truncated }: Props) {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(initialBounds);
  const [mapReset, setMapReset] = useState(0);
  const [pendingBounds, setPendingBounds] = useState<MapBounds | null>(null);
  const [searchOnMove, setSearchOnMove] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mobileMap, setMobileMap] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const stored = sessionStorage.getItem("rentocampo_v3_uat_favs");
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (Array.isArray(parsed)) setFavs(parsed.filter((x): x is string => typeof x === "string"));
        }
      } catch { /* Storage disabled, session-only state still works. */ }
      setLoaded(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { sessionStorage.setItem("rentocampo_v3_uat_favs", JSON.stringify(favs)); } catch { /* Optional storage */ }
  }, [favs, loaded]);

  const toggleFav = (id: string) => {
    setFavs(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  };

  const resetMapSearch = () => {
    setMapBounds(null);
    setPendingBounds(null);
    setSelected(null);
    setMapReset(value => value + 1);
  };
  const visibleCampos = useMemo(() => mapBounds ? campos.filter(campo => isWithinBounds(campo, mapBounds)) : campos, [campos, mapBounds]);
  const withoutCoordinates = campos.filter(campo => campo.lat == null || campo.lng == null).length;
  const handleViewportChange = useCallback((bounds: MapBounds) => {
    setSelected(null);
    setPendingBounds(bounds);
    if (searchOnMove) setMapBounds(bounds);
  }, [searchOnMove]);
  const listingSearch = addMapBounds(new URLSearchParams({ ...Object.fromEntries(campoFilterParams({ ...filter, pais: country })), ...(filter.moneda ? { moneda: filter.moneda } : {}) }), mapBounds).toString();
  const detailHref = (id: string) => `/v3/campos/${id}?${listingSearch}`;
  const selectedCampo = campos.find(campo => campo.id === selected);
  const handleSelect = useCallback((id: string) => {
    setSelected(id);
    if (window.matchMedia("(max-width: 700px)").matches) return;
    window.setTimeout(() => {
      document.getElementById("v3-listing-" + id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }, []);

  return <div className="v3-marketplace">
    <div className={`v3-filter-section ${filtersOpen ? "v3-filters-open" : ""}`}>
    <button type="button" className="v3-mobile-filter-toggle" aria-expanded={filtersOpen} aria-controls="v3-catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> Filtros · {COUNTRIES[country].name}</button>
    <Form id="v3-catalog-filters" className="v3-marketplace-filters" action="/v3/campos" aria-label="Filtrar campos">
      <label><span>País</span><select name="pais" defaultValue={country}>{COUNTRY_CODES_ALPHABETICAL.map(code => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}</select></label>
      <label><span>Operación</span><select name="operacion" defaultValue={filter.operacion || ""}>
        <option value="">Todas</option><option value="alquiler">Alquiler</option><option value="venta">Venta</option><option value="ambas">Alquiler y venta</option>
      </select></label>
      <label><span>Provincia</span><input name="provincia" placeholder="Cualquier provincia" defaultValue={filter.provincia || ""}/></label>
      <label><span>Aptitud</span><select name="aptitud" defaultValue={filter.aptitud || ""}>
        <option value="">Todas</option><option value="agricola">Agrícola</option><option value="ganadera">Ganadera</option><option value="mixta">Mixta</option><option value="forestal">Forestal</option>
      </select></label>
      <label><span>Superficie mínima</span><input type="number" min="0" name="hectareas_min" placeholder="Hectáreas" defaultValue={filter.hectareas_min || ""}/></label>
      <details className="v3-more-filters"><summary>Más filtros</summary>
        <div className="v3-extra-filter-fields">
          <label><span>Superficie máxima (ha)</span><input type="number" min="0" name="hectareas_max" defaultValue={filter.hectareas_max || ""} placeholder="Sin máximo"/></label>
          <label><span>Moneda del precio</span><select name="moneda" defaultValue={filter.moneda || ""}><option value="">Cualquier moneda</option>{Array.from(new Set([COUNTRIES[country].currency, "USD"])).map(currency => <option key={currency} value={currency}>{currency}</option>)}</select></label>
          <label><span>Precio mínimo</span><input type="number" min="0" name="precio_min" defaultValue={filter.precio_min || ""} placeholder="Sin mínimo"/></label>
          <label><span>Precio máximo</span><input type="number" min="0" name="precio_max" defaultValue={filter.precio_max || ""} placeholder="Sin máximo"/></label>
          <p>Para filtrar por precio, elegí una moneda. Los importes no se convierten ni se mezclan.</p>
          <button type="submit" className="v3-filter-submit">Aplicar filtros</button>
        </div>
      </details>
      <button type="submit" className="v3-filter-submit"><Search size={19}/> Buscar</button>
    </Form>
    </div>
    <div className="v3-marketplace-toolbar" aria-live="polite">
      <p><strong>{visibleCampos.length}</strong> {visibleCampos.length === 1 ? "campo encontrado" : "campos encontrados"} · {country}{mapBounds ? " · en esta zona del mapa" : ""}</p>
      <div className="v3-marketplace-actions">
        {mapBounds && <button type="button" className="v3-quiet-action" onClick={resetMapSearch}>Ver todo el país</button>}
        <Link href={`/v3/campos?pais=${country}`} className="v3-quiet-action"><SlidersHorizontal size={17}/> Limpiar filtros</Link>
        <button type="button" className="v3-quiet-action v3-desktop-toggle" aria-pressed={showMap} onClick={() => setShowMap(!showMap)}>
          {showMap ? <List size={18}/> : <MapIcon size={18}/>} {showMap ? "Ocultar mapa" : "Mostrar mapa"}
        </button>
      </div>
    </div>
    <div className={`v3-marketplace-content ${showMap ? "v3-with-map" : ""} ${mobileMap ? "v3-mobile-show-map" : ""}`}>
      <div className="v3-marketplace-list">
        {error && <div role="alert" className="v3-marketplace-empty">No se pudieron cargar las publicaciones. Probá nuevamente.</div>}
        {!error && visibleCampos.length === 0 && <div className="v3-marketplace-empty">
          <h2>No encontramos campos con estos filtros</h2><p>Probá ampliando la búsqueda o cambiando la provincia.</p>
          {mapBounds ? <button type="button" className="v3-filter-submit" onClick={resetMapSearch}>Ampliar a todo el país</button> : <Link href={`/v3/campos?pais=${country}`}>Ver todos los campos</Link>}
        </div>}
        {mapBounds && withoutCoordinates > 0 && <p className="v3-map-location-note">{withoutCoordinates} {withoutCoordinates === 1 ? "publicación sin coordenadas verificadas no aparece" : "publicaciones sin coordenadas verificadas no aparecen"} en la búsqueda por mapa. <button type="button" onClick={resetMapSearch}>Ver todas</button></p>}
        {truncated && <p className="v3-map-location-note">Mostramos las primeras {campos.length} publicaciones. Ajustá los filtros para acotar la búsqueda.</p>}
        <div className="v3-marketplace-grid">
          {visibleCampos.map(campo => <article key={campo.id} id={`v3-listing-${campo.id}`}
              className={`v3-listing-card ${selected === campo.id ? "v3-selected-card" : ""}`}
              onMouseEnter={() => setSelected(campo.id)} onFocus={() => setSelected(campo.id)}>
            <div className="v3-listing-media">
              <V3CardPhotos photos={campo.fotos || (campo.foto ? [campo.foto] : [])} title={campo.titulo} href={detailHref(campo.id)}/>
              <span className="v3-listing-badge">{aptitudeLabels[campo.aptitud || ""] || campo.aptitud || "Campo rural"}</span>
              <button type="button" className={`v3-heart-button ${loaded && favs.includes(campo.id) ? "saved" : ""}`}
                aria-label={favs.includes(campo.id) ? "Quitar de favoritos de UAT" : "Agregar a favoritos de UAT"}
                aria-pressed={loaded && favs.includes(campo.id)} onClick={() => toggleFav(campo.id)}>
                <Heart size={19} fill={loaded && favs.includes(campo.id) ? "currentColor" : "none"}/>
              </button>
            </div>
            <Link href={detailHref(campo.id)} className="v3-listing-info">
              <strong>{campo.titulo}</strong>
              <span><MapPin size={14}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || country}</span>
              <span>{campo.hectareas != null ? campo.hectareas.toLocaleString("es-AR") + " ha · " : ""}
                {campo.operacion === "ambas" ? "Alquiler y venta" : campo.operacion || "Campo"}</span>
              <b>{priceText(campo)}</b>
              <span className="v3-listing-details">Ver publicación <ArrowUpRight size={14}/></span>
            </Link>
          </article>)}
        </div>
      </div>
      {showMap && <div className="v3-marketplace-map-panel">
        <div className="v3-map-caption"><MapPin size={16}/> Explorá los campos en el mapa</div>
        <div className="v3-map-search-controls">
          <label><input type="checkbox" checked={searchOnMove} onChange={event => {
            setSearchOnMove(event.target.checked);
            if (event.target.checked && pendingBounds) setMapBounds(pendingBounds);
          }}/> Buscar al mover el mapa</label>
          {!searchOnMove && pendingBounds && <button type="button" onClick={() => setMapBounds(pendingBounds)}><Search size={15}/> Buscar en esta zona</button>}
        </div>
        <V3Map key={mapReset} initialBounds={mapReset ? null : initialBounds} campos={campos} country={country} selectedId={selected} onSelect={handleSelect} onViewportChange={handleViewportChange}/>
        {selectedCampo && <div className="v3-map-selection" role="status">
          <strong>{selectedCampo.titulo}</strong>
          <span>{[selectedCampo.localidad, selectedCampo.provincia].filter(Boolean).join(", ")}</span>
          <Link href={detailHref(selectedCampo.id)}>Ver publicación <ArrowUpRight size={14}/></Link>
        </div>}
      </div>}
    </div>
    {showMap && <button type="button" className="v3-mobile-map-button" aria-pressed={mobileMap} onClick={() => setMobileMap(!mobileMap)}>
      {mobileMap ? <List size={18}/> : <MapIcon size={18}/>} {mobileMap ? "Ver lista" : "Ver mapa"}
    </button>}
  </div>;
}
