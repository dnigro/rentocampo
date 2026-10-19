"use client";

import RegionalLink from "@/components/layout/RegionalLink";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

const steps = [
  {
    num: "01",
    title: "Registrate como usuario",
    description: "Creá tu perfil gratis y elegí cómo querés participar.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 37V18l16-9 16 9v19M17 37V25h14v12M5 37h38" />
        <path d="M35 12v-4M31 8h8" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Publicá y chateá online",
    description: "Mostrá tu campo y conversá directamente desde la plataforma.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 10h32v23H22l-9 7v-7H8z" />
        <path d="M15 18h18M15 25h12" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Cerrá un acuerdo",
    description: "Avanzá con el productor o contratista de servicios interesado.",
    icon: (
      <svg viewBox="0 0 48 48" aria-hidden="true">
        <path d="M8 24l10 10L40 12" />
        <circle cx="24" cy="24" r="20" />
      </svg>
    ),
  },
];

export default function LandingComo() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  const stepsBR = [
    ["Cadastre-se como usuário", "Crie seu perfil gratuitamente e escolha como participar."],
    ["Anuncie e converse online", "Apresente sua terra e converse diretamente pela plataforma."],
    ["Feche um acordo", "Negocie diretamente com o interessado."],
  ];
  return (
    <section className="rc-how rc-process" id="como-funciona">
      <div className="rc-shell">
        <header className="rc-process-head">
          <span className="rc-process-total" aria-hidden="true">03</span>
          <div>
            <p className="rc-kicker">{t("Cómo funciona", "Como funciona")}</p>
            <h2>{t("En tres simples pasos.", "Em três passos simples.")}</h2>
          </div>
        </header>

        <div className="rc-process-track">
          {steps.map((step, index) => (
            <article className="rc-process-step" key={step.num}>
              <div className="rc-process-top">
                <span className="rc-process-num">{step.num}</span>
                <span className="rc-process-icon">{step.icon}</span>
              </div>
              <h3>{country === "BR" ? stepsBR[index][0] : step.title}</h3>
              <p>{country === "BR" ? stepsBR[index][1] : step.description}</p>
            </article>
          ))}
        </div>

        <RegionalLink
          href="/register?tipo=propietario"
          className="rc-button rc-button-dark rc-process-cta"
        >
          {t("PUBLICAR GRATIS →", "ANUNCIAR GRATUITAMENTE →")}
        </RegionalLink>
      </div>
    </section>
  );
}
