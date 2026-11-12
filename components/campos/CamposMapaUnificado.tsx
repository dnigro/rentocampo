"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { COUNTRIES, type CountryCode } from "@/data/countries";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
type CampoPin={id:string;titulo:string;provincia:string;localidad?:string|null;latitud?:number|string|null;longitud?:number|string|null;hectareas?:number|null;precio?:number|null;moneda?:string|null;fotos?:Array<{url:string;orden?:number|null}>};
export default function CamposMapaUnificado({campos,pais}:{campos:CampoPin[];pais:CountryCode}){
 const element=useRef<HTMLDivElement>(null);
 const map=useRef<import("leaflet").Map|null>(null);
 const markers=useRef<Map<string,import("leaflet").CircleMarker>>(new Map());
 const [selected,setSelected]=useState<CampoPin|null>(null);
 useEffect(()=>{let cancelled=false;let instance:import("leaflet").Map|null=null;
 void import("leaflet").then(L=>{if(cancelled||!element.current)return;
 const country=COUNTRIES[pais];
 instance=L.map(element.current,{zoomControl:false}).setView([...country.mapCenter] as [number,number],country.mapZoom);
 map.current=instance;
 L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'&copy; OpenStreetMap contributors',maxZoom:19}).addTo(instance);
 L.control.zoom({position:"topright"}).addTo(instance);
 for(const campo of campos){const lat=normalizarCoordenada(campo.latitud),lng=normalizarCoordenada(campo.longitud);
 if(lat===null||lng===null||Math.abs(lat)>90||Math.abs(lng)>180)continue;
 const marker=L.circleMarker([lat,lng],{radius:10,color:"#fff",weight:3,fillColor:"#073b77",fillOpacity:1}).addTo(instance);
 marker.bindTooltip(campo.titulo);marker.on("click",()=>setSelected(campo));markers.current.set(campo.id,marker);
 }
 }).catch(()=>{});
 return()=>{cancelled=true;instance?.remove();map.current=null;markers.current.clear()};
 },[campos,pais]);
 useEffect(()=>{const fn=(e:Event)=>{const id=(e as CustomEvent<string>).detail;const campo=campos.find(c=>c.id===id);if(!campo)return;setSelected(campo);
 const lat=normalizarCoordenada(campo.latitud),lng=normalizarCoordenada(campo.longitud);
 if(lat!==null&&lng!==null)map.current?.flyTo([lat,lng],Math.max(map.current.getZoom(),9));};
 window.addEventListener("rc-campo-select",fn);return()=>window.removeEventListener("rc-campo-select",fn);
 },[campos]);
 const photo=selected?.fotos?.slice().sort((a,b)=>(a.orden??0)-(b.orden??0))[0]?.url;
 return <div className="rc-v2-map-inner"><div ref={element} className="rc-v2-map-canvas" aria-label="Mapa de campos disponibles"/>{selected&&<div className="rc-v2-map-popup"><button type="button" onClick={()=>setSelected(null)} aria-label="Cerrar" className="rc-v2-close">×</button>{photo&&<img src={photo} alt="" className="rc-v2-popup-img"/>}<div><strong>{selected.titulo}</strong><p>{[selected.localidad,selected.provincia].filter(Boolean).join(", ")}</p><p>{selected.hectareas} ha · {selected.precio?selected.moneda+" "+Number(selected.precio).toLocaleString("es-AR"):"Consultar precio"}</p><Link href={`/campos/${selected.id}`}>Ver detalles →</Link></div></div>}</div>;
}