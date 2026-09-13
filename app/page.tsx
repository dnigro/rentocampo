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
  title: "RentoCampo | Publicá tu campo gratis",
  description:
    "RentoCampo conecta propietarios rurales con productores que buscan alquilar campos en Argentina. Publicá gratis, recibí consultas y hablá directo.",
  keywords:
    "arrendamiento campos argentina, alquiler campos agrícolas, renta campo, campos en arriendo, tierra para producir",
  openGraph: {
    title: "RentoCampo | Publicá tu campo gratis",
    description:
      "Hacé visible tu campo. Conectá directo con productores. Costo $0 y sin intermediarios obligatorios.",
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
