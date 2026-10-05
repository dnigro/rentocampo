import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CampoMapa from "@/components/campos/CampoMapa";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import type { Metadata } from "next";
import "@/styles/mapa.css";
import { seleccionarCamposPublicos } from "@/lib/campos/visible-fields";

const DEMO_SERVICIO_VISIBLE_IDS = new Set<string>([
  "10000000-0000-4000-8000-000000000005",
  "10000000-0000-4000-8000-000000000010",
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
  searchParams: Promise<{ vista?: string; servicio?: string; pais?: string }>;
}) {
  const { vista, servicio } = await searchParams;
  const servicioInicial = SERVICIOS_RURALES.some(
    (item) => item.value === servicio,
  )
    ? (servicio as ServicioRural)
    : undefined;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: campos } = await supabase
    .from("campos")
    .select(
      "id, titulo, country_code, provincia, localidad, latitud, longitud, hectareas, aptitud, precio, moneda, created_at, fotos:campos_fotos(id, url, orden, storage_path)",
    )
    .eq("status", "activo")
    .or("country_code.eq.AR,country_code.is.null");

  const { data: prestadores } = await supabase
    .from("profiles")
    .select(
      "id, nombre, country_code, bio, avatar_url, service_photo_url, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio",
    )
    .contains("roles", ["prestador"])
    .not("provincia_servicio", "is", null);

  const { data: serviciosDemo } = await supabase
    .from("demo_servicios_rurales")
    .select(
      "id, nombre, country_code, bio, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio, latitud, longitud",
    )
    .eq("activo", true);

  const prestadoresMapa = [
    ...(prestadores ?? []).map((prestador) => ({
      ...prestador,
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
  ];

  const camposMapa = seleccionarCamposPublicos(campos ?? []);

  return (
    <div className="mapa-page">
      <nav className="mapa-listas-nav" aria-label="Volver a los listados">
        <Link href="/campos" className="mapa-lista-link">← Lista de campos</Link>
        <Link href="/servicios-rurales" className="mapa-lista-link">← Lista de servicios</Link>
      </nav>
      <CampoMapa
        campos={camposMapa}
        prestadores={prestadoresMapa}
        currentUserId={user?.id}
        initialVista={vista === "servicios" ? "servicios" : "tierra"}
        initialServicio={servicioInicial}
        initialCountry="AR"
      />
    </div>
  );
}
