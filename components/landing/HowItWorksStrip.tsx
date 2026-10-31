"use client";

import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";
import "@/styles/how-it-works.css";

/**
 * Un recorrido de tres pasos, compartido por web, móvil y App Lite.
 * Sin acciones nuevas: reutiliza los flujos de publicación, mapa y mensajes.
 */
export default function HowItWorksStrip({ lite = false }: { lite?: boolean }) {
  const country = useRegionalCountry();
  const t = (es: string, pt: string, en: string) => regionalText(country, es, pt, en);
  const steps = [
    {
      title: t("Explorá o publicá", "Explore ou anuncie", "Explore or post"),
      detail: t("Campos y servicios rurales.", "Terras e serviços rurais.", "Land and rural services."),
    },
    {
      title: t("Conectá por chat", "Converse pelo chat", "Connect by chat"),
      detail: t("Hablá con la otra persona.", "Fale com a outra pessoa.", "Talk directly to the other person."),
    },
    {
      title: t("Acordá directo", "Combine diretamente", "Agree directly"),
      detail: t("Sin intermediarios ni comisión.", "Sem intermediários nem comissão.", "No middlemen or commission."),
    },
  ];

  return (
    <section
      className={`rc-how ${lite ? "rc-how--lite" : "rc-how--web"}`}
      id={lite ? "como-funciona-lite" : "como-funciona"}
      aria-labelledby={lite ? "rc-how-title-lite" : "rc-how-title"}
    >
      <div className="rc-how__inner">
        <div className="rc-how__intro">
          <p className="rc-how__eyebrow">{t("CÓMO FUNCIONA", "COMO FUNCIONA", "HOW IT WORKS")}</p>
          <h2 className="rc-how__title" id={lite ? "rc-how-title-lite" : "rc-how-title"}>
            {t("ASÍ DE SIMPLE.", "SIMPLES ASSIM.", "THAT SIMPLE.")}
          </h2>
        </div>
        <ol className="rc-how__steps">
          {steps.map((step, index) => (
            <li className="rc-how__step" key={index}>
              <span className="rc-how__number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="rc-how__step-copy">
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
