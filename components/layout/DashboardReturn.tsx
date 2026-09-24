"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardReturn() {
  const pathname = usePathname();

  if (pathname === "/dashboard") return null;

  return (
    <nav className="dashboard-return" aria-label="Volver a Mi cuenta">
      <Link href="/dashboard">← Volver a Mi cuenta</Link>
    </nav>
  );
}
