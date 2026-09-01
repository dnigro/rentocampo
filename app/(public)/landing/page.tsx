import type { Metadata } from "next";
import LandingPageContent from "@/components/landing/LandingPageContent";

export const metadata: Metadata = {
  title: "RentoCampo | Publicá tu campo gratis",
  description:
    "RentoCampo conecta propietarios rurales con productores que buscan alquilar campos en Argentina. Publicá gratis, recibí consultas y hablá directo.",
};

export default function LandingRoutePage() {
  return <LandingPageContent />;
}
