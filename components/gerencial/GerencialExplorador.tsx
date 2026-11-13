"use client";
import {useMemo,useState} from "react";
import {UsersRound,MapPinned,Wrench,Globe2,ShieldCheck,TrendingUp} from "lucide-react";
import {COUNTRIES,isCountryCode} from "@/data/countries";
type CountryStats={country:string;registrations:number;activeLands:number;activeServices:number};
type MonthStats={month:string;registrations:number;activeLands:number;activeServices:number};
type Totals={registrations:number;activeLands:number;activeServices:number};
const fmt=(n:number)=>n.toLocaleString("es-AR");
const name=(c:string)=>isCountryCode(c)?COUNTRIES[c].name:c;
const palette=["#2563eb","#10b981","#f59e0b"];
export default function GerencialExplorador({countries,months,totals,updatedAt}:{countries:CountryStats[];months:MonthStats[];totals:Totals;updatedAt:string}){
 const [selected,setSelected]=useState("ALL");
 const rows=useMemo(()=>[...countries].sort((a,b)=>b.registrations-a.registrations),[countries]);
 const current=selected==="ALL"?totals:(rows.find(x=>x.country===selected)||{registrations:0,activeLands:0,activeServices:0});
 const active=rows.filter(x=>x.registrations+x.activeLands+x.activeServices>0).length;
 const kpis=[{label:"Usuarios verificados",value:current.registrations,Icon:UsersRound,color:"#2563eb",detail:"Correos confirmados"},{label:"Campos publicados",value:current.activeLands,Icon:MapPinned,color:"#10b981",detail:"Publicaciones activas"},{label:"Servicios rurales",value:current.activeServices,Icon:Wrench,color:"#f59e0b",detail:"Publicaciones activas"},{label:"Mercados activos",value:active,Icon:Globe2,color:"#7c3aed",detail:"De "+countries.length+" países"}];
 const max=Math.max(1,...months.map(m=>m.registrations));
 const goal=1000;
 return <main className="rc-executive" aria-label="Reporte gerencial de RentoCampo">
  <header className="rc-executive-head"><div><span className="rc-executive-eyebrow">RENTOCAMPO / GROWTH 360°</span><h1>Reporte gerencial</h1><p>Actividad comercial real · {new Date(updatedAt).toLocaleString("es-AR",{timeZone:"America/Argentina/Buenos_Aires",dateStyle:"medium",timeStyle:"short"})}</p></div><span className="rc-executive-private"><ShieldCheck size={16}/> Acceso privado</span></header>
  <div className="rc-executive-toolbar"><div><h2>Estado del negocio</h2><p>Usuarios, oferta y expansión regional</p></div><label>Mercado <select value={selected} onChange={e=>setSelected(e.target.value)}><option value="ALL">Todos los países</option>{rows.map(x=><option value={x.country} key={x.country}>{name(x.country)}</option>)}</select></label></div>
  <section className="rc-executive-kpis" aria-label="Indicadores principales">{kpis.map(({label,value,Icon,color,detail})=><article className="rc-executive-kpi" key={label} style={{borderTopColor:color}}><div className="rc-executive-kpi-top"><Icon size={23} color={color}/><span>{detail}</span></div><strong>{fmt(value)}</strong><h3>{label}</h3></article>)}</section>
  <div className="rc-executive-columns"><section className="rc-executive-card"><div className="rc-executive-section-head"><div><TrendingUp size={20}/><h2>Evolución de registros</h2></div><span>Datos mensuales</span></div>{months.length?<div className="rc-executive-chart" role="img" aria-label="Gráfico de barras de registros mensuales">{months.map((m,i)=><div className="rc-executive-barcol" key={m.month+"-"+i}><span>{fmt(m.registrations)}</span><div className="rc-executive-bartrack"><div style={{height:(m.registrations/max*100)+"%"}}/></div><small>{m.month}</small></div>)}</div>:<p className="rc-executive-empty">Sin datos mensuales disponibles.</p>}</section>
  <section className="rc-executive-card"><div className="rc-executive-section-head"><div><UsersRound size={20}/><h2>Meta de usuarios</h2></div><span>Objetivo: 1.000</span></div><div className="rc-executive-goal"><strong>{fmt(totals.registrations)} <small>/ {fmt(goal)}</small></strong><div className="rc-executive-progress"><span style={{width:Math.min(100,totals.registrations/goal*100)+"%"}}/></div><p>{Math.max(0,goal-totals.registrations).toLocaleString("es-AR")} registros restantes para alcanzar la meta.</p></div><div className="rc-executive-legend">{[["Usuarios","#2563eb"],["Campos","#10b981"],["Servicios","#f59e0b"]].map(([label,color])=><span key={label}><i style={{background:color}}/>{label}</span>)}</div></section></div>
  <section className="rc-executive-card"><div className="rc-executive-section-head"><div><Globe2 size={20}/><h2>Actividad por país</h2></div><span>{active} mercados con actividad</span></div><div className="rc-executive-tablewrap"><table><thead><tr><th>País</th><th>Usuarios</th><th>Campos</th><th>Servicios</th><th>Total</th></tr></thead><tbody>{rows.map(x=><tr key={x.country}><th>{name(x.country)}</th><td>{fmt(x.registrations)}</td><td>{fmt(x.activeLands)}</td><td>{fmt(x.activeServices)}</td><td><strong>{fmt(x.registrations+x.activeLands+x.activeServices)}</strong></td></tr>)}</tbody></table></div></section>
  <p className="rc-executive-footnote">Fuente: métricas del sistema. Usuarios verificados y publicaciones son unidades diferentes; el total por país suma ambas categorías y no representa personas únicas.</p>
 </main>;
}
