import Link from "next/link";
import CampoMapa from "@/components/campos/CampoMapa";
import { createClient } from "@/lib/supabase/server";
import "@/styles/mapa.css";

export default async function LandingMapa() {
  const supabase = await createClient();
  const { data: campos } = await supabase.from("campos").select("id, titulo, provincia, localidad, lat, lng, hectareas, aptitud, precio_ha, moneda").eq("estado", "activo").not("lat", "is", null).not("lng", "is", null);
  return (
    <section className="rc-map-section" id="visibilidad"><div className="rc-shell">
      <div className="rc-map-copy"><p className="rc-kicker">Campos en todo el país</p><h2>Una red federal que produce.</h2><p>Explorá campos disponibles en todo el país. Conectamos oportunidades en cada región productiva.</p><Link href="/campos/mapa" className="rc-button rc-button-yellow">Ver mapa de campos →</Link></div>
      <div className="rc-map"><CampoMapa campos={campos ?? []} /></div>
    </div>
    <div className="rc-manifesto"><div className="rc-manifesto-copy"><p className="rc-kicker">Nuestra esencia</p><h2>Crecemos en el campo.<br />Crecemos en su gente.</h2><p>Potenciamos el valor de la tierra conectando historias, oportunidades y futuro.</p><span className="rc-manifesto-sign">Tierra · Personas · Futuro</span></div><div className="rc-manifesto-image" aria-hidden="true" /></div>
    </section>
  );
}
