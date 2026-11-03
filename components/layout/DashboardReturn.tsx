"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import { usePathname } from "next/navigation";

export default function DashboardReturn() {
  const pathname = usePathname();
  const country = useRegionalCountry();
  const backLabel = regionalText(country, "Volver a mi cuenta", "Voltar à minha conta", "Back to my account");

  if (pathname === "/dashboard") return null;

  return (
    <nav className="dashboard-return" aria-label={backLabel}>
      <Link href="/dashboard" className="rc-dashboard-return-btn"><ArrowLeft size={17} aria-hidden="true" /><span>{backLabel}</span></Link>
    </nav>
  );
}
