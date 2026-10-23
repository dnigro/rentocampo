import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";
import { getCommercialStats } from "@/lib/analytics/commercial-stats";
import { COUNTRIES, isCountryCode } from "@/data/countries";

export const dynamic = "force-dynamic";

function Metric({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5">
      <p className="text-sm font-medium text-zinc-600">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-zinc-900">{value.toLocaleString("es-AR")}</p>
      <p className="mt-2 text-xs text-zinc-500">{description}</p>
    </div>
  );
}

export default async function GerencialPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  // Sólo cuentas internas autorizadas; las métricas nunca incluyen esas cuentas.
  if (error || !user?.email || !INTERNAL_TEST_EMAILS.includes(user.email.trim().toLowerCase())) {
    notFound();
  }

  const report = await getCommercialStats();
  const largest = Math.max(1, ...report.countries.map((c) => c.registrations + c.activeLands + c.activeServices));

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 text-zinc-800 sm:px-6">
      <div className="mb-8 border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">RentoCampo · Gestión comercial</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Evolución de la red por país
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-zinc-600">
          Registros confirmados y publicaciones activas, sin cuentas internas ni contenido DEMO.
          Datos de solo lectura, actualizados al abrir este reporte.
        </p>
        <p className="mt-2 text-xs text-zinc-500">Corte: {new Date(report.updatedAt).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })} (Argentina)</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Registros válidos" value={report.totals.registrations} description="Perfiles con correo confirmado, sin pruebas internas" />
        <Metric label="Campos activos" value={report.totals.activeLands} description="Publicaciones comerciales activas, sin DEMO" />
        <Metric label="Servicios activos" value={report.totals.activeServices} description="Servicios comerciales publicados y activos" />
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">Parque comercial por país</h2>
          <p className="text-sm text-zinc-500">Se muestran los seis mercados de la red, incluso sin actividad real.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[610px] border-collapse text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr><th className="px-5 py-4 text-left">País</th><th className="px-3 py-4 text-right">Registros</th><th className="px-3 py-4 text-right">Campos</th><th className="px-3 py-4 text-right">Servicios</th><th className="w-1/3 px-5 py-4 text-left">Actividad relativa</th></tr>
            </thead>
            <tbody>
              {report.countries.map((c) => (
                <tr key={c.country} className="border-t border-zinc-100">
                  <td className="px-5 py-4 font-medium">{isCountryCode(c.country) ? COUNTRIES[c.country].name : c.country} <span className="text-xs text-zinc-400">{c.country}</span></td>
                  <td className="px-3 py-4 text-right tabular-nums">{c.registrations}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{c.activeLands}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{c.activeServices}</td>
                  <td className="px-5 py-4">
                    <div className="h-2 rounded-full bg-zinc-100">
                      <div className="h-2 rounded-full bg-zinc-500" style={{ width: `${100 * (c.registrations + c.activeLands + c.activeServices) / largest}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">Altas de los últimos seis meses</h2>
          <p className="text-sm text-zinc-500">Fecha de creación. En campos y servicios sólo incluye los que siguen activos; no representa el parque histórico al cierre de cada mes.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wider text-zinc-500">
              <tr><th className="px-5 py-4 text-left">Mes</th><th className="px-5 py-4 text-right">Registros</th><th className="px-5 py-4 text-right">Campos</th><th className="px-5 py-4 text-right">Servicios</th></tr>
            </thead>
            <tbody>
              {report.months.map((m) => (
                <tr className="border-t border-zinc-100" key={m.month}>
                  <td className="px-5 py-3 font-medium">{m.month}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.registrations}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.activeLands}</td>
                  <td className="px-5 py-3 text-right tabular-nums">{m.activeServices}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p className="mt-5 text-xs text-zinc-500">Reporte gerencial privado: no altera registros, fichas, búsquedas ni datos de producción.</p>
    </section>
  );
}
