import Link from "next/link";
import CampoMapa from "@/components/campos/CampoMapa";
import { createClient } from "@/lib/supabase/server";
import "@/styles/mapa.css";

export default async function LandingMapa() {
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
    <section className="py-20 bg-white" id="visibilidad">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* CARD */}
          <div className="bg-green-900 text-white rounded-2xl p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide mb-4 text-white/95">
              <span>🗺️</span>
              Visibilidad
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 -tracking-wider">
              Tu campo se muestra como una oportunidad disponible.
            </h2>
            <p className="text-white/82 text-lg leading-relaxed mb-8">
              El mapa ayuda a que productores puedan ubicar zonas de interés. La publicación ordena la información clave para que el primer contacto sea más claro.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-bold border-b-2 border-white/45 hover:border-white transition-colors hover:-translate-y-0.5 w-fit"
            >
              Ir a mi cuenta →
            </Link>
          </div>

          {/* MAPA REAL DE LA APLICACIÓN */}
          <div className="relative h-[480px] lg:h-auto lg:min-h-[520px] rounded-2xl border border-green-900/10 overflow-hidden shadow-lg">
            <CampoMapa campos={campos ?? []} />
          </div>
        </div>
      </div>
    </section>
  );
}
