import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";
import { getCommercialStats } from "@/lib/analytics/commercial-stats";
import { COUNTRIES, isCountryCode } from "@/data/countries";

export const dynamic = "force-dynamic";

function Metric({ label, value, description, tone = "neutral" }: { label: string; value: number; description: string; tone?: "neutral" | "mustard" | "sage" | "blue" }) {
  const backgrounds = { neutral: "bg-zinc-100", mustard: "bg-amber-100", sage: "bg-emerald-50", blue: "bg-sky-100" };
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${backgrounds[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-600">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">{value.toLocaleString("es-AR")}</p>
      <p className="mt-2 text-xs leading-relaxed text-zinc-600">{description}</p>
    </div>
  );
}

function Trend({ months }: { months: { month: string; registrations: number }[] }) {
  const points = months.reduce<{ month: string; total: number }[]>((acc, month) => {
    acc.push({ month: month.month, total: (acc.at(-1)?.total ?? 0) + month.registrations });
    return acc;
  }, []);
  const max = Math.max(1, ...points.map((point) => point.total));
  const coordinates = points.map((point, i) => ({
    ...point, x: 35 + (i * 520) / Math.max(1, points.length - 1),
    y: 145 - (point.total / max) * 110,
  }));
  const line = coordinates.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ");
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold text-zinc-900">Evolución de registros</h2>
        <span className="text-xs text-zinc-500">6 meses</span>
      </div>
      <svg className="mt-3 w-full" viewBox="0 0 590 185" role="img" aria-label="Línea de registros elegibles por mes de creación, acumulados dentro de los seis meses visibles">
        <path d="M35 145 H555" fill="none" stroke="#e4e4e7" />
        {coordinates.length > 0 && <path d={line} fill="none" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
        {coordinates.map((p) => <g key={p.month}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#ca8a04" />
          <text x={p.x} y={p.y - 11} textAnchor="middle" fontSize="12" fill="#27272a">{p.total}</text>
          <text x={p.x} y="168" textAnchor="middle" fontSize="11" fill="#71717a">{p.month.slice(5)}</text>
        </g>)}
      </svg>
      <p className="text-xs text-zinc-500">Acumulado dentro de la ventana mostrada, no total histórico.</p>
    </div>
  );
}

function Stage({ number, label, detail }: { number?: number; label: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center">
      <p className="text-xl font-bold tabular-nums text-zinc-900">{number === undefined ? "—" : number.toLocaleString("es-AR")}</p>
      <p className="mt-1 text-xs font-semibold text-zinc-800">{label}</p>
      <p className="mt-1 text-[11px] text-zinc-500">{detail}</p>
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
  const goal = 1000;
  const progress = Math.min(100, (report.totals.registrations / goal) * 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 text-zinc-800 sm:px-6">
      <header className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">RentoCampo / Growth 360° / Privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Tablero gerencial</h1>
        <p className="mt-2 text-sm text-zinc-600">Datos reales de producción · Sin DEMO ni cuentas internas.</p>
        <p className="mt-1 text-xs text-zinc-500">Actualizado: {new Date(report.updatedAt).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })} (Argentina)</p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Metric label="Registros confirmados" value={report.totals.registrations} description="Cuentas externas elegibles" tone="blue" />
        <Metric label="Campos reales" value={report.totals.activeLands} description="Activos, sin DEMO" tone="sage" />
        <Metric label="Servicios reales" value={report.totals.activeServices} description="Prestadores activos, sin DEMO" tone="mustard" />
        <Metric label="Faltan para 1.000" value={Math.max(0, goal - report.totals.registrations)} description="Meta de registros" />
        <Metric label="Países con registros" value={report.countries.filter((c) => c.registrations > 0).length} description="Actividad comercial comprobada" tone="blue" />
        <Metric label="Países con oferta" value={report.countries.filter((c) => c.activeLands + c.activeServices > 0).length} description="Campos o servicios reales" tone="sage" />
      </div>

      <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-zinc-900">Meta · 1.000 registros</h2><span className="text-lg font-bold tabular-nums">{progress.toLocaleString("es-AR", { maximumFractionDigits: 2 })}%</span></div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-zinc-100"><div className="h-full rounded-full bg-amber-500" style={{ width: `${progress}%` }} /></div>
        <p className="mt-2 text-xs text-zinc-500">Solo usuarios externos confirmados.</p>
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-zinc-900">Embudo de crecimiento</h2>
        <p className="mt-1 text-xs text-zinc-500">Sin datos de visitas ni chats en este tablero.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stage label="Visitas" detail="GA4 no conectado aquí" />
          <Stage number={report.totals.registrations} label="Registros" detail="Correo confirmado" />
          <Stage number={report.totals.activeLands + report.totals.activeServices} label="Oferta activa" detail="Campos + servicios" />
          <Stage label="Consultas" detail="Sin métrica conectada" />
        </div>
      </section>

      <section className="mt-5 grid gap-2 md:grid-cols-3">
        <div className="rounded-xl bg-zinc-900 p-4 text-white"><p className="text-xs uppercase tracking-wide text-zinc-300">01 · Propietarios</p><p className="mt-2 text-sm font-semibold">Captar campos reales</p></div>
        <div className="rounded-xl bg-zinc-800 p-4 text-white"><p className="text-xs uppercase tracking-wide text-zinc-300">02 · Prestadores</p><p className="mt-2 text-sm font-semibold">Sumar servicios activos</p></div>
        <div className="rounded-xl bg-zinc-700 p-4 text-white"><p className="text-xs uppercase tracking-wide text-zinc-200">03 · Productores</p><p className="mt-2 text-sm font-semibold">Conseguir consultas reales</p></div>
      </section>

      <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-lg font-semibold">Parque comercial por país</h2>
          <p className="text-sm text-zinc-500">Desglose de los países desplegados, incluso sin actividad real.</p>
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

      <details className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <summary className="cursor-pointer p-5 font-semibold text-zinc-900">Detalle mensual (opcional)</summary>
        <div className="border-t border-zinc-200 p-5">
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
      </details>
      <p className="mt-5 text-xs text-zinc-500">Reporte gerencial privado: no altera registros, fichas, búsquedas ni datos de producción.</p>
    </section>
  );
}
