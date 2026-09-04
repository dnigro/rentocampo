"use client";
import { useState } from "react";
const faqs = [
  ["¿Publicar tiene costo?", "No. Publicar tu campo es gratis en esta etapa de RentoCampo."],
  ["¿Quién puede registrarse?", "Propietarios que publican campos y productores que buscan oportunidades. Un usuario puede tener ambos perfiles."],
  ["¿RentoCampo interviene en el acuerdo?", "Facilitamos el contacto directo; las condiciones las definen las partes."],
  ["¿Cómo me contactan?", "Los productores interesados pueden enviarte una consulta directa desde la publicación."],
];
export default function LandingFAQ() {
  const [open, setOpen] = useState(0);
  return <section className="rc-faq" id="preguntas"><div className="rc-shell rc-faq-grid"><div><p className="rc-kicker">Preguntas frecuentes</p><h2>Todo claro.<br />Desde el inicio.</h2></div><div>{faqs.map(([q,a], i) => <div className="rc-question" key={q}><button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><span>{open === i ? "−" : "+"}</span></button>{open === i && <p>{a}</p>}</div>)}</div></div></section>;
}
