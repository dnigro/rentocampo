import type { Metadata } from "next";
import CamposListing, { type CamposSearchParams } from "@/components/campos/CamposListing";
import { SITE_URL } from "@/lib/seo/campos";
import "@/styles/campos.css";
import "@/styles/explorador.css";

export const metadata: Metadata = {
  title: "Campos disponibles en Argentina | RentoCampo",
  description:
    "Explorá campos agrícolas, ganaderos y mixtos disponibles en Argentina. Filtrá por zona y conversá directamente con propietarios.",
  alternates: { canonical: `${SITE_URL}/campos` },
};

export default async function CamposPage({
  searchParams,
}: {
  searchParams: Promise<CamposSearchParams>;
}) {
  return <CamposListing params={await searchParams} />;
}
