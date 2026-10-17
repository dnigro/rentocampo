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
    title: `Campos disponibles en ${COUNTRIES[pais].name} | RentoCampo`,
    description: `Explorá campos agrícolas, ganaderos y mixtos disponibles en ${COUNTRIES[pais].name}. Filtrá por zona y conversá directamente con propietarios.`,
    alternates: { canonical },
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
