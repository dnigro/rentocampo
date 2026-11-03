import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { INTERNAL_TEST_EMAILS } from "@/lib/analytics/commercial-filters";
import { getCommercialStats } from "@/lib/analytics/commercial-stats";
import GerencialExplorador from "@/components/gerencial/GerencialExplorador";
import "@/styles/rc-decision-report.css";

export const dynamic = "force-dynamic";

export default async function GerencialPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  // Sólo acceso a las cuentas administradoras ya autorizadas.
  if (error || !user?.email || !INTERNAL_TEST_EMAILS.includes(user.email.trim().toLowerCase())) {
    notFound();
  }
  const report = await getCommercialStats();

  return (
    <main className="rc-decision-page">
      <GerencialExplorador
        countries={report.countries}
        months={report.months}
        totals={report.totals}
        updatedAt={report.updatedAt}
      />
    </main>
  );
}
