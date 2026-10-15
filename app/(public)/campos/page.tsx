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
  return {
    title: `Campos disponibles en ${COUNTRIES[pais].name} | RentoCampo`,
    description: `Explorá campos agrícolas, ganaderos y mixtos disponibles en ${COUNTRIES[pais].name}. Filtrá por zona y conversá directamente con propietarios.`,
    alternates: { canonical: `${SITE_URL}/campos?pais=${pais}` },
  };
}

export default async function CamposPage({
  searchParams,
}: {
  searchParams: Promise<CamposSearchParams>;
}) {
  return <CamposListing params={await searchParams} />;
}
