"use client";
import { demoFieldPhoto } from "@/lib/v3/demo-media";
import { demoListingHref } from "@/lib/v3/demo-listings";
import { v3Text } from "@/lib/i18n/v3-copy";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { campoFilterParams } from "@/lib/campos/filter-params";
import RuralIcon from "./RuralIcon";
import V3CardPhotos from "./V3CardPhotos";
import { Heart, Map as MapIcon, MapPin, SlidersHorizontal, Search, List, ArrowUpRight } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, displayCountryName, type CountryCode } from "@/data/countries";
import { addMapBounds, isWithinBounds, type MapBounds } from "@/lib/campos/map-search";
import V3Map from "./V3Map";

export type V3Campo = {
  id: string; titulo: string; localidad: string | null; provincia: string | null;
  hectareas: number | null; aptitud: string | null; operacion: string | null;
  precio: number | null; moneda: string | null; foto: string | null; fotos?: string[];
  lat: number | null; lng: number | null; kind?: "campo" | "servicio"; demo?: boolean;
};

type Props = { campos: V3Campo[]; country: CountryCode; filter: {
  provincia?: string; operacion?: string; aptitud?: string; hectareas_min?: string; hectareas_max?: string; precio_min?: string; precio_max?: string; moneda?: string;
}; error?: boolean; initialBounds?: MapBounds | null; truncated?: boolean };

const aptitudeLabels: Record<string, string> = {
  agricola: "Agrícola", ganadera: "Ganadero", mixta: "Mixto", forestal: "Forestal"
};

function priceText(campo: V3Campo, country: CountryCode) {
  if (campo.precio == null || !Number.isFinite(campo.precio)) return v3Text(country, "Precio a consultar");
  return [campo.moneda, campo.precio.toLocaleString(COUNTRIES[country].locale)].filter(Boolean).join(" ");
}

