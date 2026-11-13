import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { isV3Enabled } from "@/lib/v3-routing";
import Footer from "@/components/layout/Footer";
import DashboardReturn from "@/components/layout/DashboardReturn";
import "@/styles/dashboard.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  if (isV3Enabled(process.env)) return <main className="main-content account-workspace"><DashboardReturn />{children}</main>;

  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content account-workspace">
        
        <DashboardReturn />
        {children}
      </main>
      <Footer />
    </div>
  );
}
