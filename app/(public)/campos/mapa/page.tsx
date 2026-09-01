import { createClient } from "@/lib/supabase/server";
import CampoMapa from "@/components/campos/CampoMapa";
import "@/styles/mapa.css";

export default async function MapaPage() {
  const supabase = await createClient();

  const { data: campos } = await supabase
    .from("campos")
    .select(
      "id, titulo, provincia, localidad, lat, lng, hectareas, aptitud, precio_ha, moneda",
    )
    .eq("estado", "activo")
    .not("lat", "is", null)
    .not("lng", "is", null);

  return (
    <div className="mapa-page">
      <CampoMapa campos={campos ?? []} />
    </div>
  );
}
