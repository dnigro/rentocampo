import { createClient } from "@/lib/supabase/server";
import CampoMapa from "@/components/campos/CampoMapa";
import { SERVICIOS_RURALES } from "@/data/servicios-rurales";
import type { ServicioRural } from "@/types";
import type { Metadata } from "next";
import "@/styles/mapa.css";

export const metadata: Metadata = {
  title: "Mapa de campos y servicios rurales | RentoCampo",
  description:
    "Explorá campos disponibles, zonas con demanda y prestadores de servicios rurales en el mapa de RentoCampo.",
  alternates: { canonical: "https://rentocampo.com/campos/mapa" },
  robots: { index: true, follow: true },
};

export default async function MapaPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string; servicio?: string }>;
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
      "id, titulo, provincia, localidad, latitud, longitud, hectareas, aptitud, precio, moneda",
    )
    .eq("status", "activo")
    .not("latitud", "is", null)
    .not("longitud", "is", null);

  const { data: prestadores } = await supabase
    .from("profiles")
    .select(
      "id, nombre, bio, avatar_url, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio",
    )
    .contains("roles", ["prestador"])
    .not("provincia_servicio", "is", null);

  return (
    <div className="mapa-page">
      <CampoMapa
        campos={campos ?? []}
        prestadores={prestadores ?? []}
        currentUserId={user?.id}
        initialVista={vista === "servicios" ? "servicios" : "tierra"}
        initialServicio={servicioInicial}
      />
    </div>
  );
}
