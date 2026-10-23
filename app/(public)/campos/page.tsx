import { cookies } from "next/headers";
import { COUNTRIES, resolveCountry } from "@/data/countries";
import type { Metadata } from "next";
import CamposListing, { type CamposSearchParams } from "@/components/campos/CamposListing";
import { SITE_URL } from "@/lib/seo/campos";
import "@/styles/campos.css";
import "@/styles/explorador.css";

export async function generateMetadata({ searchParams }: { searchParams: Promise<CamposSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const pais = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
  const canonical = pais === "AR" ? `${SITE_URL}/campos` : `${SITE_URL}/campos?pais=${pais}`;
  const hasFilters = Object.keys(params).some((key) => key !== "pais");
  return {
    title: pais === "BR" ? "Arrendamento rural e fazendas no Brasil | RentoCampo" : `Alquiler de campos y tierras en ${COUNTRIES[pais].name} | RentoCampo`,
    description: pais === "BR" ? "Encontre fazendas e terras para arrendamento rural no Brasil. Explore propriedades agrícolas e fale diretamente com proprietários." : `Encontrá campos y tierras rurales en alquiler en ${COUNTRIES[pais].name}. Explorá opciones agrícolas y ganaderas y contactá directamente a propietarios.`,
    alternates: { canonical },
    openGraph: { title: pais === "BR" ? "Arrendamento rural no Brasil | RentoCampo" : `Alquiler de campos en ${COUNTRIES[pais].name} | RentoCampo`, url: canonical, locale: COUNTRIES[pais].locale.replace("-", "_"), type: "website" },
    robots: { index: !hasFilters && (pais === "AR" || Boolean(params.pais)), follow: true },
  };
}

export default async function CamposPage({
  searchParams,
}: {
  searchParams: Promise<CamposSearchParams>;
}) {
  return <CamposListing params={await searchParams} />;
}
