"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { usePathname } from "next/navigation";

export default function DashboardReturn() {
  const pathname = usePathname();

  if (pathname === "/dashboard") return null;

  return (
    <nav className="dashboard-return" aria-label="Volver a Mi cuenta">
      <Link href="/dashboard" className="rc-dashboard-return-btn"><ArrowLeft size={17} aria-hidden="true" /><span>Volver a mi cuenta</span></Link>
    </nav>
  );
}
