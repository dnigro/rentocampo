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
import "@/styles/hero-regional-minimal.css";
import "@/styles/landing-triptych-hero.css";
import "@/styles/landing-triptych-refinements.css";
import "@/styles/home-video-swap.css";

export const metadata: Metadata = {
  title: "RentoCampo | Campos y servicios rurales en la región",
  description:
    "Encontrá campos y servicios rurales en Argentina, Uruguay, Paraguay, Chile, Bolivia y Perú. Registrate gratis, explorá oportunidades y contactá directamente.",
  keywords:
    "alquiler de campos Argentina, campos en alquiler, arrendamiento rural, campos agrícolas en alquiler, campos ganaderos, servicios rurales",
  alternates: { canonical: "https://rentocampo.com" },
  openGraph: {
    title: "RentoCampo | Red regional de tierras productivas y servicios rurales",
    description:
      "Tierras productivas, productores y servicios rurales de Argentina, Uruguay, Paraguay, Chile, Bolivia y Perú en un solo lugar.",
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
