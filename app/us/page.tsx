import type { Metadata } from "next";
import RegionalLanding from "@/components/seo/RegionalLanding";

export const metadata: Metadata = {
  title: "Farmland, Landowners & Rural Services in the USA | RentoCampo",
  description: "List farmland, explore land for lease or sale, and connect with rural contractors across the United States. Direct chat, no middlemen, zero commission.",
  alternates: {
    canonical: "https://rentocampo.com/us",
    languages: {
      "es-AR": "https://rentocampo.com/",
      "en-US": "https://rentocampo.com/us",
      "pt-BR": "https://rentocampo.com/br",
      "x-default": "https://rentocampo.com/",
    },
  },
  openGraph: {
    title: "RentoCampo USA | Farmland & Rural Services",
    description: "A direct connection for landowners, farmers and rural service providers. Explore the map, list for free and chat.",
    url: "https://rentocampo.com/us",
    locale: "en_US",
    type: "website",
  },
};

export default function USLandingPage() {
  return <RegionalLanding market="US" />;
}
