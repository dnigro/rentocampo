"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, isCountryCode } from "@/data/countries";
import "leaflet/dist/leaflet.css";
type CountryStats={country:string;registrations:number;activeLands:number;activeServices:number};
type MonthStats={month:string;registrations:number;activeLands:number;activeServices:number};
type Totals={registrations:number;activeLands:number;activeServices:number};
const fmt=(n:number)=>n.toLocaleString("es-AR");
const name=(c:string)=>isCountryCode(c)?COUNTRIES[c].name:c;
function ActivityMap({rows,selected,onSelect}:{rows:CountryStats[];selected:string;onSelect:(v:string)=>void}){
 const node=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let alive=true;
  let cleanup=()=>{};
  void import("leaflet").then(async L=>{
   if(!alive||!node.current)return;
   const m=L.map(node.current,{scrollWheelZoom:false,zoomControl:false,attributionControl:true,preferCanvas:true}).setView([-14,-72],3);
   // No raster tile provider: the report is a clean political map, not a street map.
   const stats=new Map(rows.map(r=>[r.country,r.registrations]));
   const color=(count:number)=>count===0?"#e2e7e3":count<10?"#c1dfc8":count<50?"#78b68a":count<200?"#36885a":"#126a39";
   let layer:ReturnType<typeof L.geoJSON>|null=null;
   try{
    const response=await fetch("/geo/latam-countries.geojson");
    if(!response.ok)throw new Error("Mapa geográfico no disponible");
    const geo=await response.json();
    if(!alive)return;
    layer=L.geoJSON(geo,{style:(feature)=>{
     const p=feature?.properties||{};
     const code=String(p.code||"");
     const count=stats.get(code)||0;
     return {color:selected===code?"#18221b":"#fff",weight:selected===code?2.5:1,fillColor:color(count),fillOpacity:.88};
    },onEachFeature:(feature,shape)=>{
     const p=feature.properties||{};
     const code=String(p.code||"");
     if(!stats.has(code))return;
     shape.bindTooltip(name(code)+": "+fmt(stats.get(code)||0)+" registros verificados");
     shape.on("click",()=>onSelect(code));
    }}).addTo(m);
    m.fitBounds([[-56,-118],[33,-34]],{padding:[8,8]});
   }catch(error){if(alive&&node.current){node.current.setAttribute("data-map-error","true");node.current.setAttribute("aria-label","No se pudo cargar el mapa político");}}
   cleanup=()=>{layer?.remove();m.remove()};
  });
  return ()=>{alive=false;cleanup()};
 },[rows,selected,onSelect]);
 return <div className="ag-map" ref={node} aria-label="Mapa coroplético de registros verificados por país en Latinoamérica"/>;
}
export default function GerencialExplorador({countries,months,totals,updatedAt}:{countries:CountryStats[];months:MonthStats[];totals:Totals;updatedAt:string}){
 const [selected,setSelected]=useState("ALL");
 const rows=useMemo(()=>[...countries].sort((a,b)=>b.registrations-a.registrations),[countries]);
 const current=selected==="ALL"?totals:rows.find(r=>r.country===selected)||{registrations:0,activeLands:0,activeServices:0};
 const active=rows.filter(r=>r.registrations>0).length;
 
 const monthly=months.map(m=>m.registrations);
 const max=Math.max(1,...monthly);
 const width=680,height=220,pad=22;
 const points=monthly.map((v,i)=>[pad+(i*(width-2*pad)/Math.max(1,monthly.length-1)),height-pad-(v/max)*(height-2*pad)] as const);
 const line=points.map(([x,y],i)=>(i?"L":"M")+x+","+y).join(" ");
 const area=points.length?line+" L"+points[points.length-1][0]+","+(height-pad)+" L"+points[0][0]+","+(height-pad)+" Z":"";
 return <section className="ag-dashboard" aria-label="RentoCampo AgTech Intelligence">
  <header className="ag-head"><div><span className="ag-eyebrow">RENTOCAMPO / LATAM INTELLIGENCE</span><h1>Crecimiento regional</h1><p>Registros verificados y expansión comercial en Latinoamérica</p></div><label>Mercado <select value={selected} onChange={e=>setSelected(e.target.value)}><option value="ALL">Todos los países</option>{rows.map(r=><option key={r.country} value={r.country}>{name(r.country)}</option>)}</select></label></header>
  <div className="ag-kpis"><article><span>Registros verificados</span><strong>{fmt(current.registrations)}</strong><small>Emails confirmados</small></article><article><span>Campos activos</span><strong>{fmt(current.activeLands)}</strong><small>Publicaciones de campos</small></article><article><span>Servicios rurales</span><strong>{fmt(current.activeServices)}</strong><small>Servicios publicados activos</small></article><article><span>Países con registros</span><strong>{selected==="ALL"?fmt(active):current.registrations>0?"1":"0"}</strong><small>Actividad comprobada</small></article></div>
  <div className="ag-grid"><article className="ag-card ag-mapcard"><div className="ag-cardhead"><h2>Actividad en Latinoamérica</h2><p>Seleccioná un país en el mapa</p></div><ActivityMap rows={rows} selected={selected} onSelect={setSelected}/><p className="ag-note">Países coloreados según registros verificados. Gris: sin registros · Verde: mayor actividad.</p></article>
  <div className="ag-right"><article className="ag-card"><div className="ag-cardhead"><h2>Evolución de registros</h2><p>Altas mensuales verificadas · últimos seis meses</p></div>{points.length?<div className="ag-chart"><svg viewBox="0 0 680 220" role="img" aria-label="Gráfico de altas mensuales verificadas"><defs><linearGradient id="ag-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#168044" stopOpacity=".17"/><stop offset="1" stopColor="#168044" stopOpacity="0"/></linearGradient></defs>{[.25,.5,.75,1].map(v=><line key={v} x1={pad} x2={width-pad} y1={height-pad-v*(height-2*pad)} y2={height-pad-v*(height-2*pad)} stroke="#e7e9e8"/>)}<path d={area} fill="url(#ag-fill)"/><path d={line} fill="none" stroke="#151b17" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#168044" stroke="white" strokeWidth="2"/>)}</svg><div className="ag-axis">{months.map(m=><span key={m.month}>{m.month.slice(5)}</span>)}</div></div>:<p>Sin datos mensuales.</p>}</article>
  <article className="ag-card"><div className="ag-cardhead"><h2>Registros por país</h2><p>Participación sobre el total de registros verificados</p></div><div className="ag-ranking">{rows.filter(r=>r.registrations>0&&(selected==="ALL"||r.country===selected)).map(r=><button type="button" key={r.country} onClick={()=>setSelected(r.country)} className="ag-rank"><span>{name(r.country)}</span><div className="ag-track"><i style={{width:(totals.registrations?r.registrations/totals.registrations*100:0)+"%"}}/></div><strong>{fmt(r.registrations)}</strong><small>{totals.registrations?(100*r.registrations/totals.registrations).toFixed(1):"0"}%</small></button>)}{rows.every(r=>r.registrations===0)&&<p>Sin registros verificados todavía.</p>}</div></article></div></div>
  <footer className="ag-footer">Fuente: usuarios con email confirmado y publicaciones activas. Actualizado {new Date(updatedAt).toLocaleString("es-AR",{timeZone:"America/Argentina/Buenos_Aires"})}. Los círculos representan actividad por país, no densidad geográfica.</footer>
 </section>;
}