export default function V3Explorer({ campos, country, filter, error, initialBounds = null, truncated }: Props) {
  const t = (source: string) => v3Text(country, source);
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
  const detailHref = (id: string) => { const item=campos.find(campo=>campo.id===id); return item?.demo ? demoListingHref(country,"campo",item.localidad) : `/v3/campos/${id}?${listingSearch}`; };
  const selectedCampo = campos.find(campo => campo.id === selected);
  const handleSelect = useCallback((id: string) => {
    setSelected(id);

  }, []);

  return <div className="v3-marketplace">
    <div className={`v3-filter-section ${filtersOpen ? "v3-filters-open" : ""}`}>
    <button type="button" className="v3-mobile-filter-toggle" aria-expanded={filtersOpen} aria-controls="v3-catalog-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/> {t("Filtros")} · {displayCountryName(country, country)}</button>
    <Form id="v3-catalog-filters" className="v3-marketplace-filters" action="/v3/campos" aria-label={t("Filtrar campos")}>
      <label><span>{t("País")}</span><select name="pais" defaultValue={country}>{COUNTRY_CODES_ALPHABETICAL.map(code => <option key={code} value={code}>{displayCountryName(code, country)}</option>)}</select></label>
      <label><span>{t("Operación")}</span><select name="operacion" defaultValue={filter.operacion || ""}>
        <option value="">{t("Todas")}</option><option value="alquiler">{t("Alquiler")}</option><option value="venta">{t("Venta")}</option><option value="ambas">{t("Alquiler y venta")}</option>
      </select></label>
      <label><span>{t("Provincia")}</span><input name="provincia" placeholder={t("Cualquier provincia")} defaultValue={filter.provincia || ""}/></label>
      <label><span>{t("Aptitud")}</span><select name="aptitud" defaultValue={filter.aptitud || ""}>
        <option value="">{t("Todas")}</option><option value="agricola">{t("Agrícola")}</option><option value="ganadera">{t("Ganadera")}</option><option value="mixta">{t("Mixta")}</option><option value="forestal">{t("Forestal")}</option>
      </select></label>
      <label><span>{t("Superficie mínima")}</span><input type="number" min="0" name="hectareas_min" placeholder={t("Hectáreas")} defaultValue={filter.hectareas_min || ""}/></label>
      <details className="v3-more-filters"><summary>{t("Más filtros")}</summary>
        <div className="v3-extra-filter-fields">
          <label><span>{t("Superficie máxima (ha)")}</span><input type="number" min="0" name="hectareas_max" defaultValue={filter.hectareas_max || ""} placeholder={t("Sin máximo")}/></label>
          <label><span>{t("Moneda del precio")}</span><select name="moneda" defaultValue={filter.moneda || ""}><option value="">{t("Cualquier moneda")}</option>{Array.from(new Set([COUNTRIES[country].currency, "USD"])).map(currency => <option key={currency} value={currency}>{currency}</option>)}</select></label>
          <label><span>{t("Precio mínimo")}</span><input type="number" min="0" name="precio_min" defaultValue={filter.precio_min || ""} placeholder={t("Sin mínimo")}/></label>
          <label><span>{t("Precio máximo")}</span><input type="number" min="0" name="precio_max" defaultValue={filter.precio_max || ""} placeholder={t("Sin máximo")}/></label>
          <p>{t("Para filtrar por precio, elegí una moneda. Los importes no se convierten ni se mezclan.")}</p>
          <button type="submit" className="v3-filter-submit">{t("Aplicar filtros")}</button>
        </div>
      </details>
      <button type="submit" className="v3-filter-submit"><Search size={19}/>{t("Buscar")}</button>
    </Form>
    </div>
    <div className="v3-marketplace-toolbar" aria-live="polite">
      <p><strong>{visibleCampos.length}</strong> {visibleCampos.length === 1 ? t("campo encontrado") : t("campos encontrados")} · {country}{mapBounds ? t(" · en esta zona del mapa") : ""}</p>
      <div className="v3-marketplace-actions">
        {mapBounds && <button type="button" className="v3-quiet-action" onClick={resetMapSearch}>{t("Ver todo el país")}</button>}
        <Link href={`/v3/campos?pais=${country}`} className="v3-quiet-action"><SlidersHorizontal size={17}/>{t("Limpiar filtros")}</Link>
        <button type="button" className="v3-quiet-action v3-desktop-toggle" aria-pressed={showMap} onClick={() => setShowMap(!showMap)}>
          {showMap ? <List size={18}/> : <MapIcon size={18}/>} {showMap ? t("Ocultar mapa") : t("Mostrar mapa")}
        </button>
      </div>
    </div>
    <div className={`v3-marketplace-content ${showMap ? "v3-with-map" : ""} ${mobileMap ? "v3-mobile-show-map" : ""}`}>
      <div className="v3-marketplace-list">
        {error && <div role="alert" className="v3-marketplace-empty">{t("No se pudieron cargar las publicaciones. Probá nuevamente.")}</div>}
        {!error && visibleCampos.length === 0 && <div className="v3-marketplace-empty">
          <h2>{t("No encontramos campos con estos filtros")}</h2><p>{t("Probá ampliando la búsqueda o cambiando la provincia.")}</p>
          {mapBounds ? <button type="button" className="v3-filter-submit" onClick={resetMapSearch}>{t("Ampliar a todo el país")}</button> : <Link href={`/v3/campos?pais=${country}`}>{t("Ver todos los campos")}</Link>}
        </div>}
        {mapBounds && withoutCoordinates > 0 && <p className="v3-map-location-note">{withoutCoordinates} {withoutCoordinates === 1 ? t("publicación sin coordenadas verificadas no aparece") : t("publicaciones sin coordenadas verificadas no aparecen")} {t("en la búsqueda por mapa.")} <button type="button" onClick={resetMapSearch}>{t("Ver todas")}</button></p>}
        {truncated && <p className="v3-map-location-note">{t("Mostramos las primeras")} {campos.length} {t("publicaciones. Ajustá los filtros para acotar la búsqueda.")}</p>}
        <div className="v3-marketplace-grid">
          {visibleCampos.map(campo => <article data-demo={campo.demo || false} key={campo.id} id={`v3-listing-${campo.id}`}
              className={`v3-listing-card ${selected === campo.id ? "v3-selected-card" : ""}`}
              onMouseEnter={() => setSelected(campo.id)} onFocus={() => setSelected(campo.id)}>
            <div className="v3-listing-media">
              <V3CardPhotos fallbackPhoto={campo.demo ? demoFieldPhoto(campo.aptitud) : undefined} country={country} photos={campo.fotos || (campo.foto ? [campo.foto] : [])} title={campo.titulo} href={detailHref(campo.id)}/>
              <span className="v3-listing-badge">{campo.demo ? "DEMO · " : ""}{t(aptitudeLabels[campo.aptitud || ""] || campo.aptitud || "Campo rural")}</span>
              <button type="button" className={`v3-heart-button ${loaded && favs.includes(campo.id) ? "saved" : ""}`}
                aria-label={favs.includes(campo.id) ? t("Quitar de favoritos de UAT") : t("Agregar a favoritos de UAT")}
                aria-pressed={loaded && favs.includes(campo.id)} onClick={() => toggleFav(campo.id)}>
                <Heart size={19} fill={loaded && favs.includes(campo.id) ? "currentColor" : "none"}/>
              </button>
            </div>
            <Link href={detailHref(campo.id)} className="v3-listing-info">
              <strong>{campo.titulo}</strong>{campo.demo && <span className="rural-demo-note">{t("Ejemplo de referencia. No es una oferta real.")}</span>}
              <span><MapPin size={14}/>{[campo.localidad, campo.provincia].filter(Boolean).join(", ") || country}</span>
              <span><RuralIcon name={campo.aptitud || "campo"} size={16}/>{campo.hectareas != null ? campo.hectareas.toLocaleString(COUNTRIES[country].locale) + " ha · " : ""}
                {campo.operacion === "ambas" ? t("Alquiler y venta") : t(campo.operacion === "alquiler" ? "Alquiler" : campo.operacion === "venta" ? "Venta" : "Campo")}</span>
              <b>{priceText(campo, country)}</b>
              <span className="v3-listing-details">{campo.demo ? t("Publicar en esta zona") : t("Ver publicación")} <ArrowUpRight size={14}/></span>
            </Link>
          </article>)}
        </div>
      </div>
      {showMap && <div className="v3-marketplace-map-panel">
        <div className="v3-map-caption"><MapPin size={16}/>{t("Explorá los campos en el mapa")}</div>
        <div className="v3-map-search-controls">
          <label><input type="checkbox" checked={searchOnMove} onChange={event => {
            setSearchOnMove(event.target.checked);
            if (event.target.checked && pendingBounds) setMapBounds(pendingBounds);
          }}/>{t("Buscar al mover el mapa")}</label>
          {!searchOnMove && pendingBounds && <button type="button" onClick={() => setMapBounds(pendingBounds)}><Search size={15}/>{t("Buscar en esta zona")}</button>}
        </div>
        <V3Map key={mapReset} initialBounds={mapReset ? null : initialBounds} campos={campos} country={country} selectedId={selected} onSelect={handleSelect} onViewportChange={handleViewportChange}/>
        {selectedCampo && <div className="v3-map-selection" role="status">
          <strong>{selectedCampo.titulo}</strong>
          <span>{[selectedCampo.localidad, selectedCampo.provincia].filter(Boolean).join(", ")}</span>
          <Link href={detailHref(selectedCampo.id)}>{t("Ver publicación")} <ArrowUpRight size={14}/></Link>
        </div>}
      </div>}
    </div>
    {showMap && <button type="button" className="v3-mobile-map-button" aria-pressed={mobileMap} onClick={() => setMobileMap(!mobileMap)}>
      {mobileMap ? <List size={18}/> : <MapIcon size={18}/>} {mobileMap ? t("Ver lista") : t("Ver mapa")}
    </button>}
  </div>;
}
