"use client";

import Link from "@/components/layout/SiteLink";
import { ArrowLeft } from "lucide-react";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import { usePathname } from "next/navigation";
import { useSharedPreviewChrome } from "./PreviewChromeContext";

export default function DashboardReturn({ embedded = false }: { embedded?: boolean } = {}) {
  const pathname = usePathname();
  const v3 = useSharedPreviewChrome();
  const country = useRegionalCountry();
  // Formulario de alta o edición: retorno al listado correcto, sin botón duplicado.
  const isCampoForm =
    pathname === "/mis-campos/nuevo" ||
    /^\/mis-campos\/[^/]+\/editar\/?$/.test(pathname);
  const isServicioForm =
    pathname === "/mis-servicios-rurales/nuevo" ||
    /^\/mis-servicios-rurales\/[^/]+\/editar\/?$/.test(pathname);

  const returnHref = isCampoForm
    ? "/mis-campos"
    : isServicioForm
      ? "/mis-servicios-rurales"
      : v3 ? "/v3/mi-rentocampo" : "/dashboard";
  const backLabel = isCampoForm
    ? regionalText(country, "Volver a Mis campos", "Voltar aos meus campos", "Back to my fields")
    : isServicioForm
      ? regionalText(country, "Volver a Mis servicios rurales", "Voltar aos meus serviços rurais", "Back to my rural services")
      : regionalText(country, "Volver a mi cuenta", "Voltar à minha conta", "Back to my account");

  if (pathname === "/dashboard" || pathname === "/v3/mi-rentocampo") return null;

  return (
    <nav className="rc-return-inline" style={{margin:"16px 0 24px",padding:"0 8px",display:"flex",alignItems:"center"}} aria-label={backLabel}>
      <Link href={`${returnHref}?pais=${country}`} className="rc-publish-button" style={{background:"#ffffff",color:"#102c43",border:"1px solid #cbd0d5",borderRadius:12,boxShadow:"none",fontWeight:700}}>
        <ArrowLeft size={17} aria-hidden="true" />
        <span>{backLabel}</span>
      </Link>
    </nav>
  );
}
