import Link from "next/link";

const steps = [
  { num: "01", icon: "▤", title: "Publicá", description: "Completá la información de tu campo en pocos minutos." },
  { num: "02", icon: "◎", title: "Conectá", description: "Recibí el interés de productores verificados." },
  { num: "03", icon: "⌁", title: "Hacé crecer tu tierra", description: "Alquilá con confianza y formá parte de una red que impulsa la producción." },
];
export default function LandingComo() {
  return (
    <section className="rc-how" id="como-funciona"><div className="rc-shell">
      <div className="rc-section-head"><p className="rc-kicker">Así de simple</p><h2>03 pasos<br />para alquilar tu campo</h2></div>
      <div className="rc-steps">{steps.map((step) => <article className="rc-step" key={step.num}><span className="rc-step-icon" aria-hidden="true">{step.icon}</span><div className="rc-step-num">{step.num}</div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
      <Link href="/register?tipo=propietario" className="rc-button rc-button-dark">Empezar ahora →</Link>
    </div></section>
  );
}
