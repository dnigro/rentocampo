"use client";
import { useMemo, useState } from "react";
import { COUNTRIES, isCountryCode } from "@/data/countries";
import latamGeo from "@/data/latam-map.json";
type CountryStats={country:string;registrations:number;activeLands:number;activeServices:number};
type MonthStats={month:string;registrations:number;activeLands:number;activeServices:number};
type Totals={registrations:number;activeLands:number;activeServices:number};
const fmt=(n:number)=>n.toLocaleString("es-AR");
const name=(c:string)=>isCountryCode(c)?COUNTRIES[c].name:c;
type Position=number[];
type Geometry={type:string;coordinates:unknown};
type Feature={type:string;properties:{code:string;name:string};geometry:Geometry};
const geoFeatures=(latamGeo.features as Feature[]).filter(f=>f.properties.code!=="US");
const project=(p:Position):[number,number]=>[(p[0]+118)*5.15,(34-p[1])*5.15];
function geometryPath(geometry:Geometry){
 const polygons=geometry.type==="Polygon"?[geometry.coordinates]:geometry.type==="MultiPolygon"?geometry.coordinates:[];
 return (polygons as Position[][][]).flatMap(poly=>poly.map(ring=>ring.map((pt,i)=>{
  const [x,y]=project(pt);return (i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2);
 }).join(" ")+" Z")).join(" ");
}
function ActivityMap({rows,selected,onSelect}:{rows:CountryStats[];selected:string;onSelect:(v:string)=>void}){
 const stats=new Map(rows.map(r=>[r.country,r.registrations]));
 const color=(count:number)=>count===0?"#e2e7e3":count<10?"#c1dfc8":count<50?"#78b68a":count<200?"#36885a":"#126a39";
 return <div className="ag-map ag-svgmap"><svg viewBox="0 0 460 485" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Mapa de países de Latinoamérica coloreados según registros verificados">
 {geoFeatures.map(feature=>{
  const code=feature.properties.code,count=stats.get(code)||0;
  return <path key={code} d={geometryPath(feature.geometry)} fill={color(count)} stroke={selected===code?"#16251c":"#fff"} strokeWidth={selected===code?2:0.8} strokeLinejoin="round" className="ag-country" tabIndex={stats.has(code)?0:undefined} role={stats.has(code)?"button":undefined} aria-label={name(code)+": "+fmt(count)+" registros verificados"} onClick={()=>stats.has(code)&&onSelect(code)} onKeyDown={e=>{if(stats.has(code)&&(e.key==="Enter"||e.key===" ")){e.preventDefault();onSelect(code)}}}><title>{name(code)+": "+fmt(count)+" registros verificados"}</title></path>
 })}
 </svg><div className="ag-maplegend"><span><i style={{background:"#e2e7e3"}}/>Sin registros</span><span><i style={{background:"#c1dfc8"}}/>Inicial</span><span><i style={{background:"#78b68a"}}/>Media</span><span><i style={{background:"#126a39"}}/>Mayor actividad</span></div></div>;
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
