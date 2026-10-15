import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingPageContent from "@/components/landing/LandingPageContent";
import "@/styles/public.css";
import "@/styles/landing-bold.css";
import "@/styles/landing-marketplace.css";
import "@/styles/landing-editorial-reference.css";
import "@/styles/hero-editorial-stable.css";
import "@/styles/landing-impact.css";
import "@/styles/hero-conversion-preview.css";

export const metadata: Metadata = {
  title: "RentoCampo | Servicios rurales y tierras productivas en la región",
  description:
    "Registrate gratis en RentoCampo: la red regional de tierras productivas y servicios rurales de Argentina, Uruguay y Paraguay. Encontrá campos y conectá directamente.",
  keywords:
    "alquiler de campos Argentina, campos en alquiler, arrendamiento rural, campos agrícolas en alquiler, campos ganaderos, servicios rurales",
  alternates: { canonical: "https://rentocampo.com" },
  openGraph: {
    title: "RentoCampo | Red regional de servicios y tierras productivas",
    description:
      "Campos, productores y servicios rurales de Argentina, Uruguay y Paraguay en una sola plataforma regional.",
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

  return (
    <>
      <Navbar />
      <LandingPageContent />
      <Footer />
    </>
  );
}
