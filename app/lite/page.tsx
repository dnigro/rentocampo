import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import LiteHeader from "@/components/lite/LiteHeader";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import photoFields from "@/public/image_trigo_pix.png";
import photoServices from "@/public/image_truck_pix.png";
import "@/styles/home-simple.css";

export const metadata: Metadata = { title: "RentoCampo Lite | Campos y servicios rurales" };

export default async function LiteHome() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const doors = [
    {
      id: "campos", href: "/lite/campos", image: photoFields,
      label: t("VER CAMPOS", "VER TERRAS", "BROWSE FARMLAND"),
      alt: t("Campo de trigo", "Campo de trigo", "Wheat field"),
    },
    {
      id: "servicios", href: "/lite/servicios", image: photoServices,
      label: t("VER SERVICIOS", "VER SERVIÇOS", "BROWSE SERVICES"),
      alt: t("Maquinaria agrícola trabajando en el campo", "Máquina agrícola trabalhando no campo", "Farm machinery working in the field"),
    },
  ];
  const nav = [
    { symbol: "⌂", label: t("Inicio", "Início", "Home"), href: "/lite" },
    { symbol: "▱", label: t("Campos", "Terras", "Farmland"), href: "/lite/campos" },
    { symbol: "▦", label: t("Servicios", "Serviços", "Services"), href: "/lite/servicios" },
    { symbol: "◯", label: t("Perfil", "Perfil", "Profile"), href: "/lite/perfil" },
  ];

  return (
    <main className="rcLiteDoorsHome">
      <LiteHeader />
      <section className="rcDoorsHero" id="hero" aria-labelledby="rc-lite-doors-title">
        <div className="rcDoorsIntro">
          <p className="rcDoorsEyebrow">
            {t("CAMPOS · PRODUCTORES · SERVICIOS", "TERRAS · PRODUTORES · SERVIÇOS", "FARMLAND · FARMERS · SERVICES")}
          </p>
          <h1 id="rc-lite-doors-title" className="rcDoorsTitle">
            {t("¿Qué buscás", "O que você procura", "What are you looking")}
            <span>{t("en el campo?", "no campo?", "for in the countryside?")}</span>
          </h1>
          <p className="rcDoorsSubtitle">
            {t("Accedé directamente, sin intermediarios.", "Acesse diretamente, sem intermediários.", "Connect directly, without middlemen.")}
          </p>
        </div>
        <nav className="rcDoorsGrid" aria-label={t("Explorar campos o servicios", "Explorar terras ou serviços", "Browse farmland or services")}>
          {doors.map((door, i) => (
            <Link href={door.href} className={"rcDoorsTile rcDoorsTile--" + door.id} key={door.id}>
              <Image src={door.image} alt={door.alt} fill priority={i === 0}
                sizes="(max-width: 520px) 100vw, 520px" className="rcDoorsTileImage" />
              <span className="rcDoorsTileShade" aria-hidden="true" />
              <span className="rcDoorsTileLabel">
                <strong>{door.label}</strong>
                <span className="rcDoorsTileArrow" aria-hidden="true">↗</span>
              </span>
            </Link>
          ))}
        </nav>
        <div className="rcDoorsRegisterWrap">
          <Link href="/lite/cuenta/registro" className="rcDoorsRegister">
            {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <div id="como-funciona" className="rcDoorsTrust">
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span className="rcDoorsTrustDot" aria-hidden="true">·</span>
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
