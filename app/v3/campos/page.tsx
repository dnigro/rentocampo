import type { Metadata } from "next";
import CamposListing, { type CamposSearchParams } from "@/components/campos/CamposListing";
import Link from "next/link";
import { MapPinned, SlidersHorizontal } from "lucide-react";
import "@/styles/campos.css";
import "@/styles/explorador.css";
export const metadata: Metadata={title:"Explorar campos | RentoCampo V3",robots:{index:false,follow:false}};
export default async function V3Campos({searchParams}:{searchParams:Promise<CamposSearchParams>}){const params=await searchParams;return <div className="v3-catalog"><div className="v3-catalog-heading"><div><span className="v3-kicker">EXPLORADOR RURAL</span><h1>Campos disponibles</h1><p>Explorá oportunidades rurales. Contacto directo, sin vueltas.</p></div><Link href="/campos/mapa" className="v3-map-link"><MapPinned size={18}/> Ver mapa</Link></div><div className="v3-catalog-chips"><Link href="/v3/campos">Todos</Link><Link href="/v3/campos?operacion=alquiler">En alquiler</Link><Link href="/v3/campos?operacion=venta">En venta</Link><Link href="/v3/campos?aptitud=agricola">Agrícolas</Link><Link href="/v3/campos?aptitud=ganadera">Ganaderos</Link><span><SlidersHorizontal size={16}/> Filtros disponibles abajo</span></div><CamposListing params={params}/></div>}
