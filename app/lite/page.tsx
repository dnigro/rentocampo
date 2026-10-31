import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import LiteHeader from "@/components/lite/LiteHeader";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import photoFields from "@/public/image_trigo_pix.png";
import photoCattle from "@/public/image_vaca_pix.png";
import photoServices from "@/public/image_truck_pix.png";
import "@/styles/home-simple.css";

export const metadata: Metadata = { title: "RentoCampo Lite | Campos y servicios rurales" };

export default async function LiteHome() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const panels = [
    { image: photoFields, label: t("Campos", "Terras", "Farmland"), number: "01" },
    { image: photoCattle, label: t("Productores", "Produtores", "Farmers"), number: "02" },
    { image: photoServices, label: t("Servicios rurales", "Serviços rurais", "Rural services"), number: "03" },
  ];
  const nav = [
    { symbol: "⌂", label: t("Inicio", "Início", "Home"), href: "/lite" },
    { symbol: "▱", label: t("Campos", "Terras", "Farmland"), href: "/lite/campos" },
    { symbol: "▦", label: t("Servicios", "Serviços", "Services"), href: "/lite/servicios" },
    { symbol: "◯", label: t("Perfil", "Perfil", "Profile"), href: "/lite/perfil" },
  ];

  return (
    <main className="rcLiteSimpleHome">
      <LiteHeader />
      <section className="rcSimpleHero rcSimpleHero--lite" aria-labelledby="rc-lite-simple-title">
        <div className="rcSimpleHero__content">
          <p className="rcSimpleHero__eyebrow">
            <span aria-hidden="true" className="rcSimpleHero__rule" />
            {t("RentoCampo · mercado rural", "RentoCampo · mercado rural", "RentoCampo · rural marketplace")}
          </p>
          <h1 id="rc-lite-simple-title" className="rcSimpleHero__title">
            {t("El campo,", "O campo,", "The countryside,")}
            <span>{t("sin vueltas.", "sem complicações.", "without the hassle.")}</span>
          </h1>
          <p className="rcSimpleHero__description">
            {t("Encontrá campos y servicios rurales. Contactá directamente.", "Encontre terras e serviços rurais. Fale diretamente.", "Find farmland and rural services. Connect directly.")}
          </p>
          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <Link href="/lite/cuenta/registro" className="rcSimpleHero__action rcSimpleHero__action--primary">
              {t("Registrate gratis", "Cadastre-se grátis", "Sign up free")}
              <span aria-hidden="true">↗</span>
            </Link>
            <div className="rcSimpleHero__browse">
              <Link href="/lite/campos" className="rcSimpleHero__action rcSimpleHero__action--secondary">
                {t("Ver campos", "Ver terras", "Browse farmland")}
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/lite/servicios" className="rcSimpleHero__action rcSimpleHero__action--secondary">
                {t("Ver servicios", "Ver serviços", "Browse services")}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="rcSimpleHero__art" aria-label={t("Campos, productores y servicios rurales", "Terras, produtores e serviços rurais", "Farmland, farmers and rural services")}>
          {panels.map((panel, index) => (
            <div className="rcSimpleHero__panel" key={panel.number}>
              <Image
                src={panel.image}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width:520px) 34vw, 170px"
                className="rcSimpleHero__image"
              />
              <div className="rcSimpleHero__photoLabel" aria-hidden="true">
                <span>{panel.number}</span><strong>{panel.label}</strong>
              </div>
            </div>
          ))}
          <div className="rcSimpleHero__artMark" aria-hidden="true">RC / 19</div>
        </div>
      </section>
      <div className="rcSimpleTrust">
        <span>{t("GRATIS", "GRÁTIS", "FREE")}</span>
        <span>{t("SIN INTERMEDIARIOS", "SEM INTERMEDIÁRIOS", "NO MIDDLEMEN")}</span>
        <span>{t("SIN COMISIONES", "SEM COMISSÕES", "NO COMMISSIONS")}</span>
      </div>
      <nav aria-label={t("Navegación Lite", "Navegação Lite", "Lite navigation")} style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 520, display: "grid", gridTemplateColumns: "repeat(4,1fr)",
        background: "#fff", borderTop: "1px solid #e8e8e8",
        padding: "13px 5px max(13px,env(safe-area-inset-bottom))", zIndex: 10,
      }}>
        {nav.map(({ symbol, label, href }) => (
          <Link key={href} href={href} style={{
            display: "grid", justifyItems: "center", gap: 4, color: "#222",
            textDecoration: "none", fontSize: 11, fontWeight: 700,
          }}>
            <span aria-hidden="true" style={{ fontSize: 22 }}>{symbol}</span>{label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
