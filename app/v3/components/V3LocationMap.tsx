"use client";
import { useMemo } from "react";
import V3Map from "./V3Map";
import type { CountryCode } from "@/data/countries";
import type { V3Campo } from "./V3Explorer";
import "leaflet/dist/leaflet.css";
const noop = () => {};
export default function V3LocationMap({ lat, lng, country, title }: { lat: number; lng: number; country: CountryCode; title: string }) {
 const campos = useMemo<V3Campo[]>(() => [{id:"detail-location",titulo:title,localidad:null,provincia:null,hectareas:null,aptitud:null,operacion:null,precio:null,moneda:null,foto:null,lat,lng}], [lat,lng,title]);
 return <div className="v3-detail-map"><V3Map campos={campos} country={country} selectedId={null} onSelect={noop} onViewportChange={noop}/></div>;
}
