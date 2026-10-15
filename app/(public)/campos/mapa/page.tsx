import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CampoMapa from "@/components/campos/CampoMapa";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import { campoFilterParams } from "@/lib/campos/filter-params";
import type { CamposSearchParams } from "@/components/campos/CamposListing";
import type { CountryCode } from "@/data/countries";
import type { ServicioRural } from "@/types";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@/styles/mapa.css";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";

const DEMO_SERVICIO_VISIBLE_IDS = new Set<string>([
  "10000000-0000-4000-8000-000000000005",
  "10000000-0000-4000-8000-000000000010",
  "10000000-0000-4000-8000-000000000011",
  "10000000-0000-4000-8000-000000000012",
]);

export const metadata: Metadata = {
  title: "Mapa de campos y servicios rurales | RentoCampo",
  description:
    "Explorá campos disponibles y prestadores de servicios rurales en el mapa de RentoCampo.",
  alternates: { canonical: "https://rentocampo.com/campos/mapa" },
  robots: { index: true, follow: true },
};

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<CamposSearchParams & { vista?: string; servicio?: string }>;
}) {
  const params = await searchParams;
  const { vista, servicio, pais } = params;
  const storedCountry = (await cookies()).get("rentocampo_country")?.value;
  const selected = pais ?? storedCountry;
  const selectedCountry: CountryCode = selected === "UY" || selected === "PY" ? selected : "AR";
  const servicioInicial = SERVICIOS_RURALES.some(
    (item) => item.value === servicio,
  )
    ? (servicio as ServicioRural)
    : undefined;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let camposQuery = supabase
    .from("campos")
    .select(
      "id, titulo, country_code, provincia, localidad, latitud, longitud, hectareas, aptitud, operacion, precio, moneda, created_at, fotos:campos_fotos(id, url, orden, storage_path)",
    )
    .eq("status", "activo")
    .eq("country_code", selectedCountry);
  if (params.provincia) camposQuery = camposQuery.eq("provincia", params.provincia);
  if (params.aptitud) camposQuery = camposQuery.eq("aptitud", params.aptitud);
  if (params.operacion === "alquiler_o_ambas") camposQuery = camposQuery.in("operacion", ["alquiler", "ambas"]);
  else if (["alquiler", "venta", "ambas"].includes(params.operacion ?? "")) camposQuery = camposQuery.eq("operacion", params.operacion!);
  if (params.hectareas_min) camposQuery = camposQuery.gte("hectareas", Number(params.hectareas_min));
  if (params.hectareas_max) camposQuery = camposQuery.lte("hectareas", Number(params.hectareas_max));
  if (params.precio_min) camposQuery = camposQuery.gte("precio", Number(params.precio_min));
  if (params.precio_max) camposQuery = camposQuery.lte("precio", Number(params.precio_max));
  const today = new Date().toISOString().slice(0, 10);
  if (params.disponibilidad === "inmediata") camposQuery = camposQuery.or(`disponibilidad_desde.is.null,disponibilidad_desde.lte.${today}`);
  if (params.disponibilidad === "campaña_próxima") camposQuery = camposQuery.gt("disponibilidad_desde", today);
  const { data: campos } = await camposQuery;


  const { data: publicacionesServicios } = await supabase
    .from("servicios_publicaciones")
    .select("id, propietario_id, servicios_rurales, foto_url, provincia, localidad, zona, activo, country_code, latitud, longitud")
    .eq("activo", true)
    .eq("country_code", selectedCountry);

  const ownerIds = [...new Set((publicacionesServicios ?? []).map((p) => p.propietario_id))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, nombre").in("id", ownerIds)
    : { data: [] as { id: string; nombre: string }[] };
  const ownerMap = new Map((owners ?? []).map((o) => [o.id, o.nombre]));

  const { data: serviciosDemo } = await supabase
    .from("demo_servicios_rurales")
    .select(
      "id, nombre, country_code, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, latitud, longitud",
    )
    .eq("activo", true);

  const prestadoresMapa = [
    ...(publicacionesServicios ?? []).map((publicacion) => ({
      id: publicacion.propietario_id,
      publicacion_id: publicacion.id,
      nombre: ownerMap.get(publicacion.propietario_id) ?? "Prestador rural",
      country_code: publicacion.country_code as CountryCode,
      bio: undefined,
      avatar_url: undefined,
      service_photo_url: publicacion.foto_url,
      servicios_rurales: publicacion.servicios_rurales ?? [],
      zona_servicio: publicacion.zona,
      provincia_servicio: publicacion.provincia,
      localidad_servicio: publicacion.localidad,
      latitud: publicacion.latitud ?? undefined,
      longitud: publicacion.longitud ?? undefined,
      is_demo: false,
    })),
    ...(serviciosDemo ?? [])
      .filter((prestador) => DEMO_SERVICIO_VISIBLE_IDS.has(String(prestador.id)))
      .map((prestador) => ({
        ...prestador,
        avatar_url: undefined,
        service_photo_url: "/demo-servicio-veterinaria.jpg",
        is_demo: true,
      })),
  ].filter((p) => (!params.provincia || p.provincia_servicio === params.provincia) && (!servicioInicial || p.servicios_rurales.includes(servicioInicial)));

  const listaCamposParams = campoFilterParams({ ...params, pais: selectedCountry });
  if (params.operacion === "alquiler_o_ambas") listaCamposParams.delete("operacion");
  const listaServiciosParams = new URLSearchParams({ pais: selectedCountry });
  if (params.provincia) listaServiciosParams.set("provincia", params.provincia);
  if (servicioInicial) listaServiciosParams.set("servicio", servicioInicial);
  const camposMapa = seleccionarCamposPublicos(campos ?? []);

  return (
    <div className="mapa-page">
      <nav className="mapa-listas-nav" aria-label="Volver a los listados">
        <Link href={`/campos?${listaCamposParams}`} className="mapa-lista-link">← Lista de campos</Link>
        <Link href={`/servicios-rurales?${listaServiciosParams}`} className="mapa-lista-link">← Lista de servicios</Link>
      </nav>
      <CampoMapa
        campos={camposMapa}
        prestadores={prestadoresMapa}
        currentUserId={user?.id}
        initialVista={vista === "servicios" ? "servicios" : "tierra"}
        initialServicio={servicioInicial}
        initialCountry={selectedCountry}
      />
    </div>
  );
}
