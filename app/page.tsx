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

export const metadata: Metadata = {
  title: "RentoCampo | Alquiler de campos y servicios rurales en Argentina",
  description:
    "Buscá campos en alquiler en Argentina: agrícolas, ganaderos y mixtos. Explorá tierras por provincia, publicá tu campo y contactá directamente a propietarios.",
  keywords:
    "alquiler de campos Argentina, campos en alquiler, arrendamiento rural, campos agrícolas en alquiler, campos ganaderos, servicios rurales",
  alternates: { canonical: "https://rentocampo.com" },
  openGraph: {
    title: "RentoCampo | La red federal del campo argentino",
    description:
      "Tierra productiva, productores y servicios rurales en un solo lugar. Mapa, publicaciones y chat online gratis.",
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
