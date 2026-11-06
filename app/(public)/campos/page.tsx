import { cookies } from "next/headers";
import { COUNTRIES, resolveCountry } from "@/data/countries";
import type { Metadata } from "next";
import CamposListing, { type CamposSearchParams } from "@/components/campos/CamposListing";
import { SITE_URL } from "@/lib/seo/campos";
import { createClient } from "@/lib/supabase/server";
import "@/styles/campos.css";
import "@/styles/explorador.css";

export async function generateMetadata({ searchParams }: { searchParams: Promise<CamposSearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const pais = resolveCountry(params.pais, (await cookies()).get("rentocampo_country")?.value);
  const canonical = pais === "AR" ? `${SITE_URL}/campos` : `${SITE_URL}/campos?pais=${pais}`;
  const hasFilters = Object.keys(params).some((key) => key !== "pais");
  const eligibleForIndex = !hasFilters && (pais === "AR" || Boolean(params.pais));
  // Evitar indexar catálogos construidos solamente con fichas DEMO.
  // Las páginas /us y /br siguen indexables y los filtros siguen operativos.
  // Sólo desindexar cuando se confirma que el catálogo no tiene ofertas reales.
  // Si la consulta falla temporalmente, conservar su indexación existente.
  let hasRealListings = true;
  if (eligibleForIndex) {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("campos")
        .select("id, titulo")
        .eq("status", "activo")
        .eq("country_code", pais);
      if (!error) {
        hasRealListings = (data ?? []).some((campo) =>
          !campo.id.startsWith("20000000-") && !/\bDEMO\b/i.test(campo.titulo ?? ""),
        );
      }
    } catch {
      // No desindexar una URL por un fallo transitorio de lectura.
    }
  }
  return {
    title: pais === "US" ? "Farmland for Rent and Sale in the United States | RentoCampo" : pais === "BR" ? "Arrendamento rural e fazendas no Brasil | RentoCampo" : `Alquiler de campos y tierras en ${COUNTRIES[pais].name} | RentoCampo`,
    description: pais === "US" ? "Browse farmland to rent or buy across the United States. Connect directly with landowners and rural professionals." : pais === "BR" ? "Encontre fazendas e terras para arrendamento rural no Brasil. Explore propriedades agrícolas e fale diretamente com proprietários." : `Encontrá campos y tierras rurales en alquiler en ${COUNTRIES[pais].name}. Explorá opciones agrícolas y ganaderas y contactá directamente a propietarios.`,
    alternates: { canonical },
    openGraph: { title: pais === "US" ? "US Farmland | RentoCampo" : pais === "BR" ? "Arrendamento rural no Brasil | RentoCampo" : `Alquiler de campos en ${COUNTRIES[pais].name} | RentoCampo`, url: canonical, locale: COUNTRIES[pais].locale.replace("-", "_"), type: "website" },
    robots: { index: eligibleForIndex && hasRealListings, follow: true },
  };
}

export default async function CamposPage({
  searchParams,
}: {
  searchParams: Promise<CamposSearchParams>;
}) {
  return <CamposListing params={await searchParams} />;
}
