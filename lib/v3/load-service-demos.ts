import "server-only";
import { demoServicePhoto } from "./demo-media";
import { createClient } from "@/lib/supabase/server";
import { esServicioDemoVisible } from "@/data/visible-demo-services";
import { tituloServicioRural } from "@/data/servicios-rurales";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
import type { CountryCode } from "@/data/countries";
import type { ServicioRural } from "@/types";
import type { RuralListing } from "./types";

/** Read the existing approved fixtures; never manufacture providers or contactable offers. */
export async function loadServiceDemos(country: CountryCode, province?: string, specialty?: string): Promise<RuralListing[]> {
  const client = await createClient();
  let query = client.from("demo_servicios_rurales")
    .select("id,nombre,servicios_rurales,zona_servicio,provincia_servicio,localidad_servicio,latitud,longitud,imagen_url")
    .eq("activo",true).eq("country_code",country).limit(120);
  if(province?.trim()) query=query.eq("provincia_servicio",province.trim());
  if(specialty) query=query.contains("servicios_rurales",[specialty]);
  const {data,error}=await query;
  if(error) throw new Error("Service reference catalog unavailable");
  return (data || []).filter(item=>esServicioDemoVisible(item.id)).map(item=>{
    const lat=normalizarCoordenada(item.latitud),lng=normalizarCoordenada(item.longitud);
    const photo=item.imagen_url || demoServicePhoto(item.servicios_rurales || []);
    return {id:`servicio-demo-${item.id}`,sourceId:item.id,kind:"servicio",demo:true,
      titulo:tituloServicioRural(item.servicios_rurales as ServicioRural[],country),
      localidad:item.localidad_servicio,provincia:item.provincia_servicio,coverage:item.zona_servicio,
      services:(item.servicios_rurales || []) as ServicioRural[],fotos:[photo],foto:photo,
      lat:lat!=null&&Math.abs(lat)<=90?lat:null,lng:lng!=null&&Math.abs(lng)<=180?lng:null,
      hectareas:null,aptitud:null,operacion:null,precio:null,moneda:null};
  });
}
