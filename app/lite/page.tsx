import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import LiteHeader from "@/components/lite/LiteHeader";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import landscape from "@/public/hero-campo.jpeg";
import "@/styles/home-simple.css";

export const metadata: Metadata = { title: "RentoCampo Lite | Campos y servicios rurales" };

export default async function LiteHome() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const nav = [
    { symbol: "⌂", label: t("Inicio", "Início", "Home"), href: "/lite" },
    { symbol: "▱", label: t("Campos", "Terras", "Farmland"), href: "/lite/campos" },
    { symbol: "▦", label: t("Servicios", "Serviços", "Services"), href: "/lite/servicios" },
    { symbol: "◯", label: t("Perfil", "Perfil", "Profile"), href: "/lite/perfil" },
  ];

  return (
    <main className="rcLiteManifesto rcManifesto">
      <LiteHeader />
      <section className="rcManifestoHero" id="hero" aria-labelledby="rc-lite-manifesto-title">
        <div className="rcManifestoCopy">
          <p className="rcManifestoKicker">
            {t("CAMPOS / SERVICIOS / CONTACTO DIRECTO",
               "TERRAS / SERVIÇOS / CONTATO DIRETO",
               "FARMLAND / SERVICES / DIRECT CONTACT")}
          </p>
          <h1 id="rc-lite-manifesto-title" className="rcManifestoTitle">
            <span>{t("EL CAMPO", "O CAMPO", "THE LAND")}</span>
            <strong>{t("NO ESPERA.", "NÃO ESPERA.", "DOESN'T WAIT.")}</strong>
          </h1>
          <p className="rcManifestoDescription">
            {t(
              "Encontrá campos y servicios rurales. Hablá directo, sin intermediarios ni comisiones.",
              "Encontre terras e serviços rurais. Fale diretamente, sem intermediários nem comissões.",
              "Find farmland and rural services. Connect directly, without middlemen or commissions."
            )}
          </p>
          <nav className="rcManifestoActions" aria-label={t("Explorar o registrarse", "Explorar ou cadastrar-se", "Browse or sign up")}>
            <Link href="/lite/campos" className="rcManifestoButton rcManifestoButton--primary">
              {t("EXPLORAR CAMPOS", "EXPLORAR TERRAS", "EXPLORE FARMLAND")}
            </Link>
            <Link href="/lite/servicios" className="rcManifestoButton rcManifestoButton--secondary">
              {t("VER SERVICIOS", "VER SERVIÇOS", "BROWSE SERVICES")}
            </Link>
            <Link href="/lite/cuenta/registro" className="rcManifestoButton rcManifestoButton--tertiary">
              {t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS", "SIGN UP FREE")}
            </Link>
          </nav>
        </div>
        <div className="rcManifestoVisual">
          <Image
            src={landscape}
            alt={t("Paisaje rural con campos abiertos", "Paisagem rural com terras abertas", "Rural landscape with open fields")}
            fill
            priority
            sizes="(max-width:520px) 100vw, 520px"
            className="rcManifestoVisualImage"
          />
          <div className="rcManifestoVisualEdge" aria-hidden="true" />
          <span className="rcManifestoVisualCaption" aria-hidden="true">
            R / C — {t("TIERRA & CONEXIÓN", "TERRA & CONEXÃO", "LAND & CONNECTION")}
          </span>
        </div>
      </section>
      <div id="como-funciona" className="rcManifestoTrust">
        <span>{t("SIN INTERMEDIARIOS", "SEM INTERMEDIÁRIOS", "NO MIDDLEMEN")}</span>
        <span>{t("0% COMISIONES", "0% COMISSÕES", "0% COMMISSIONS")}</span>
        <span>{t("CONTACTO DIRECTO", "CONTATO DIRETO", "DIRECT CONTACT")}</span>
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
