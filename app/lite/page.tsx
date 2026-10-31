import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import LiteHeader from "@/components/lite/LiteHeader";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import "@/styles/lite-direct-hero.css";

export const metadata: Metadata = { title: "RentoCampo Lite | Campos y servicios" };

export default async function LitePreview() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);

  const links = [
    { title: t("Campos", "Terras", "Land"), href: "/lite/campos" },
    { title: t("Servicios", "Serviços", "Services"), href: "/lite/servicios" },
    { title: t("Mi perfil", "Meu perfil", "My profile"), href: "/lite/perfil" },
  ];

  return (
    <main className="rcLiteShell">
      <LiteHeader />
      <section className="rcLiteDirectHero" aria-labelledby="rcLiteDirectHero-title">
        <Image src="/image_vaca_pix.png" alt="" fill priority sizes="(max-width:520px) 100vw, 520px" className="rcLiteDirectHero__image" />
        <div className="rcLiteDirectHero__tone" aria-hidden="true" />
        <div className="rcLiteDirectHero__body">
          <p className="rcLiteDirectHero__eyebrow">{t("CONECTÁ DIRECTO.", "CONECTE-SE DIRETO.", "CONNECT DIRECTLY.")}</p>
          <h1 className="rcLiteDirectHero__title" id="rcLiteDirectHero-title">
            <span>{t("EL CAMPO.", "O CAMPO.", "RURAL LIFE.")}</span>
            <span>{t("SIN VUELTAS.", "SEM COMPLICAÇÕES.", "MADE SIMPLE.")}</span>
          </h1>
          <span className="rcLiteDirectHero__rule" aria-hidden="true" />
          <p className="rcLiteDirectHero__line">{t("Campos y servicios. Contacto directo.", "Terras e serviços. Contato direto.", "Land and services. Direct contact.")}</p>
          <div className="rcLiteDirectHero__actions">
            <Link href="/lite/cuenta/registro" className="rcLiteDirectHero__register">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
            </Link>
            <Link href="/lite/campos" className="rcLiteDirectHero__explore">
              {t("Explorar campos", "Explorar terras", "Explore land")}
            </Link>
          </div>
          <div className="rcLiteDirectHero__stats" aria-label={t("0% comisión. 100% contacto directo.", "0% comissão. 100% contato direto.", "0% commission. 100% direct contact.")}>
            <div className="rcLiteDirectHero__metric"><strong>0%</strong><span>{t("COMISIÓN", "COMISSÃO", "COMMISSION")}</span></div>
            <span className="rcLiteDirectHero__separator" aria-hidden="true" />
            <div className="rcLiteDirectHero__metric"><strong>100%</strong><span>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span></div>
          </div>
        </div>
      </section>
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
