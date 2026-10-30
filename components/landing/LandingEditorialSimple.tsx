"use client";

import Image from "next/image";
import RegionalLink from "@/components/layout/RegionalLink";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import { regionalText } from "@/lib/i18n/regional";
import fieldsPhoto from "@/public/image_eol_pix.png";
import servicesPhoto from "@/public/image_truck_pix.png";

export default function LandingEditorialSimple() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  const paths = [
    { num: "01", title: t("Propietarios", "Proprietários"), text: t("Publicá tu campo gratis.", "Anuncie sua terra gratuitamente."), href: "/register?tipo=propietario", },
    { num: "02", title: t("Productores", "Produtores"), text: t("Encontrá campos para producir.", "Encontre terras para produzir."), href: "/campos", },
    { num: "03", title: t("Servicios rurales", "Serviços rurais"), text: t("Ofrecé tus servicios en la región.", "Ofereça seus serviços na região."), href: "/register?tipo=prestador", },
  ];
  return <main className="rc-simple">
    <section className="rc-simple-hero" aria-labelledby="rc-simple-title">
      <Image src={fieldsPhoto} alt="" fill priority sizes="100vw" className="rc-simple-hero-photo" />
      <div className="rc-simple-hero-copy">
        <p className="rc-simple-kicker">{country === "US" ? "UNITED STATES" : country === "AR" ? "ARGENTINA" : "RENTOCAMPO"} <span className="rc-simple-flag">{country === "US" ? "🇺🇸" : country === "AR" ? "🇦🇷" : "🌎"}</span></p>
        <h1 id="rc-simple-title">{t("Campos que producen", "Terras que geram")}<br/><span>{t("oportunidades.", "oportunidades.")}</span></h1>
        <p className="rc-simple-lead">{t("Propietarios, productores y servicios rurales.", "Proprietários, produtores e serviços rurais.")}<br/>{t("Contacto directo, sin comisiones.", "Contato direto, sem comissões.")}</p>
        <div className="rc-simple-actions">
          <RegionalLink href="/campos" className="rc-simple-button rc-simple-button-primary">{t("Buscar campos", "Buscar terras")} <span aria-hidden="true">↗</span></RegionalLink>
          <RegionalLink href="/register" className="rc-simple-button rc-simple-button-light">{t("Publicar gratis", "Anunciar grátis")} <span aria-hidden="true">+</span></RegionalLink>
        </div>
      </div>
      <div className="rc-simple-hero-caption" aria-hidden="true">RENTOCAMPO <span> / </span> {t("LA RED DEL CAMPO", "A REDE DO CAMPO")}</div>
    </section>

    <section className="rc-simple-paths" id="como-funciona" aria-label={t("Elegí cómo participar", "Escolha como participar")}>
      {paths.map((p) => <RegionalLink key={p.num} href={p.href} className="rc-simple-path">
        <span className="rc-simple-path-num">{p.num}</span>
        <h2>{p.title}</h2><p>{p.text}</p><span className="rc-simple-arrow" aria-hidden="true">↗</span>
      </RegionalLink>)}
    </section>

    <section className="rc-simple-map" id="visibilidad">
      <div className="rc-simple-map-copy">
        <p className="rc-simple-kicker">{t("EXPLORÁ OPORTUNIDADES", "EXPLORE OPORTUNIDADES")}</p>
        <h2>{t("Campos y servicios", "Terras e serviços")}<br/>{t("en un solo mapa.", "em um só mapa.")}</h2>
        <p>{t("Elegí tu país, explorá la región y contactá directamente.", "Escolha seu país, explore a região e converse diretamente.")}</p>
        <RegionalLink href="/campos/mapa" className="rc-simple-button rc-simple-button-primary">{t("Ver mapa", "Ver mapa")} <span aria-hidden="true">↗</span></RegionalLink>
      </div>
      <div className="rc-simple-map-photo rc-simple-video"><video autoPlay muted playsInline loop preload="metadata" aria-label={t("Video de tractor y actividad rural de RentoCampo", "Vídeo de trator e atividade rural da RentoCampo")}><source src="/RentoCampo_video_real_dron_tractor_silos_mar_16x9.mp4.mp4#t=2" type="video/mp4" /></video><span className="rc-simple-video-label">RENTOCAMPO / {t("EL CAMPO EN MOVIMIENTO", "O CAMPO EM MOVIMENTO")}</span></div>
    </section>

    <section className="rc-simple-proof">
      <div><strong>{t("Contacto directo", "Contato direto")}</strong><span>{t("Chat entre usuarios", "Chat entre usuários")}</span></div>
      <div><strong>100% {t("gratis", "grátis")}</strong><span>{t("Sin comisiones", "Sem comissões")}</span></div>
      <div><strong>{t("Tu región", "Sua região")}</strong><span>{t("Campos y servicios", "Terras e serviços")}</span></div>
    </section>

    <section className="rc-simple-end">
      <div><p className="rc-simple-kicker">RENTOCAMPO</p><h2>{t("Tierra, personas", "Terra, pessoas")}<br/>{t("y oportunidades.", "e oportunidades.")}</h2></div>
      <RegionalLink href="/register" className="rc-simple-button rc-simple-button-light">{t("Crear mi cuenta", "Criar minha conta")} <span aria-hidden="true">↗</span></RegionalLink>
    </section>
  </main>;
}
