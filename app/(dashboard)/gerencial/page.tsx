import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";
import { getCommercialStats } from "@/lib/analytics/commercial-stats";
import GerencialExplorador from "@/components/gerencial/GerencialExplorador";
import "@/styles/rc-management-report.css";
import "@/styles/rc-growth-visual.css";

export const dynamic = "force-dynamic";

export default async function GerencialPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  // Reporte exclusivamente privado: no mostrar métricas de terceros.
  if (error || !user?.email || !INTERNAL_TEST_EMAILS.includes(user.email.trim().toLowerCase())) {
    notFound();
  }
  const report = await getCommercialStats();
  return (
    <section className="rc-gerencial mx-auto max-w-6xl px-4 py-8 text-zinc-800 sm:px-6">
      <header className="rc-gerencial__header mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">RentoCampo / Growth 360° / Privado</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Reporte gerencial</h1>
        <p className="mt-2 text-sm text-zinc-600">Registros confirmados, campos y servicios publicados activos · Sin DEMO ni cuentas internas.</p>
        <p className="mt-1 text-xs text-zinc-500">Actualizado: {new Date(report.updatedAt).toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" })} (Argentina)</p>
      </header>
      <GerencialExplorador countries={report.countries} months={report.months} totals={report.totals} />
      <p className="mt-5 text-xs text-zinc-500">Sólo lectura: este reporte no modifica registros, fichas ni datos de producción.</p>
    </section>
  );
}
