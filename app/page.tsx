import type { Metadata } from "next";
import V3Home from "@/app/v3/page";
import V3Layout from "@/app/v3/layout";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingPageContent from "@/components/landing/LandingPageContent";

export const metadata: Metadata = {
  title: "RentoCampo | Alquiler de campos y servicios rurales sin comisión",
  description:
    "Buscá o publicá campos en alquiler o venta y servicios rurales. Explorá el mapa, chateá directamente y conectá sin comisiones.",
  keywords:
    "alquiler de campos Argentina, campos en alquiler, arrendamiento rural, campos agrícolas en alquiler, campos ganaderos, servicios rurales",
  alternates: {
    canonical: "https://rentocampo.com/",
    languages: {
      "es-AR": "https://rentocampo.com/",
      "en-US": "https://rentocampo.com/us",
      "pt-BR": "https://rentocampo.com/br",
      "x-default": "https://rentocampo.com/",
    },
  },
  openGraph: {
    title: "RentoCampo | Campos y servicios rurales sin comisiones",
    description:
      "Publicá tu campo o servicios rurales, encontrá oportunidades en el mapa y chateá directamente sin intermediarios.",
    type: "website",
    locale: "es_AR",
  },
};

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  // Supabase may fall back to its configured Site URL when the requested
  // redirect URL is not allow-listed. Preserve the recovery code and continue
  // through the callback so the user can still set a new password.
  if (code) {
    redirect(
      `/auth/callback?code=${encodeURIComponent(code)}&next=${encodeURIComponent("/auth/reset-password")}`,
    );
  }

  if (process.env.VERCEL_ENV === "preview" && process.env.VERCEL_GIT_COMMIT_REF === "feature/rentocampo-v3") {
    return <V3Layout><V3Home /></V3Layout>;
  }

  return (
    <>
      <Navbar />
      <LandingPageContent />
      <Footer />
    </>
  );
}
