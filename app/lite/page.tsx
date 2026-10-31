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
    { image: photoFields, name: t("Campos", "Terras", "Farmland"), id: "fields" },
    { image: photoCattle, name: t("Productores", "Produtores", "Farmers"), id: "producers" },
    { image: photoServices, name: t("Servicios rurales", "Serviços rurais", "Rural services"), id: "services" },
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
      <section className="rcSimpleHero rcSimpleHero--lite" id="hero" aria-labelledby="rc-lite-simple-title">
        <div className="rcSimpleHero__content">
          <h1 id="rc-lite-simple-title" className="rcSimpleHero__title">
            <span>{t("SIN", "SEM", "NO")}</span>
            <strong>{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</strong>
          </h1>
          <div className="rcSimpleHero__features">
            <p className="rcSimpleHero__featurePrimary">{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}</p>
            <p className="rcSimpleHero__featureSecondary">{t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços", "Farmers + Land + Services")}</p>
          </div>
          <nav className="rcSimpleHero__actions" aria-label={t("Explorar o registrarse", "Explorar ou cadastrar-se", "Explore or sign up")}>
            <Link href="/lite/cuenta/registro" className="rcSimpleHero__register">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")} <span aria-hidden="true">→</span>
            </Link>
            <div className="rcSimpleHero__browse">
              <Link href="/lite/campos" className="rcSimpleHero__browseLink">
                {t("Ver campos", "Ver terras", "Browse farmland")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/lite/servicios" className="rcSimpleHero__browseLink">
                {t("Ver servicios", "Ver serviços", "Browse services")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </nav>
        </div>
        <div className="rcSimpleHero__art" role="img" aria-label={t("Tríptico rural de campos, productores y servicios", "Tríptico rural de terras, produtores e serviços", "Rural photographs of farmland, farmers and services")}>
          {panels.map((panel, i) => (
            <div className={"rcSimpleHero__panel rcSimpleHero__panel--" + i} key={panel.id}>
              <Image src={panel.image} alt="" fill priority={i === 0}
                sizes="(max-width:520px) 45vw, 260px" className="rcSimpleHero__image" />
              <span className="rcSimpleHero__photoLabel" aria-hidden="true">{panel.name}</span>
            </div>
          ))}
        </div>
      </section>
      <div id="como-funciona" className="rcSimpleTrust">
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span aria-hidden="true">·</span>
        <span>{t("100% CONTACTO DIRECTO", "100% CONTATO DIRETO", "100% DIRECT CONTACT")}</span>
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
