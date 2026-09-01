import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingPageContent from "@/components/landing/LandingPageContent";
import "@/styles/public.css";

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

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <LandingPageContent />
      <Footer />
    </>
  );
}
