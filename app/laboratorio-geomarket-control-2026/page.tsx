"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type Region = { id:string; country:string; label:string; rainfall:number; ndvi:number; opportunities:number; risk:string; detail:string };
const regions:Region[]=[
 {id:"AR",country:"Argentina",label:"Zona pampeana",rainfall:42,ndvi:0.68,opportunities:8,risk:"Lluvias próximas",detail:"Revisar ventanas de trabajo antes de programar labores."},
 {id:"UY",country:"Uruguay",label:"Litoral agrícola",rainfall:28,ndvi:0.72,opportunities:4,risk:"Seguimiento hídrico",detail:"Comparar precipitaciones con el promedio estacional."},
 {id:"PY",country:"Paraguay",label:"Región Oriental",rainfall:63,ndvi:0.75,opportunities:6,risk:"Exceso de humedad",detail:"Verificar condiciones de acceso y transitabilidad."},
 {id:"US",country:"Estados Unidos",label:"Midwest",rainfall:19,ndvi:0.61,opportunities:3,risk:"Alerta meteorológica",detail:"Consultar avisos oficiales NOAA antes de operar."}
];
const modules=[
 {name:"AgroClimate",type:"Clima",description:"Lluvias, heladas, viento, sequía y balance hídrico",source:"NASA POWER / NOAA NWS",phase:"Base"},
 {name:"GeoMarket Radar",type:"Territorio",description:"Seguimiento de regiones, comparativas y cambios",source:"NASA POWER / Copernicus",phase:"Base"},
 {name:"GeoMarket Match",type:"Mercado",description:"Campos, servicios y demanda por radio",source:"Datos propios RentoCampo",phase:"Base"},
 {name:"Monitor NDVI",type:"Territorio",description:"Evolución de vegetación y anomalías",source:"Copernicus Sentinel",phase:"Evolutivo"},
 {name:"Suelo y aptitud",type:"Territorio",description:"Textura, relieve y aptitud orientativa",source:"ISRIC / DEM públicos",phase:"Evolutivo"},
 {name:"Calendario rural",type:"Operación",description:"Siembra, cosecha, labores y recordatorios",source:"Reglas regionales verificadas",phase:"Base"},
 {name:"Radar de incendios",type:"Clima",description:"Focos detectados y contexto de riesgo",source:"NASA FIRMS",phase:"Evolutivo"},
 {name:"Logística rural",type:"Operación",description:"Accesos, caminos y referencias",source:"OpenStreetMap",phase:"Evolutivo"}
];
export default function GeoMarketLaboratorio(){
 const [regionId,setRegionId]=useState("AR");
 const [filter,setFilter]=useState("Todos");
 const [radius,setRadius]=useState(50);
 const [watch,setWatch]=useState(false);
 const [view,setView]=useState<"panel"|"fuentes">("panel");
 const region=regions.find(r=>r.id===regionId)!;
 const visible=useMemo(()=>modules.filter(m=>filter==="Todos"||m.type===filter),[filter]);
 const panel:React.CSSProperties={background:"#f2f2f0",border:"1px solid #d8d8d5",borderRadius:16,padding:20};
 return <main style={{background:"#fafaf8",color:"#242424",minHeight:"100vh",fontFamily:"Arial,Helvetica,sans-serif",padding:"clamp(16px,4vw,48px)"}}>
 <div style={{maxWidth:1240,margin:"auto"}}>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",borderBottom:"2px solid #333",paddingBottom:16}}>
 <div><div style={{fontSize:13,letterSpacing:3,fontWeight:800}}>RC / RENTOCAMPO</div><h1 style={{fontSize:"clamp(34px,5vw,66px)",letterSpacing:"-.055em",margin:"8px 0"}}>GeoMarket <span style={{color:"#888"}}>Control</span></h1><p style={{margin:0,color:"#666"}}>INTELIGENCIA TERRITORIAL · LABORATORIO V2</p></div>
 <span style={{border:"1px solid #777",padding:"9px 14px",borderRadius:24,fontSize:12}}>PROTOTIPO · DATOS SIMULADOS</span>
 </header>
 <p style={{fontSize:"clamp(18px,2.5vw,27px)",maxWidth:780,lineHeight:1.25,margin:"32px 0"}}>Tu territorio. Tus alertas. Tus oportunidades.<br/><strong>Un sistema de decisiones, no un informe.</strong></p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"end",marginBottom:22}}>
 <label style={{display:"grid",gap:7,fontSize:12,fontWeight:700}}>PAÍS / REGIÓN<select aria-label="Seleccionar país" value={regionId} onChange={e=>setRegionId(e.target.value)} style={{padding:12,borderRadius:8,border:"1px solid #aaa",minWidth:220,background:"white"}}>{regions.map(r=><option key={r.id} value={r.id}>{r.country} · {r.label}</option>)}</select></label>
 <label style={{display:"grid",gap:7,fontSize:12,fontWeight:700}}>RADIO DE INTERÉS: {radius} KM<input aria-label="Radio de interés" type="range" min="10" max="200" step="10" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>
 <button onClick={()=>setWatch(!watch)} style={{padding:"13px 18px",background:watch?"#555":"#222",color:"white",border:0,borderRadius:8,cursor:"pointer"}}>{watch?"✓ Zona guardada en esta vista":"＋ Seguir esta zona"}</button>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
 {[["PRECIPITACIÓN PREVISTA",region.rainfall+" mm","Valor ilustrativo"],["ÍNDICE VEGETAL",region.ndvi.toFixed(2),"NDVI simulado"],["OPORTUNIDADES",String(region.opportunities),"Coincidencias simuladas"],["RADIO ACTIVO",radius+" km","Filtro local"]].map(([label,value,sub])=><div key={label} style={panel}><div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#666"}}>{label}</div><div style={{fontSize:36,fontWeight:800,margin:"12px 0 4px"}}>{value}</div><div style={{fontSize:12,color:"#777"}}>{sub}</div></div>)}
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:18}}>
 <section style={panel}><div style={{fontSize:12,letterSpacing:2}}>01 / RADAR TERRITORIAL</div><h2 style={{fontSize:26,margin:"12px 0"}}>{region.label}</h2><div style={{height:230,borderRadius:12,background:"repeating-linear-gradient(135deg,#ddd 0px,#ddd 2px,#eaeae7 2px,#eaeae7 30px)",display:"grid",placeItems:"center",border:"1px solid #ccc"}}><div style={{textAlign:"center",padding:16}}><div style={{fontSize:40}}>◎</div><strong>Mapa geoespacial</strong><div style={{fontSize:12,color:"#666",marginTop:8}}>Capa cartográfica real pendiente de integración</div></div></div><p style={{color:"#555",fontSize:13}}>Capas previstas: vegetación, suelo, clima, rutas, publicaciones y demanda.</p></section>
 <section style={panel}><div style={{fontSize:12,letterSpacing:2}}>02 / CENTRO DE ALERTAS</div><h2 style={{fontSize:26,margin:"12px 0"}}>Lo que importa hoy</h2><div style={{background:"white",padding:16,borderRadius:12,borderLeft:"4px solid #555",marginBottom:12}}><strong>◉ {region.risk}</strong><p style={{fontSize:14,color:"#555"}}>{region.detail}</p><small>ALERTA DE DEMOSTRACIÓN · NO ES PRONÓSTICO REAL</small></div><div style={{background:"white",padding:16,borderRadius:12}}><strong>◎ Nueva oportunidad cercana</strong><p style={{fontSize:14,color:"#555"}}>Cruzar campos, servicios y demanda en un radio de {radius} km.</p><small>REGLA SIMULADA · SIN CONSULTAS A PRODUCCIÓN</small></div><p style={{fontSize:12,color:"#666"}}>Las alertas reales requerirán fuente, fecha, umbral, precisión y permiso del usuario.</p></section>
 </div>
 <section style={{marginTop:28}}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",alignItems:"center",gap:12}}><h2 style={{fontSize:30,letterSpacing:"-.04em"}}>Soluciones que construimos</h2><div style={{display:"flex",gap:8}}><button onClick={()=>setView("panel")} style={{padding:10,border:"1px solid #aaa",background:view==="panel"?"#333":"white",color:view==="panel"?"white":"#333",borderRadius:8}}>Módulos</button><button onClick={()=>setView("fuentes")} style={{padding:10,border:"1px solid #aaa",background:view==="fuentes"?"#333":"white",color:view==="fuentes"?"white":"#333",borderRadius:8}}>Fuentes y costos</button></div></div>
 {view==="panel"?<><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{["Todos","Clima","Territorio","Mercado","Operación"].map(x=><button key={x} onClick={()=>setFilter(x)} style={{border:"1px solid #aaa",borderRadius:30,padding:"9px 16px",background:filter===x?"#222":"white",color:filter===x?"white":"#333",cursor:"pointer"}}>{x}</button>)}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:12}}>{visible.map((m,i)=><article key={m.name} style={panel}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666"}}><span>{String(i+1).padStart(2,"0")} / {m.type.toUpperCase()}</span><span>{m.phase}</span></div><h3 style={{fontSize:21,marginBottom:8}}>{m.name}</h3><p style={{minHeight:48,fontSize:14}}>{m.description}</p><small style={{color:"#666"}}>FUENTE: {m.source}</small></article>)}</div></>:<div style={panel}><h3>Modelo de fuentes abiertas</h3><p>NASA POWER: históricos y climatología. NOAA NWS: pronósticos y avisos oficiales de EE. UU. Copernicus: imágenes y vegetación. OSM: vías e infraestructura. Datos internos: oferta, demanda y coincidencias.</p><p><strong>Licencias de datos objetivo: USD 0.</strong> No se garantiza costo operativo cero: procesamiento, Vercel, Supabase, mapas y envío de notificaciones pueden generar cargos. Verificar términos y cuotas antes de activar cada conector.</p><p><a href="https://power.larc.nasa.gov/docs/" target="_blank" rel="noreferrer">NASA POWER</a> · <a href="https://www.weather.gov/documentation/services-web-api" target="_blank" rel="noreferrer">NOAA NWS</a> · <a href="https://dataspace.copernicus.eu/" target="_blank" rel="noreferrer">Copernicus</a></p></div>}
 </section>
 <footer style={{borderTop:"1px solid #ccc",marginTop:40,paddingTop:20,color:"#666",fontSize:12}}><strong>Laboratorio privado de desarrollo — no apto para decisiones agronómicas.</strong> Este prototipo no consulta APIs, no envía alertas, no guarda datos de usuario y no modifica el marketplace. <Link href="/" style={{marginLeft:12}}>Volver a RentoCampo</Link></footer>
 </div></main>
}
