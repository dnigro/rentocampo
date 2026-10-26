"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

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
type Observation={lat:number;lon:number;rainfallMm:number;meanTempC:number|null;meanHumidityPct:number|null;meanWindMs:number|null;days:number;dailyRain:{date:string;mm:number}[]};
type LiveData={summary:{sampleCount:number;minimumMm:number;maximumMm:number;meanMm:number;centralDailyRain:{date:string;mm:number}[];centralHumidityPct:number|null;centralWindMs:number|null;centralTempC:number|null};country:string;region:string;center:[number,number];period:{start:string;end:string};source:string;metric:string;points:Observation[];partial:boolean;grid:{latStep:number;lonStep:number;expected:number};alerts:{event:string;severity:string;headline:string}[];alertsSource:string;updatedAt:string};
function HeatMap({data,layer}:{data:LiveData;layer:"rain"|"temp"}){
 const node=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!node.current)return;let cancelled=false;let map:import("leaflet").Map|undefined;
 (async()=>{const L=await import("leaflet");if(cancelled||!node.current)return;
 map=L.map(node.current,{zoomControl:true,attributionControl:true}).setView(data.center,7);
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:18,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const values=data.points.map(p=>layer==="rain"?p.rainfallMm:p.meanTempC).filter((x):x is number=>x!==null);
 const min=Math.min(...values),max=Math.max(...values);
 const ramp=["#b45a3c","#e8ad49","#e7d86d","#9dcf94","#51a8a3","#3167a6"];
 data.points.forEach(p=>{
 const v=layer==="rain"?p.rainfallMm:p.meanTempC;
 if(v===null)return;
 const t=max===min?0.5:(v-min)/(max-min);
 const color=ramp[Math.min(ramp.length-1,Math.floor(t*ramp.length))];
 const latHalf=data.grid.latStep/2,lonHalf=data.grid.lonStep/2;
 L.rectangle([[p.lat-latHalf,p.lon-lonHalf],[p.lat+latHalf,p.lon+lonHalf]],{color:"#f7f7f5",weight:1,fillColor:color,fillOpacity:0.75}).addTo(map!).bindPopup("<strong>NASA POWER · datos históricos modelados</strong><br/>Precipitación acumulada: "+p.rainfallMm+" mm<br/>Temperatura media: "+(p.meanTempC??"s/d")+" °C<br/>Humedad media: "+(p.meanHumidityPct??"s/d")+" %<br/>Viento medio: "+(p.meanWindMs??"s/d")+" m/s<br/>Período: "+data.period.start+" a "+data.period.end);
 });
 map.fitBounds([[data.center[0]-0.85,data.center[1]-1.1],[data.center[0]+0.85,data.center[1]+1.1]],{padding:[15,15]});
 })().catch(()=>{});
 return()=>{cancelled=true;map?.remove()};},[data]);
 return <div ref={node} style={{height:500,width:"100%",borderRadius:12,overflow:"hidden",zIndex:0}} aria-label="Mapa de calor por celdas NASA POWER de precipitaciones observadas"/>;
}
export default function GeoMarketLaboratorio(){
 const [regionId,setRegionId]=useState("AR");
 const [filter,setFilter]=useState("Todos");
 const [radius,setRadius]=useState(50);
 const [watch,setWatch]=useState(false);
 const [view,setView]=useState<"panel"|"fuentes">("panel");
 const [mapLayer,setMapLayer]=useState<"rain"|"temp">("rain");
 const [live,setLive]=useState<LiveData|null>(null);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{const controller=new AbortController();
 fetch("/api/laboratorio/geomarket?country="+regionId,{signal:controller.signal}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error??"No disponible");return d as LiveData;}).then(setLive).catch(e=>{if(e.name!=="AbortError")setError(String(e.message))}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
 return()=>controller.abort();},[regionId]);
 const region=regions.find(r=>r.id===regionId)!;
 const visible=useMemo(()=>modules.filter(m=>filter==="Todos"||m.type===filter),[filter]);
 const panel:React.CSSProperties={background:"#f2f2f0",border:"1px solid #d8d8d5",borderRadius:16,padding:20};
 return <main style={{background:"#fafaf8",color:"#242424",minHeight:"100vh",fontFamily:"Arial,Helvetica,sans-serif",padding:"clamp(16px,4vw,48px)"}}>
 <div style={{maxWidth:1240,margin:"auto"}}>
 <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap",borderBottom:"2px solid #333",paddingBottom:16}}>
 <div><div style={{fontSize:13,letterSpacing:3,fontWeight:800}}>RC / RENTOCAMPO</div><h1 style={{fontSize:"clamp(34px,5vw,66px)",letterSpacing:"-.055em",margin:"8px 0"}}>GeoMarket <span style={{color:"#888"}}>Control</span></h1><p style={{margin:0,color:"#666"}}>INTELIGENCIA TERRITORIAL · LABORATORIO V2</p></div>
 <span style={{border:"1px solid #777",padding:"9px 14px",borderRadius:24,fontSize:12}}>LAB · DATOS REALES PARCIALES</span>
 </header>
 <p style={{fontSize:"clamp(18px,2.5vw,27px)",maxWidth:780,lineHeight:1.25,margin:"32px 0"}}>Tu territorio. Tus alertas. Tus oportunidades.<br/><strong>Un sistema de decisiones, no un informe.</strong></p>
 <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"end",marginBottom:22}}>
 <label style={{display:"grid",gap:7,fontSize:12,fontWeight:700}}>PAÍS / REGIÓN<select aria-label="Seleccionar país" value={regionId} onChange={e=>{setRegionId(e.target.value);setLoading(true);setError("");setLive(null)}} style={{padding:12,borderRadius:8,border:"1px solid #aaa",minWidth:220,background:"white"}}>{regions.map(r=><option key={r.id} value={r.id}>{r.country} · {r.label}</option>)}</select></label>
 <label style={{display:"grid",gap:7,fontSize:12,fontWeight:700}}>RADIO DE INTERÉS: {radius} KM<input aria-label="Radio de interés" type="range" min="10" max="200" step="10" value={radius} onChange={e=>setRadius(Number(e.target.value))}/></label>
 <button onClick={()=>setWatch(!watch)} style={{padding:"13px 18px",background:watch?"#555":"#222",color:"white",border:0,borderRadius:8,cursor:"pointer"}}>{watch?"✓ Zona guardada en esta vista":"＋ Seguir esta zona"}</button>
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:12}}>
 {[["LLUVIA HISTÓRICA",live?live.summary.meanMm+" mm":"—","Media espacial · NASA POWER"],["TEMPERATURA MEDIA",live?.summary.centralTempC!=null?live.summary.centralTempC+" °C":"—","Centro de región · NASA POWER"],["HUMEDAD RELATIVA",live?.summary.centralHumidityPct!=null?live.summary.centralHumidityPct+" %":"—","Centro de región · NASA POWER"],["VIENTO MEDIO",live?.summary.centralWindMs!=null?live.summary.centralWindMs+" m/s":"—","Centro de región · NASA POWER"]].map(([label,value,sub])=><div key={label} style={panel}><div style={{fontSize:11,fontWeight:700,letterSpacing:1,color:"#666"}}>{label}</div><div style={{fontSize:36,fontWeight:800,margin:"12px 0 4px"}}>{value}</div><div style={{fontSize:12,color:"#777"}}>{sub}</div></div>)}
 </div>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:16,marginTop:18}}>
 <section style={panel}><div style={{fontSize:12,letterSpacing:2}}>01 / RADAR TERRITORIAL</div><h2 style={{fontSize:26,margin:"12px 0"}}>{region.label}</h2><div style={{display:"flex",gap:8,marginBottom:10}}><button onClick={()=>setMapLayer("rain")} style={{background:mapLayer==="rain"?"#222":"white",color:mapLayer==="rain"?"white":"#222",padding:"8px 12px",borderRadius:7,border:"1px solid #999"}}>Lluvias</button><button onClick={()=>setMapLayer("temp")} style={{background:mapLayer==="temp"?"#222":"white",color:mapLayer==="temp"?"white":"#222",padding:"8px 12px",borderRadius:7,border:"1px solid #999"}}>Temperatura</button></div>{loading?<div style={{height:500,display:"grid",placeItems:"center"}}>Consultando NASA POWER…</div>:live?<HeatMap data={live} layer={mapLayer}/>:<div style={{height:330,display:"grid",placeItems:"center",padding:20,background:"#e6e6e3",borderRadius:12}}>Sin datos disponibles. {error}</div>}<p style={{color:"#555",fontSize:13}}><strong>Mapa real OpenStreetMap.</strong> Las celdas representan datos NASA POWER, no pronósticos. Rojo = menor valor, azul = mayor valor relativo a la región. Grilla orientativa de 0,5° × 0,625°; sin interpolación. Tocá cada celda para consultar el valor y la fecha.</p></section>
 <section style={panel}><div style={{fontSize:12,letterSpacing:2}}>02 / CENTRO DE ALERTAS</div><h2 style={{fontSize:26,margin:"12px 0"}}>Lo que importa hoy</h2><div style={{background:"white",padding:16,borderRadius:12,borderLeft:"4px solid #555",marginBottom:12}}><strong>◉ {regionId==="US"&&live?.alerts.length?live.alerts[0].event:"Seguimiento meteorológico"}</strong><p style={{fontSize:14,color:"#555"}}>{regionId==="US"&&live?.alerts.length?live.alerts[0].headline:"Consulta los acumulados históricos del mapa; no hay un pronóstico de lluvia conectado para esta región."}</p><small>{regionId==="US"&&live?.alerts.length?"AVISO OFICIAL NOAA NWS":"SIN ALERTA OFICIAL CONECTADA"}</small></div><div style={{background:"white",padding:16,borderRadius:12}}><strong>◎ Oportunidades: conector pendiente</strong><p style={{fontSize:14,color:"#555"}}>Cruzar campos, servicios y demanda en un radio de {radius} km.</p><small>REGLA SIMULADA · SIN CONSULTAS A PRODUCCIÓN</small></div><p style={{fontSize:12,color:"#666"}}>Las alertas reales requerirán fuente, fecha, umbral, precisión y permiso del usuario.</p></section>
 </div>
 {live&&<section style={{...panel,marginTop:18}}><div style={{fontSize:12,letterSpacing:2}}>03 / ANÁLISIS DE DATOS REALES</div><h2 style={{fontSize:26,margin:"12px 0"}}>Lluvias día por día · NASA POWER</h2><p style={{fontSize:13,color:"#666"}}>Serie histórica del centro de {region.label} · {live.period.start} al {live.period.end} · {live.summary.sampleCount}/{live.grid.expected} celdas disponibles {live.partial?"· cobertura parcial":""}</p><div style={{display:"flex",gap:5,height:150,alignItems:"end",borderBottom:"1px solid #aaa",paddingTop:12}}>{live.summary.centralDailyRain.map((d,i)=>{const maximum=Math.max(1,...live.summary.centralDailyRain.map(x=>x.mm));return <div key={d.date} title={d.date+" · "+d.mm+" mm"} style={{flex:1,minWidth:6,height:Math.max(3,d.mm/maximum*125),background:i%2===0?"#477e91":"#8db8b1",borderRadius:"3px 3px 0 0"}}/>})}</div><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666",marginTop:8}}><span>{live.period.start}</span><span>{live.period.end}</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginTop:18}}>{[["MÍNIMO REGIONAL",live.summary.minimumMm+" mm"],["MÁXIMO REGIONAL",live.summary.maximumMm+" mm"],["MUESTRAS VÁLIDAS",String(live.summary.sampleCount)],["ORIGEN","NASA POWER"]].map(([k,v])=><div key={k} style={{background:"white",padding:14,borderRadius:10}}><div style={{fontSize:11,color:"#777"}}>{k}</div><strong style={{fontSize:20}}>{v}</strong></div>)}</div><p style={{fontSize:12,color:"#777",marginTop:12}}>Datos históricos, no observaciones de estación local ni predicciones. Fecha de consulta: {new Date(live.updatedAt).toLocaleString("es-AR")}.</p></section>}
 <section style={{marginTop:28}}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",alignItems:"center",gap:12}}><h2 style={{fontSize:30,letterSpacing:"-.04em"}}>Soluciones que construimos</h2><div style={{display:"flex",gap:8}}><button onClick={()=>setView("panel")} style={{padding:10,border:"1px solid #aaa",background:view==="panel"?"#333":"white",color:view==="panel"?"white":"#333",borderRadius:8}}>Módulos</button><button onClick={()=>setView("fuentes")} style={{padding:10,border:"1px solid #aaa",background:view==="fuentes"?"#333":"white",color:view==="fuentes"?"white":"#333",borderRadius:8}}>Fuentes y costos</button></div></div>
 {view==="panel"?<><div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>{["Todos","Clima","Territorio","Mercado","Operación"].map(x=><button key={x} onClick={()=>setFilter(x)} style={{border:"1px solid #aaa",borderRadius:30,padding:"9px 16px",background:filter===x?"#222":"white",color:filter===x?"white":"#333",cursor:"pointer"}}>{x}</button>)}</div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(245px,1fr))",gap:12}}>{visible.map((m,i)=><article key={m.name} style={panel}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#666"}}><span>{String(i+1).padStart(2,"0")} / {m.type.toUpperCase()}</span><span>{m.phase}</span></div><h3 style={{fontSize:21,marginBottom:8}}>{m.name}</h3><p style={{minHeight:48,fontSize:14}}>{m.description}</p><small style={{color:"#666"}}>FUENTE: {m.source}</small></article>)}</div></>:<div style={panel}><h3>Modelo de fuentes abiertas</h3><p>NASA POWER: históricos y climatología. NOAA NWS: pronósticos y avisos oficiales de EE. UU. Copernicus: imágenes y vegetación. OSM: vías e infraestructura. Datos internos: oferta, demanda y coincidencias.</p><p><strong>Licencias de datos objetivo: USD 0.</strong> No se garantiza costo operativo cero: procesamiento, Vercel, Supabase, mapas y envío de notificaciones pueden generar cargos. Verificar términos y cuotas antes de activar cada conector.</p><p><a href="https://power.larc.nasa.gov/docs/" target="_blank" rel="noreferrer">NASA POWER</a> · <a href="https://www.weather.gov/documentation/services-web-api" target="_blank" rel="noreferrer">NOAA NWS</a> · <a href="https://dataspace.copernicus.eu/" target="_blank" rel="noreferrer">Copernicus</a></p></div>}
 </section>
 <footer style={{borderTop:"1px solid #ccc",marginTop:40,paddingTop:20,color:"#666",fontSize:12}}><strong>Laboratorio privado de desarrollo — no apto para decisiones agronómicas.</strong> Este laboratorio consulta datos históricos NASA POWER y alertas NOAA (solo EE. UU.), sin enviar notificaciones ni guardar datos de usuario. El mapa utiliza OpenStreetMap. No modifica el marketplace. <Link href="/" style={{marginLeft:12}}>Volver a RentoCampo</Link></footer>
 </div></main>
}
