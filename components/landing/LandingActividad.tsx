import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function LandingActividad() {
  const supabase = await createClient();
  const { data: campos } = await supabase
    .from("campos")
    .select("hectareas, provincia")
    .eq("estado", "activo");

  const camposActivos = campos ?? [];
  const totalHectareas = camposActivos.reduce(
    (total, campo) => total + Number(campo.hectareas ?? 0),
    0,
  );
  const provincias = new Set(
    camposActivos.map((campo) => campo.provincia).filter(Boolean),
  ).size;

  return (
    <section className="relative -mt-7 z-20 pb-20" aria-labelledby="actividad-title">
      <div className="max-w-7xl mx-auto px-5">
        <div className="overflow-hidden rounded-3xl border border-green-900/10 bg-white shadow-xl">
          <div className="grid bg-green-950 text-white lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="px-7 py-9 sm:px-10 lg:py-11">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-orange-300">
                RentoCampo hoy
              </span>
              <h2 id="actividad-title" className="mt-3 text-3xl font-bold leading-tight">
                Tierra publicada, oportunidades visibles.
              </h2>
              <p className="mt-3 max-w-lg text-white/75">
                Información real de los campos activos cargados en la plataforma.
              </p>

              <div className="mt-7 grid max-w-2xl grid-cols-3 gap-3">
                <div>
                  <strong className="block text-3xl sm:text-4xl">
                    {camposActivos.length.toLocaleString("es-AR")}
                  </strong>
                  <span className="text-xs text-white/65 sm:text-sm">campos publicados</span>
                </div>
                <div className="border-l border-white/15 pl-3 sm:pl-5">
                  <strong className="block text-3xl sm:text-4xl">
                    {totalHectareas.toLocaleString("es-AR")}
                  </strong>
                  <span className="text-xs text-white/65 sm:text-sm">hectáreas</span>
                </div>
                <div className="border-l border-white/15 pl-3 sm:pl-5">
                  <strong className="block text-3xl sm:text-4xl">{provincias}</strong>
                  <span className="text-xs text-white/65 sm:text-sm">provincias</span>
                </div>
              </div>

            </div>
            <div className="px-7 pb-9 sm:px-10 lg:px-12 lg:py-11">
              <Link href="/campos" className="inline-flex rounded-full bg-orange-500 px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600">
                Explorar campos →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
