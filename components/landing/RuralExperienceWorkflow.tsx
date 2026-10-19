import { ArrowRight, FilePlus2, MapPinned, MessagesSquare, UserRoundPlus } from "lucide-react";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";

/**
 * Explica en cuatro pasos la experiencia gratuita del marketplace.
 * Componente común a web, móvil y App Lite (ES + PT-BR).
 */
export default function RuralExperienceWorkflow({ country }: { country: CountryCode }) {
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  const steps = [
    { Icon: UserRoundPlus, title: t("Registrate", "Cadastre-se"), detail: t("Creá tu cuenta gratis.", "Crie sua conta grátis.") },
    { Icon: MapPinned, title: t("Explorá", "Explore"), detail: t("Buscá en el mapa.", "Busque no mapa.") },
    { Icon: FilePlus2, title: t("Publicá", "Anuncie"), detail: t("Sumá campos o servicios.", "Anuncie terras ou serviços.") },
    { Icon: MessagesSquare, title: t("Conectá", "Conecte-se"), detail: t("Contactá directamente.", "Entre em contato direto.") },
  ];
  return (
    <section className="triptychHero__journey" aria-label={t("Cómo funciona RentoCampo", "Como funciona a RentoCampo")}>
      <h2>{t("Encontrá, publicá y conectá con el campo.", "Encontre, anuncie e conecte-se com o campo.")}</h2>
      <p>{t("Una experiencia simple para productores, propietarios y servicios rurales.", "Uma experiência simples para produtores, proprietários e serviços rurais.")}</p>
      <ol>
        {steps.map(({ Icon, title, detail }, index) => (
          <li key={index}>
            <span className="triptychHero__journeyIcon"><Icon size={25} strokeWidth={1.9} aria-hidden="true" /></span>
            <strong>{title}</strong>
            <small>{detail}</small>
            {index < steps.length - 1 && <ArrowRight className="triptychHero__journeyArrow" size={17} aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
