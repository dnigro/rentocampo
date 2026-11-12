import { createClient } from "@/lib/supabase/server";
import CampoMapa from "@/components/campos/CampoMapa";
import { SERVICIOS_RURALES, tituloServicioRural } from "@/data/servicios-rurales";
import { campoFilterParams } from "@/lib/campos/filter-params";
import type { CamposSearchParams } from "@/components/campos/CamposListing";
import { resolveCountry, type CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import type { ServicioRural } from "@/types";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import "@/styles/mapa.css";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";
import { esServicioDemoVisible } from "@/data/visible-demo-services";

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
  const selectedCountry: CountryCode = resolveCountry(pais, storedCountry);
  const tt=(es:string,pt:string)=>regionalText(selectedCountry,es,pt);
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
    .select("id, propietario_id, servicios_rurales, nombre_comercial, foto_url, provincia, localidad, zona, activo, country_code, latitud, longitud")
    .eq("activo", true)
    .eq("country_code", selectedCountry);

  const { data: serviciosDemo } = await supabase
    .from("demo_servicios_rurales")
    .select(
      "id, nombre, country_code, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, latitud, longitud, imagen_url",
    )
    .eq("activo", true)
    .eq("country_code", selectedCountry);

  const prestadoresMapa = [
    ...(publicacionesServicios ?? []).map((publicacion) => ({
      id: publicacion.propietario_id,
      publicacion_id: publicacion.id,
      titulo: tituloServicioRural(publicacion.servicios_rurales, selectedCountry, publicacion.nombre_comercial),
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
      .filter((prestador) => esServicioDemoVisible(String(prestador.id)))
      .map((prestador) => ({
        ...prestador,
        titulo: tituloServicioRural(prestador.servicios_rurales, selectedCountry),
        avatar_url: undefined,
        service_photo_url: prestador.imagen_url || "/demo-servicio-veterinaria.jpg",
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
      <section className="rc-map-hero" aria-label="RentoCampo, todo el campo sin vueltas">
        <div className="rc-map-hero__copy">
          <h2><span>{tt("Todo el campo,","Todo o campo,")}</span> <em>{tt("sin vueltas.","sem complicações.")}</em></h2>
          <div className="rc-map-hero__details">
            <p>{tt("Campos, productores y servicios rurales. Conexión directa.","Terras, produtores e serviços rurais. Conexão direta.")}</p>
            <div className="rc-map-hero__features"><span>◇ {tt("COSTO 0","CUSTO 0")}</span><span>♧ {tt("MAPA","MAPA")}</span><span>▢ CHAT ONLINE</span></div>
          </div>
          <div className="rc-map-hero__actions"><Link href="/register">{tt("REGISTRATE GRATIS","CADASTRE-SE GRÁTIS")}</Link><a href="#explorador-mapa">{tt("EXPLORAR MAPA ↗","EXPLORAR MAPA ↗")}</a></div>
        </div>
        <div className="rc-map-hero__photo" aria-hidden="true" />
      </section>
      <div id="explorador-mapa" className="rc-map-anchor" />
      <CampoMapa
        key={selectedCountry}
        campos={camposMapa}
        prestadores={prestadoresMapa}
        camposListHref={`/campos?${listaCamposParams}`}
        serviciosListHref={`/servicios-rurales?${listaServiciosParams}`}
        currentUserId={user?.id}
        initialVista={vista === "servicios" ? "servicios" : "tierra"}
        initialServicio={servicioInicial}
        initialCountry={selectedCountry}
      />
    </div>
  );
}
