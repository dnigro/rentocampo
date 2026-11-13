import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccessManagementReport } from "@/lib/analytics/commercial-filters";
import { getCommercialStats } from "@/lib/analytics/commercial-stats";
import GerencialExplorador from "@/components/gerencial/GerencialExplorador";
import "@/styles/rc-decision-report.css";

export const dynamic = "force-dynamic";

export default async function GerencialPage() {
  const client = await createClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/login");
  if (!user.email_confirmed_at || !canAccessManagementReport(user.email)) redirect("/acceso-restringido");
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
