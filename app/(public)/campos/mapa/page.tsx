import { createClient } from "@/lib/supabase/server";
import CampoMapa from "@/components/campos/CampoMapa";
import "@/styles/mapa.css";

export default async function MapaPage() {
  const supabase = await createClient();

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
    .select("id, nombre, bio, avatar_url, servicios_rurales, zona_servicio, provincia_servicio, localidad_servicio")
    .contains("roles", ["prestador"])
    .not("provincia_servicio", "is", null);

  return (
    <div className="mapa-page">
      <CampoMapa campos={campos ?? []} prestadores={prestadores ?? []} />
    </div>
  );
}
