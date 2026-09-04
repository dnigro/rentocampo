import Link from "next/link";

const steps = [
  { num: "01", title: "Cargá", description: "Sumá ubicación, superficie, fotos y los datos clave de tu campo." },
  { num: "02", title: "Publicá", description: "Hacelo visible gratis para productores de toda Argentina." },
  { num: "03", title: "Conectá", description: "Recibí consultas directas y elegí con quién avanzar." },
];
export default function LandingComo() {
  return (
    <section className="rc-how" id="como-funciona"><div className="rc-shell">
      <div className="rc-section-head"><p className="rc-kicker">Así de simple</p><h2>03 pasos.<br />Una oportunidad.</h2></div>
      <div className="rc-steps">{steps.map((step) => <article className="rc-step" key={step.num}><div className="rc-step-num">{step.num}</div><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
      <Link href="/register?tipo=propietario" className="rc-button rc-button-dark">Empezar ahora →</Link>
    </div></section>
  );
}
