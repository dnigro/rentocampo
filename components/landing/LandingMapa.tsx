import Link from "next/link";
import CampoMapa from "@/components/campos/CampoMapa";
import { createClient } from "@/lib/supabase/server";
import "@/styles/mapa.css";

export default async function LandingMapa() {
  const supabase = await createClient();
  const { data: campos } = await supabase.from("campos").select("id, titulo, provincia, localidad, lat, lng, hectareas, aptitud, precio_ha, moneda").eq("estado", "activo").not("lat", "is", null).not("lng", "is", null);
  return (
    <section className="rc-map-section" id="visibilidad"><div className="rc-shell">
      <div className="rc-map-copy"><p className="rc-kicker">Explorá el mapa</p><h2>La oportunidad puede estar más cerca.</h2><p>Encontrá campos disponibles por zona y accedé a toda la información en un solo lugar.</p><Link href="/campos/mapa" className="rc-text-link">Abrir mapa completo →</Link></div>
      <div className="rc-map"><CampoMapa campos={campos ?? []} /></div>
    </div>
    <div className="rc-manifesto"><div className="rc-manifesto-image" aria-hidden="true" /><div className="rc-manifesto-copy"><h2>Sin vueltas.<br />Sin intermediarios.<br /><em>Campo a campo.</em></h2><Link href="/register" aria-label="Crear una cuenta">→</Link></div></div>
    </section>
  );
}
