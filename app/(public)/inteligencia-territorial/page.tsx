import type { Metadata } from "next";
import TerritorialExplorer from "@/components/inteligencia/TerritorialExplorer";

export const metadata: Metadata = {
  title: "Inteligencia territorial V2 | RentoCampo",
  description: "Explorador experimental de capas de suelo y oportunidades productivas.",
  robots: { index: false, follow: false },
};

export default function InteligenciaTerritorialPage() {
  return <TerritorialExplorer />;
}
