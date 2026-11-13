"use client";
import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Map as MapIcon, List, Search, ArrowUpRight, RotateCcw } from "lucide-react";
import { COUNTRIES, COUNTRY_CODES_ALPHABETICAL, displayCountryName, type CountryCode } from "@/data/countries";
import { SERVICIOS_RURALES, servicioLabel } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import { addMapBounds, isWithinBounds, type MapBounds } from "@/lib/campos/map-search";
import V3Map from "./V3Map";
import V3CardPhotos from "./V3CardPhotos";
import RuralIcon from "./RuralIcon";
import type { V3Campo } from "./V3Explorer";

export type RuralListing = V3Campo & { kind: "campo" | "servicio"; sourceId: string; services: ServicioRural[]; coverage: string | null };
export type HomeFilters = { pais?: string; tipo?: string; provincia?: string; operacion?: string; aptitud?: string; servicio?: string; north?: string; south?: string; east?: string; west?: string };
export default function V3UnifiedExplorer({ listings, country, filter, errors, capped, initialBounds }: { listings: RuralListing[]; country: CountryCode; filter: HomeFilters; errors: string[]; capped: boolean; initialBounds: MapBounds | null }) {
 const t = (es: string, pt: string, en: string) => country === "BR" ? pt : country === "US" ? en : es;
 const [kind, setKind] = useState(["campo","servicio"].includes(filter.tipo || "") ? filter.tipo! : "todo");
 const [bounds, setBounds] = useState(initialBounds);
 const [reset, setReset] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [mobileMap, setMobileMap] = useState(false);
 const [autoSearch, setAutoSearch] = useState(true);
 const [pending, setPending] = useState<MapBounds | null>(null);
 const [location, setLocation] = useState(filter.provincia || "");
 const [operation, setOperation] = useState(filter.operacion || "");
 const [aptitude, setAptitude] = useState(filter.aptitud || "");
 const [service, setService] = useState(filter.servicio || "");
 const [applied, setApplied] = useState({ location, operation, aptitude, service });
 const kindName = (value: string) => value === "campo" ? t("Campos","Terras","Farmland") : value === "servicio" ? t("Servicios","Serviços","Services") : t("Todo","Tudo","All");
 const aptitudeName = (value: string) => ({agricola:t("Agrícola","Agrícola","Agricultural"),ganadera:t("Ganadero","Pecuária","Livestock"),mixta:t("Mixto","Misto","Mixed use"),forestal:t("Forestal","Florestal","Forestry")} as Record<string,string>)[value] || value;
 const matches = useMemo(() => listings.filter(item => {
  if(kind !== "todo" && item.kind !== kind) return false;
  const query = applied.location.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  const area = [item.localidad,item.provincia,item.coverage].filter(Boolean).join(" ").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
  if(query && !area.includes(query)) return false;
  if(kind === "campo" && ((applied.operation && item.operacion !== applied.operation && item.operacion !== "ambas") || (applied.aptitude && item.aptitud !== applied.aptitude))) return false;
  if(kind === "servicio" && applied.service && !item.services.includes(applied.service as ServicioRural)) return false;
  return true;
 }),[listings,kind,applied]);
 const visible = useMemo(() => bounds ? matches.filter(item => isWithinBounds(item,bounds)) : matches,[matches,bounds]);
 const missing = matches.filter(item => item.lat == null || item.lng == null).length;
 const search = addMapBounds(new URLSearchParams({pais:country,tipo:kind,...(applied.location?{provincia:applied.location}:{}),...(kind==="campo"?{operacion:applied.operation,aptitud:applied.aptitude}:{}),...(kind==="servicio"?{servicio:applied.service}:{})}),bounds);
 const href = (item: RuralListing) => `/v3/${item.kind === "campo" ? "campos" : "servicios"}/${item.sourceId}?${search}&origen=home`;
 const selectedItem = matches.find(item => item.id === selected);
 const onMove = useCallback((next: MapBounds) => { setPending(next); if(autoSearch) setBounds(next); },[autoSearch]);
 const onSelect = useCallback((id: string) => {setSelected(id); if(!window.matchMedia("(max-width:700px)").matches) document.getElementById(`rural-${id}`)?.scrollIntoView({block:"nearest",behavior:"smooth"});},[]);
 const resetArea = () => {setBounds(null);setPending(null);setReset(value=>value+1);setSelected(null);};
 const changeKind = (value: string) => {setKind(value);setSelected(null);};
 return <section className="v3-unified" id="explorar" aria-label={t("Explorar campos y servicios","Explorar terras e serviços","Explore farmland and services")}>
  <div className="rural-type-tabs" role="group" aria-label={t("Tipo de publicación","Tipo de anúncio","Listing type")}>
   {["todo","campo","servicio"].map(value=><button key={value} type="button" aria-pressed={kind===value} onClick={()=>changeKind(value)}><RuralIcon name={value === "todo" ? "mixta" : value}/>{kindName(value)}</button>)}
  </div>
  <form className="v3-home-search rural-search" onSubmit={event=>{event.preventDefault();setApplied({location,operation,aptitude,service});setSelected(null);}}>
   <label><span>{t("País","País","Country")}</span><select aria-label={t("País","País","Country")} name="pais" value={country} onChange={event=>{window.location.assign(`/v3?pais=${event.target.value}&tipo=${kind}#explorar`);}}>{COUNTRY_CODES_ALPHABETICAL.map(code=><option key={code} value={code}>{displayCountryName(code,country)}</option>)}</select></label>
   <label className="rural-location-input"><span>{t("¿Dónde buscás?","Onde você procura?","Where are you looking?")}</span><input name="provincia" value={location} onChange={event=>setLocation(event.target.value)} placeholder={t("Provincia, localidad o zona","Estado, cidade ou região","State, town or area")}/></label>
   {kind === "campo" && <><label><span>{t("Operación","Operação","Transaction")}</span><select name="operacion" value={operation} onChange={event=>setOperation(event.target.value)}><option value="">{t("Todas","Todas","All")}</option><option value="alquiler">{t("Alquiler","Arrendamento","Lease")}</option><option value="venta">{t("Venta","Venda","Sale")}</option></select></label><label><span>{t("Aptitud","Aptidão","Land use")}</span><select name="aptitud" value={aptitude} onChange={event=>setAptitude(event.target.value)}><option value="">{t("Todas","Todas","All")}</option>{["agricola","ganadera","mixta","forestal"].map(value=><option key={value} value={value}>{aptitudeName(value)}</option>)}</select></label></>}
   {kind === "servicio" && <label><span>{t("Especialidad","Especialidade","Specialty")}</span><select name="servicio" value={service} onChange={event=>setService(event.target.value)}><option value="">{t("Todos los servicios","Todos os serviços","All services")}</option>{SERVICIOS_RURALES.map(item=><option key={item.value} value={item.value}>{servicioLabel(item.value,country)}</option>)}</select></label>}
   <button type="submit"><Search size={20}/>{t("Buscar","Buscar","Search")}</button>
  </form>
  <div className="rural-result-toolbar"><p aria-live="polite"><strong>{visible.length}</strong> {t("publicaciones","anúncios","listings")} · {displayCountryName(country,country)}{bounds ? t(" · en esta zona"," · nesta região"," · in this area") : ""}</p><button type="button" onClick={()=>{setLocation("");setOperation("");setAptitude("");setService("");setApplied({location:"",operation:"",aptitude:"",service:""});resetArea();}}><RotateCcw size={15}/>{t("Limpiar filtros","Limpar filtros","Clear filters")}</button></div>
  {errors.length>0 && <p role="alert" className="rural-notice">{t("No pudimos cargar:","Não foi possível carregar:","Could not load:")} {errors.map(kindName).join(", ")}. {t("Volvé a intentarlo.","Tente novamente.","Please try again.")}</p>}
  {capped && <p className="rural-notice">{t("Mostramos hasta 120 campos y 120 servicios recientes por país. Los filtros y el mapa se aplican a este conjunto.","Exibimos até 120 terras e 120 serviços recentes por país. Os filtros e o mapa se aplicam a esse conjunto.","Showing up to 120 recent properties and 120 services per country. Filters and map apply to this set.")}</p>}
  <div className={`rural-explorer-body ${mobileMap ? "rural-mobile-map" : ""}`}>
   <div className="rural-results">
    {missing>0 && <p className="rural-location-note">{missing} {t("sin coordenadas: disponibles en la lista al ampliar a todo el país.","sem coordenadas: disponíveis na lista ao ampliar para todo o país.","without coordinates: available in the list when viewing the whole country.")}{bounds && <button type="button" onClick={resetArea}>{t("Ver todo el país","Ver todo o país","View whole country")}</button>}</p>}
    {!visible.length && <div className="v3-marketplace-empty"><RuralIcon name={kind} size={32}/><h2>{t("Ampliá tu búsqueda","Amplie sua busca","Broaden your search")}</h2><p>{t("Probá otra zona o quitá filtros.","Tente outra região ou remova filtros.","Try another area or remove filters.")}</p>{bounds && <button type="button" onClick={resetArea}>{t("Ver todo el país","Ver todo o país","View whole country")}</button>}</div>}
    <div className="rural-card-grid">{visible.map(item=><article key={item.id} id={`rural-${item.id}`} className={`v3-listing-card ${item.kind === "servicio" ? "rural-service-card" : "rural-field-card"} ${selected === item.id ? "v3-selected-card" : ""}`} onMouseEnter={()=>setSelected(item.id)} onFocus={()=>setSelected(item.id)}>
     <div className="v3-listing-media"><V3CardPhotos photos={item.fotos || []} title={item.titulo} href={href(item)}/><span className="v3-listing-badge"><RuralIcon name={item.kind} size={14}/>{kindName(item.kind)}</span></div>
     <Link href={href(item)} className="v3-listing-info"><strong>{item.titulo}</strong><span><MapPin size={14} aria-hidden="true"/>{[item.localidad,item.provincia].filter(Boolean).join(", ") || displayCountryName(country,country)}</span>
      <div className="rural-card-features">
       {item.kind === "campo" ? <>{item.hectareas != null && <span><RuralIcon name="superficie"/>{item.hectareas.toLocaleString(COUNTRIES[country].locale)} ha</span>}{item.aptitud && <span><RuralIcon name={item.aptitud}/>{aptitudeName(item.aptitud)}</span>}{item.operacion && <span><RuralIcon name="operacion"/>{item.operacion === "ambas" ? t("Alquiler y venta","Arrendamento e venda","Lease and sale") : item.operacion === "venta" ? t("Venta","Venda","Sale") : t("Alquiler","Arrendamento","Lease")}</span>}</> : item.services.slice(0,3).map(value=><span key={value}><RuralIcon name={value}/>{servicioLabel(value,country)}</span>)}
      </div>
      {item.kind === "servicio" && item.coverage && <span className="rural-coverage">{t("Cobertura:","Atendimento:","Coverage:")} {item.coverage}</span>}
      {item.kind === "campo" && <b>{item.precio != null ? `${item.moneda || ""} ${item.precio.toLocaleString(COUNTRIES[country].locale)}` : t("Precio a consultar","Preço sob consulta","Price on request")}</b>}
      <span className="v3-listing-details">{t("Ver publicación","Ver anúncio","View listing")} <ArrowUpRight size={14}/></span>
     </Link></article>)}</div>
   </div>
   <div className="rural-map-panel"><div className="rural-map-controls"><label><input type="checkbox" checked={autoSearch} onChange={event=>{setAutoSearch(event.target.checked);if(event.target.checked && pending)setBounds(pending);}}/>{t("Buscar al mover el mapa","Buscar ao mover o mapa","Search as map moves")}</label>{!autoSearch && pending && <button type="button" onClick={()=>setBounds(pending)}>{t("Buscar en esta zona","Buscar nesta região","Search this area")}</button>}{bounds && <button type="button" onClick={resetArea}>{t("Ver todo el país","Ver todo o país","View whole country")}</button>}</div>
    <V3Map key={`${country}-${kind}-${reset}`} campos={matches} country={country} selectedId={selected} onSelect={onSelect} onViewportChange={onMove} initialBounds={bounds && reset === 0 ? initialBounds : null}/>
    <div className="rural-map-legend"><span><i/>{kindName("campo")}</span><span><i/>{kindName("servicio")}</span><small>{t("Servicios: base declarada, no límite de cobertura.","Serviços: base declarada, não limite de cobertura.","Services: declared base, not coverage boundary.")}</small></div>
    {selectedItem && <div className="rural-map-selection"><strong>{selectedItem.titulo}</strong>{selectedItem.coverage && <span>{t("Cobertura:","Atendimento:","Coverage:")} {selectedItem.coverage}</span>}<Link href={href(selectedItem)}>{t("Ver publicación","Ver anúncio","View listing")} <ArrowUpRight size={14}/></Link></div>}
   </div>
  </div>
  <button className="rural-mobile-toggle" type="button" aria-pressed={mobileMap} onClick={()=>setMobileMap(!mobileMap)}>{mobileMap ? <List size={18}/> : <MapIcon size={18}/>} {mobileMap ? t("Ver fichas","Ver anúncios","Show listings") : t("Ver mapa","Ver mapa","Show map")}</button>
 </section>;
}
