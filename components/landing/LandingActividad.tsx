import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingActividad() {
  const supabase = await createClient();
  const { data: campos } = await supabase.from("campos").select("hectareas, provincia").eq("estado", "activo");
  const activos = campos ?? [];
  const hectareas = activos.reduce((total, campo) => total + Number(campo.hectareas ?? 0), 0);
  const provincias = new Set(activos.map((campo) => campo.provincia).filter(Boolean)).size;
  return (
    <section className="rc-impact" aria-labelledby="actividad-title">
      <div className="rc-shell">
        <div className="rc-impact-head"><div><p className="rc-kicker">Impacto real</p><h2 id="actividad-title">Tierra que ya está<br />en movimiento.</h2></div><Link href="/campos" className="rc-text-link">Ver todos los campos →</Link></div>
        <div className="rc-stats">
          <div className="rc-stat"><strong>{activos.length.toLocaleString("es-AR")}</strong><span>Campos publicados</span></div>
          <div className="rc-stat"><strong>{hectareas.toLocaleString("es-AR")}</strong><span>Hectáreas disponibles</span></div>
          <div className="rc-stat"><strong>{provincias}</strong><span>Provincias</span></div>
        </div>
      </div>
    </section>
  );
}
