import Link from "next/link";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import LiteHeader from "@/components/lite/LiteHeader";
import SimpleMapChatHero from "@/components/landing/SimpleMapChatHero";
import HowItWorksStrip from "@/components/landing/HowItWorksStrip";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import "@/styles/lite-direct-hero.css";

export const metadata: Metadata = { title: "RentoCampo Lite | Campos y servicios" };

export default async function LitePreview({ searchParams }: { searchParams: Promise<{ pais?: string }> }) {
  const { pais } = await searchParams;
  const country = resolveCountry(pais, (await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const links = [
    { title: t("Campos", "Terras", "Land"), href: "/lite/campos" },
    { title: t("Servicios", "Serviços", "Services"), href: "/lite/servicios" },
    { title: t("Mi perfil", "Meu perfil", "My profile"), href: "/lite/perfil" },
  ];

  return (
    <main className="rcLiteShell">
      <LiteHeader />
      <SimpleMapChatHero lite />
      <HowItWorksStrip lite />
      <section className="rcLiteExplore" aria-label={t("Explorá RentoCampo", "Explore a RentoCampo", "Explore RentoCampo")}>
        <p className="rcLiteExplore__label">{t("TU CAMPO. TUS OPORTUNIDADES.", "SEU CAMPO. SUAS OPORTUNIDADES.", "YOUR LAND. YOUR OPPORTUNITIES.")}</p>
        <div className="rcLiteExplore__list">
          {links.map((item) => <Link className="rcLiteExplore__link" key={item.href} href={item.href}>{item.title}</Link>)}
        </div>
      </section>
      <nav className="rcLiteBottomNav" aria-label={t("Navegación Lite", "Navegação Lite", "Lite navigation")}>
        <Link href="/lite">{t("Inicio", "Início", "Home")}</Link>
        <Link href="/lite/campos">{t("Campos", "Terras", "Land")}</Link>
        <Link href="/lite/servicios">{t("Servicios", "Serviços", "Services")}</Link>
        <Link href="/lite/perfil">{t("Perfil", "Perfil", "Profile")}</Link>
      </nav>
    </main>
  );
}
