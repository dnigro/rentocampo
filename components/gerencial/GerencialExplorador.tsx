"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, isCountryCode } from "@/data/countries";
import "leaflet/dist/leaflet.css";
type CountryStats={country:string;registrations:number;activeLands:number;activeServices:number};
type MonthStats={month:string;registrations:number;activeLands:number;activeServices:number};
type Totals={registrations:number;activeLands:number;activeServices:number};
const fmt=(n:number)=>n.toLocaleString("es-AR");
const name=(c:string)=>isCountryCode(c)?COUNTRIES[c].name:c;
const centers:Record<string,[number,number]>={
 AR:[-38.4,-63.6],UY:[-32.5,-55.8],PY:[-23.4,-58.4],BR:[-14.2,-51.9],CL:[-35.7,-71.5],
 BO:[-16.3,-63.6],PE:[-9.2,-75],EC:[-1.8,-78.2],CO:[4.6,-74.1],VE:[6.4,-66.6],
 MX:[23.6,-102.5],GT:[15.8,-90.2],HN:[15.2,-86.2],SV:[13.8,-88.9],NI:[12.9,-85.2],
 CR:[9.7,-84],PA:[8.5,-80],US:[38,-97]
};
function ActivityMap({rows,selected,onSelect}:{rows:CountryStats[];selected:string;onSelect:(v:string)=>void}){
 const node=useRef<HTMLDivElement>(null);
 const map=useRef<import("leaflet").Map|null>(null);
 useEffect(()=>{
  let alive=true;
  let cleanup=()=>{};
  void import("leaflet").then(L=>{
   if(!alive||!node.current)return;
   const m=L.map(node.current,{scrollWheelZoom:false,zoomControl:true,attributionControl:true}).setView([-15,-68],3);
   map.current=m;
   L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:"© OpenStreetMap contributors"}).addTo(m);
   const markers:ReturnType<typeof L.circleMarker>[]=[];
   rows.forEach(r=>{
    const point=centers[r.country];if(!point)return;
    const count=r.registrations;
    const intensity=count===0?"#cbd5d1":count<10?"#b4d7bd":count<50?"#6aa77c":"#126d38";
    const circle=L.circleMarker(point,{radius:Math.min(26,7+Math.sqrt(count)*1.3),color:selected===r.country?"#111":"#fff",weight:selected===r.country?3:1.5,fillColor:intensity,fillOpacity:.83}).addTo(m);
    circle.bindTooltip(name(r.country)+": "+fmt(count)+" registros verificados");
    circle.on("click",()=>onSelect(r.country));markers.push(circle);
   });
   cleanup=()=>{markers.forEach(x=>x.remove());m.remove();map.current=null;};
   setTimeout(()=>{if(alive)m.invalidateSize()},100);
  });
  return ()=>{alive=false;cleanup()};
 },[rows,selected,onSelect]);
 return <div className="ag-map" ref={node} aria-label="Mapa interactivo de actividad por país en Latinoamérica"/>;
}
export default function GerencialExplorador({countries,months,totals,updatedAt}:{countries:CountryStats[];months:MonthStats[];totals:Totals;updatedAt:string}){
 const [selected,setSelected]=useState("ALL");
 const rows=useMemo(()=>[...countries].sort((a,b)=>b.registrations-a.registrations),[countries]);
 const current=selected==="ALL"?totals:rows.find(r=>r.country===selected)||{registrations:0,activeLands:0,activeServices:0};
 const active=rows.filter(r=>r.registrations>0).length;
 const published=current.activeLands+current.activeServices;
 const monthly=months.map(m=>m.registrations);
 const max=Math.max(1,...monthly);
 const width=680,height=220,pad=22;
 const points=monthly.map((v,i)=>[pad+(i*(width-2*pad)/Math.max(1,monthly.length-1)),height-pad-(v/max)*(height-2*pad)] as const);
 const line=points.map(([x,y],i)=>(i?"L":"M")+x+","+y).join(" ");
 const area=points.length?line+" L"+points[points.length-1][0]+","+(height-pad)+" L"+points[0][0]+","+(height-pad)+" Z":"";
 return <section className="ag-dashboard" aria-label="RentoCampo AgTech Intelligence">
  <header className="ag-head"><div><span className="ag-eyebrow">RENTOCAMPO / LATAM INTELLIGENCE</span><h1>Crecimiento regional</h1><p>Registros verificados y expansión comercial en Latinoamérica</p></div><label>Mercado <select value={selected} onChange={e=>setSelected(e.target.value)}><option value="ALL">Todos los países</option>{rows.map(r=><option key={r.country} value={r.country}>{name(r.country)}</option>)}</select></label></header>
  <div className="ag-kpis"><article><span>Registros verificados</span><strong>{fmt(current.registrations)}</strong><small>Emails confirmados</small></article><article><span>Publicaciones activas</span><strong>{fmt(published)}</strong><small>{fmt(current.activeLands)} campos · {fmt(current.activeServices)} servicios</small></article><article><span>Países con registros</span><strong>{selected==="ALL"?fmt(active):current.registrations>0?"1":"0"}</strong><small>Actividad comprobada</small></article></div>
  <div className="ag-grid"><article className="ag-card ag-mapcard"><div className="ag-cardhead"><h2>Actividad en Latinoamérica</h2><p>Seleccioná un país en el mapa</p></div><ActivityMap rows={rows} selected={selected} onSelect={setSelected}/><p className="ag-note">Los círculos se intensifican según los registros. Gris: sin registros · Verde: actividad creciente.</p></article>
  <div className="ag-right"><article className="ag-card"><div className="ag-cardhead"><h2>Evolución de registros</h2><p>Altas mensuales verificadas · últimos seis meses</p></div>{points.length?<div className="ag-chart"><svg viewBox="0 0 680 220" role="img" aria-label="Gráfico de altas mensuales verificadas"><defs><linearGradient id="ag-fill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#168044" stopOpacity=".17"/><stop offset="1" stopColor="#168044" stopOpacity="0"/></linearGradient></defs>{[.25,.5,.75,1].map(v=><line key={v} x1={pad} x2={width-pad} y1={height-pad-v*(height-2*pad)} y2={height-pad-v*(height-2*pad)} stroke="#e7e9e8"/>)}<path d={area} fill="url(#ag-fill)"/><path d={line} fill="none" stroke="#151b17" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>{points.map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#168044" stroke="white" strokeWidth="2"/>)}</svg><div className="ag-axis">{months.map(m=><span key={m.month}>{m.month.slice(5)}</span>)}</div></div>:<p>Sin datos mensuales.</p>}</article>
  <article className="ag-card"><div className="ag-cardhead"><h2>Registros por país</h2><p>Participación sobre el total de registros verificados</p></div><div className="ag-ranking">{rows.filter(r=>r.registrations>0&&(selected==="ALL"||r.country===selected)).map(r=><button type="button" key={r.country} onClick={()=>setSelected(r.country)} className="ag-rank"><span>{name(r.country)}</span><div className="ag-track"><i style={{width:(totals.registrations?r.registrations/totals.registrations*100:0)+"%"}}/></div><strong>{fmt(r.registrations)}</strong><small>{totals.registrations?(100*r.registrations/totals.registrations).toFixed(1):"0"}%</small></button>)}{rows.every(r=>r.registrations===0)&&<p>Sin registros verificados todavía.</p>}</div></article></div></div>
  <footer className="ag-footer">Fuente: usuarios con email confirmado y publicaciones activas. Actualizado {new Date(updatedAt).toLocaleString("es-AR",{timeZone:"America/Argentina/Buenos_Aires"})}. Los círculos representan actividad por país, no densidad geográfica.</footer>
 </section>;
}
