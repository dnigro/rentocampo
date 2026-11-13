import "server-only";
import { isDemoField } from "./demo-listings";
import { loadServiceDemos } from "./load-service-demos";
import { createClient } from "@/lib/supabase/server";
import type { CountryCode } from "@/data/countries";
import { tituloServicioRural } from "@/data/servicios-rurales";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
import type { ServicioRural } from "@/types";
import type { RuralListing } from "./types";
const HOME_LISTING_LIMIT = 120;
function coordinate(value: number | string | null, maximum: number) {
    const number = normalizarCoordenada(value);
    return number != null && Math.abs(number) <= maximum ? number : null;
}
/** Read public listings independently, so an unavailable catalog does not hide the other. */
export async function loadHomeListings(country: CountryCode) {
    const listings: RuralListing[] = [];
    const errors: string[] = [];
    let capped = false;
    try {
        const client = await createClient();
        const results = await Promise.allSettled([
            client.from("campos").select("id,titulo,localidad,provincia,hectareas,aptitud,operacion,precio,moneda,latitud,longitud,fotos:campos_fotos(url,orden)").eq("status", "activo").eq("country_code", country).order("created_at", { ascending: false }).limit(HOME_LISTING_LIMIT),
            client.from("servicios_publicaciones").select("id,nombre_comercial,localidad,provincia,foto_url,servicios_rurales,zona,latitud,longitud").eq("activo", true).eq("country_code", country).order("created_at", { ascending: false }).limit(HOME_LISTING_LIMIT),
        ]);
        const fields = results[0];
        if (fields.status === "rejected" || fields.value.error)
            errors.push("campo");
        else {
            capped ||= (fields.value.data || []).length === HOME_LISTING_LIMIT;
            for (const item of fields.value.data || []) {
                const photos = [...(item.fotos || [])].filter(photo => photo.url).sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)).slice(0, 8).map(photo => photo.url);
                listings.push({ id: `campo-${item.id}`, sourceId: item.id, kind: "campo", demo: isDemoField(item.id,item.titulo), titulo: item.titulo, localidad: item.localidad, provincia: item.provincia, hectareas: item.hectareas == null ? null : Number(item.hectareas), aptitud: item.aptitud, operacion: item.operacion, precio: item.precio == null ? null : Number(item.precio), moneda: item.moneda, foto: photos[0] || null, fotos: photos, lat: coordinate(item.latitud, 90), lng: coordinate(item.longitud, 180), services: [], coverage: null });
            }
        }
        const services = results[1];
        if (services.status === "rejected" || services.value.error)
            errors.push("servicio");
        else {
            capped ||= (services.value.data || []).length === HOME_LISTING_LIMIT;
            for (const item of services.value.data || []) {
                if (/^(10000000|20000000)-/.test(item.id) || /\bDEMO\b/i.test(item.nombre_comercial || ""))
                    continue;
                listings.push({ id: `servicio-${item.id}`, sourceId: item.id, kind: "servicio", titulo: tituloServicioRural(item.servicios_rurales as ServicioRural[], country, item.nombre_comercial), localidad: item.localidad, provincia: item.provincia, hectareas: null, aptitud: null, operacion: null, precio: null, moneda: null, foto: item.foto_url, fotos: item.foto_url ? [item.foto_url] : [], lat: coordinate(item.latitud, 90), lng: coordinate(item.longitud, 180), services: (item.servicios_rurales || []) as ServicioRural[], coverage: item.zona });
            }
        }
    }
    catch {
        errors.push("campo", "servicio");
    }
    try { listings.push(...await loadServiceDemos(country)); } catch { if(!errors.includes("servicio")) errors.push("servicio"); }
    listings.sort((a,b)=>Number(Boolean(a.demo))-Number(Boolean(b.demo)));
    // Alternate types to make both discoverable; neither receives paid or invented ranking.
    const fields = listings.filter(item => item.kind === "campo"), services = listings.filter(item => item.kind === "servicio");
    const mixed: RuralListing[] = [];
    for (let i = 0; i < Math.max(fields.length, services.length); i++) {
        if (fields[i])
            mixed.push(fields[i]);
        if (services[i])
            mixed.push(services[i]);
    }
    return { listings: mixed, errors, capped };
}
