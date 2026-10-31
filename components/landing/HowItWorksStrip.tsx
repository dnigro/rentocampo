"use client";

import { MapPinned, MessageCircleMore, Handshake } from "lucide-react";
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
      icon: MapPinned,
      detail: t("Campos y servicios.", "Terras e serviços.", "Land and services."),
    },
    {
      title: t("Conectá por chat", "Converse pelo chat", "Connect by chat"),
      icon: MessageCircleMore,
      detail: t("Hablá directo.", "Converse direto.", "Talk directly."),
    },
    {
      title: t("Acordá directo", "Combine diretamente", "Agree directly"),
      icon: Handshake,
      detail: t("Sin comisión.", "Sem comissão.", "No commission."),
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
            {t("Tres pasos, contacto directo.", "Três passos, contato direto.", "Three steps, direct contact.")}
          </h2>
        </div>
        <ol className="rc-how__steps" tabIndex={0} aria-label={t("Tres pasos para usar RentoCampo", "Três passos para usar a RentoCampo", "Three steps to use RentoCampo")}>
          {steps.map((step, index) => (
            <li className="rc-how__step" key={index}>
              <div className="rc-how__symbol" aria-hidden="true">
                <step.icon className="rc-how__icon" strokeWidth={1.75} />
                <span className="rc-how__number">{String(index + 1).padStart(2, "0")}</span>
              </div>
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
