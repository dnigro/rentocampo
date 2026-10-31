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
          <p className="rcSimpleHero__eyebrow">
            {t("CONECTAMOS EL CAMPO", "CONECTAMOS O CAMPO", "CONNECTING THE COUNTRYSIDE")}
          </p>
          <h1 className="rcSimpleHero__title" id="rc-lite-simple-title">
            <span className="rcSimpleHero__lead">{t("SIN", "SEM", "NO")}</span>
            <span className="rcSimpleHero__impact">{t("INTERMEDIARIOS.", "INTERMEDIÁRIOS.", "MIDDLEMEN.")}</span>
          </h1>
          <div className="rcSimpleHero__features">
            <p className="rcSimpleHero__featurePrimary">{t("MAPAS + CHAT ONLINE", "MAPAS + CHAT ONLINE", "MAPS + ONLINE CHAT")}</p>
            <p className="rcSimpleHero__featureSecondary">{t("Productores + Tierra + Servicios", "Produtores + Terras + Serviços", "Farmers + Land + Services")}</p>
          </div>
          <p className="rcSimpleHero__vision">
            {t("Vos publicás. Vos contactás. Vos acordás.", "Você anuncia. Você conversa. Você combina.", "You list. You connect. You agree.")}
          </p>
          <div className="rcSimpleHero__actions" aria-label={t("Accesos principales", "Acessos principais", "Main actions")}>
            <Link href="/lite/cuenta/registro" className="rcSimpleHero__action rcSimpleHero__register">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")} <span aria-hidden="true">→</span>
            </Link>
            <div className="rcSimpleHero__browse">
              <Link href="/lite/campos" className="rcSimpleHero__action rcSimpleHero__browseLink">
                {t("Ver campos", "Ver terras", "Browse farmland")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/lite/servicios" className="rcSimpleHero__action rcSimpleHero__browseLink">
                {t("Ver servicios", "Ver serviços", "Browse services")} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="rcSimpleHero__art" aria-label={t("Tres imágenes del campo", "Três imagens do campo", "Three images from the countryside")}>
          {panels.map((panel, index) => (
            <div className={"rcSimpleHero__panel rcSimpleHero__panel--" + panel.id} key={panel.id}>
              <Image src={panel.image} alt="" fill priority={index === 0}
                sizes="(max-width: 520px) 55vw, 260px" className="rcSimpleHero__image" />
              <span className="rcSimpleHero__photoLabel" aria-hidden="true">{panel.name}</span>
            </div>
          ))}
        </div>
      </section>
      <div id="como-funciona" className="rcSimpleTrust">
        <span><strong>0%</strong> {t("COMISIONES.", "COMISSÕES.", "COMMISSIONS.")}</span>
        <span><strong>100%</strong> {t("CONTACTO DIRECTO.", "CONTATO DIRETO.", "DIRECT CONTACT.")}</span>
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
