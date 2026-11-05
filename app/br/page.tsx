import type { Metadata } from "next";
import RegionalLanding from "@/components/seo/RegionalLanding";

export const metadata: Metadata = {
  title: "Terras, Arrendamento e Serviços Rurais no Brasil | RentoCampo",
  description: "Anuncie sua terra, encontre oportunidades de arrendamento e serviços rurais no Brasil. Mapa, chat direto, sem intermediários e sem comissão.",
  alternates: {
    canonical: "https://rentocampo.com/br",
    languages: {
      "es-AR": "https://rentocampo.com/",
      "en-US": "https://rentocampo.com/us",
      "pt-BR": "https://rentocampo.com/br",
      "x-default": "https://rentocampo.com/",
    },
  },
  openGraph: {
    title: "RentoCampo Brasil | Terras e Serviços Rurais",
    description: "Conectamos proprietários, produtores e prestadores de serviços rurais. Anuncie grátis, explore o mapa e converse diretamente.",
    url: "https://rentocampo.com/br",
    locale: "pt_BR",
    type: "website",
  },
};

export default function BRLandingPage() {
  return <RegionalLanding market="BR" />;
}
