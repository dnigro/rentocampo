import Image from "next/image";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { tituloServicioRural } from "@/data/servicios-rurales";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
import { parseMapBounds } from "@/lib/campos/map-search";
import type { ServicioRural } from "@/types";
import V3UnifiedExplorer, { type HomeFilters, type RuralListing } from "./components/V3UnifiedExplorer";
import { Search, SlidersHorizontal, MessageCircle, ArrowDown } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "./home.css";

export default async function HomeV3({ searchParams }: { searchParams?: Promise<HomeFilters> } = {}) {
 const params = await searchParams || {};
 const country = resolveCountry(params.pais,(await cookies()).get("rentocampo_country")?.value);
 const t = (es:string,pt:string,en:string) => country === "BR" ? pt : country === "US" ? en : es;
 const listings: RuralListing[] = [];
 const errors: string[] = [];
 let capped = false;
 const coordinate = (value: number | string | null, max: number) => {const n=normalizarCoordenada(value);return n != null && Math.abs(n)<=max ? n : null;};
 try {
  const client=await createClient();
  const results=await Promise.allSettled([
   client.from("campos").select("id,titulo,localidad,provincia,hectareas,aptitud,operacion,precio,moneda,latitud,longitud,fotos:campos_fotos(url,orden)").eq("status","activo").eq("country_code",country).order("created_at",{ascending:false}).limit(120),
   client.from("servicios_publicaciones").select("id,nombre_comercial,localidad,provincia,foto_url,servicios_rurales,zona,latitud,longitud").eq("activo",true).eq("country_code",country).order("created_at",{ascending:false}).limit(120),
  ]);
  const fields=results[0];
  if(fields.status === "rejected" || fields.value.error) errors.push("campo");
  else {
   capped ||= fields.value.data.length===120;
   for(const item of fields.value.data){
    if(item.id.startsWith("20000000-") || /DEMO/i.test(item.titulo || ""))continue;
    const photos=[...(item.fotos || [])].filter(photo=>photo.url).sort((a,b)=>(a.orden??0)-(b.orden??0)).slice(0,8).map(photo=>photo.url);
    listings.push({id:`campo-${item.id}`,sourceId:item.id,kind:"campo",titulo:item.titulo,localidad:item.localidad,provincia:item.provincia,hectareas:item.hectareas == null ? null : Number(item.hectareas),aptitud:item.aptitud,operacion:item.operacion,precio:item.precio == null ? null : Number(item.precio),moneda:item.moneda,foto:photos[0] || null,fotos:photos,lat:coordinate(item.latitud,90),lng:coordinate(item.longitud,180),services:[],coverage:null});
   }
  }
  const services=results[1];
  if(services.status === "rejected" || services.value.error)errors.push("servicio");
  else {
   capped ||= services.value.data.length===120;
   for(const item of services.value.data){
    if(/^(10000000|20000000)-/.test(item.id) || /\bDEMO\b/i.test(item.nombre_comercial || ""))continue;
    listings.push({id:`servicio-${item.id}`,sourceId:item.id,kind:"servicio",titulo:tituloServicioRural(item.servicios_rurales as ServicioRural[],country,item.nombre_comercial),localidad:item.localidad,provincia:item.provincia,hectareas:null,aptitud:null,operacion:null,precio:null,moneda:null,foto:item.foto_url,fotos:item.foto_url?[item.foto_url]:[],lat:coordinate(item.latitud,90),lng:coordinate(item.longitud,180),services:(item.servicios_rurales || []) as ServicioRural[],coverage:item.zona});
   }
  }
 }catch { errors.push("campo","servicio"); }
 // Alternate types to make both discoverable; neither receives paid or invented ranking.
 const fields=listings.filter(item=>item.kind==="campo"), services=listings.filter(item=>item.kind==="servicio");
 const mixed: RuralListing[]=[];
 for(let i=0;i<Math.max(fields.length,services.length);i++){if(fields[i])mixed.push(fields[i]);if(services[i])mixed.push(services[i]);}
 return <div className="v3-home rural-white-home">
  <section className="rural-hero" aria-labelledby="v3-home-title"><div className="rural-hero-copy"><span className="v3-kicker">{t("TIERRA. PERSONAS. OPORTUNIDADES.","TERRA. PESSOAS. OPORTUNIDADES.","LAND. PEOPLE. OPPORTUNITIES.")}</span><h1 id="v3-home-title">{t("Todo el campo.","Todo o campo.","All the countryside.")}<br/>{t("En un lugar.","Em um só lugar.","In one place.")}</h1><p>{t("Encontrá campos y servicios rurales. Elegí tu zona y conectá con tu próxima oportunidad.","Encontre terras e serviços rurais. Escolha sua região e conecte-se à sua próxima oportunidade.","Find farmland and rural services. Choose your area and connect with your next opportunity.")}</p><span className="rural-direct">{t("Contacto directo · Sin intermediarios · Sin comisiones","Contato direto · Sem intermediários · Sem comissões","Direct contact · No intermediaries · No commissions")}</span><a href="#explorar" className="rural-hero-link">{t("Explorá tu zona","Explore sua região","Explore your area")} <ArrowDown size={17}/></a></div><div className="rural-hero-image"><Image src="/image_vaca_pix.png" alt={t("Ganado en el campo","Gado no campo","Cattle in the countryside")} fill priority sizes="(max-width:700px) 90vw,45vw"/></div></section>
  <V3UnifiedExplorer key={JSON.stringify(params)} listings={mixed} country={country} filter={params} errors={errors} capped={capped} initialBounds={parseMapBounds(params)}/>
  <section className="v3-home-how" id="como-funciona"><h2>{t("Del mapa al contacto directo.","Do mapa ao contato direto.","From map to direct contact.")}</h2><ol>{[
   {Icon:Search,title:t("Elegí tu zona","Escolha sua região","Choose your area"),text:t("Buscá campos y prestadores en un mismo lugar.","Busque terras e prestadores no mesmo lugar.","Find farmland and providers in one place.")},
   {Icon:SlidersHorizontal,title:t("Compará las fichas","Compare os anúncios","Compare listings"),text:t("Revisá fotos, características y cobertura declarada.","Confira fotos, características e área de atendimento.","Review photos, features and declared coverage.")},
   {Icon:MessageCircle,title:t("Conectá directo","Conecte-se diretamente","Connect directly"),text:t("Acordá condiciones con quien publica.","Combine condições com o anunciante.","Agree on terms with the advertiser.")},
  ].map(({Icon,title,text})=><li key={title}><Icon size={23}/><h3>{title}</h3><p>{text}</p></li>)}</ol></section>
 </div>;
}
