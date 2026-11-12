"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Map as MapIcon, MapPin, SlidersHorizontal, Search, List, ArrowUpRight } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, type CountryCode } from "@/data/countries";
import V3Map from "./V3Map";

export type V3Campo = {
  id: string; titulo: string; localidad: string | null; provincia: string | null;
  hectareas: number | null; aptitud: string | null; operacion: string | null;
  precio: number | null; moneda: string | null; foto: string | null;
  lat: number | null; lng: number | null;
};

type Props = { campos: V3Campo[]; country: CountryCode; filter: {
  provincia?: string; operacion?: string; aptitud?: string; hectareas_min?: string;
}; error?: boolean };

const aptitudeLabels: Record<string, string> = {
  agricola: "Agrícola", ganadera: "Ganadero", mixta: "Mixto", forestal: "Forestal"
};

function priceText(campo: V3Campo) {
  if (campo.precio == null || !Number.isFinite(campo.precio)) return "Precio a consultar";
  return [campo.moneda, campo.precio.toLocaleString("es-AR")].filter(Boolean).join(" ");
}

export default function V3Explorer({ campos, country, filter, error }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [mobileMap, setMobileMap] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("rentocampo_v3_uat_favs");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavs(parsed.filter((x): x is string => typeof x === "string"));
      }
    } catch { /* Storage disabled, session-only state still works. */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { sessionStorage.setItem("rentocampo_v3_uat_favs", JSON.stringify(favs)); } catch { /* Optional storage */ }
  }, [favs, loaded]);

  const toggleFav = (id: string) => {
    setFavs(previous => previous.includes(id) ? previous.filter(item => item !== id) : [...previous, id]);
  };

  const visibleCampos = campos;
  const handleSelect = useCallback((id: string) => {
    setSelected(id);
    setMobileMap(false);
    window.setTimeout(() => {
      document.getElementById("v3-listing-" + id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  }, []);

  return <div className="v3-marketplace">
    <form className="v3-marketplace-filters" action="/v3/campos" method="get" aria-label="Filtrar campos">
      <label><span>País</span><select name="pais" defaultValue={country}>{COUNTRY_CODES_ALPHABETICAL.map(code => <option key={code} value={code}>{COUNTRIES[code].name}</option>)}</select></label>
      <label><span>Operación</span><select name="operacion" defaultValue={filter.operacion || ""}>
        <option value="">Todas</option><option value="alquiler">Alquiler</option><option value="venta">Venta</option><option value="ambas">Alquiler y venta</option>
      </select></label>
      <label><span>Provincia</span><input name="provincia" placeholder="Cualquier provincia" defaultValue={filter.provincia || ""}/></label>
      <label><span>Aptitud</span><select name="aptitud" defaultValue={filter.aptitud || ""}>
        <option value="">Todas</option><option value="agricola">Agrícola</option><option value="ganadera">Ganadera</option><option value="mixta">Mixta</option><option value="forestal">Forestal</option>
      </select></label>
      <label><span>Superficie mínima</span><input type="number" min="0" name="hectareas_min" placeholder="Hectáreas" defaultValue={filter.hectareas_min || ""}/></label>
      <button type="submit" className="v3-filter-submit"><Search size={19}/> Buscar</button>
    </form>
    <div className="v3-marketplace-toolbar">
      <p><strong>{visibleCampos.length}</strong> {visibleCampos.length === 1 ? "campo encontrado" : "campos encontrados"} · {country}</p>
      <div className="v3-marketplace-actions">
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
          <Link href={`/v3/campos?pais=${country}`}>Ver todos los campos</Link>
        </div>}
        <div className="v3-marketplace-grid">
          {visibleCampos.map(campo => <article key={campo.id} id={`v3-listing-${campo.id}`}
              className={`v3-listing-card ${selected === campo.id ? "v3-selected-card" : ""}`}
              onMouseEnter={() => setSelected(campo.id)} onFocus={() => setSelected(campo.id)}>
            <div className="v3-listing-media">
              <Link href={`/v3/campos/${campo.id}`} aria-label={`Ver ${campo.titulo}`}>
                {campo.foto ? <Image src={campo.foto} alt={campo.titulo} fill sizes="(max-width: 780px) 100vw, (max-width: 1250px) 50vw, 380px"/> :
                  <div className="v3-listing-placeholder">Fotografía no disponible</div>}
              </Link>
              <span className="v3-listing-badge">{aptitudeLabels[campo.aptitud || ""] || campo.aptitud || "Campo rural"}</span>
              <button type="button" className={`v3-heart-button ${loaded && favs.includes(campo.id) ? "saved" : ""}`}
                aria-label={favs.includes(campo.id) ? "Quitar de favoritos de UAT" : "Agregar a favoritos de UAT"}
                aria-pressed={loaded && favs.includes(campo.id)} onClick={() => toggleFav(campo.id)}>
                <Heart size={19} fill={loaded && favs.includes(campo.id) ? "currentColor" : "none"}/>
              </button>
            </div>
            <Link href={`/v3/campos/${campo.id}`} className="v3-listing-info">
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
        <V3Map campos={visibleCampos} country={country} selectedId={selected} onSelect={handleSelect}/>
      </div>}
    </div>
    {showMap && <button type="button" className="v3-mobile-map-button" onClick={() => setMobileMap(!mobileMap)}>
      {mobileMap ? <List size={18}/> : <MapIcon size={18}/>} {mobileMap ? "Ver lista" : "Ver mapa"}
    </button>}
  </div>;
}
