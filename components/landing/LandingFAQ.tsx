"use client";

import { useState } from "react";

const faqs = [
  {
    q: "¿Publicar mi campo tiene costo?",
    a: "No. La publicación es gratis en esta etapa de RentoCampo.",
  },
  {
    q: "¿Estoy obligado a alquilar si recibo consultas?",
    a: "No. Publicar solo te ayuda a recibir interesados. Vos decidís si hablás, negociás o avanzás.",
  },
  {
    q: "¿RentoCampo interviene en el acuerdo?",
    a: "RentoCampo facilita el contacto. Las condiciones del alquiler las definen las partes.",
  },
  {
    q: "¿Qué datos necesito para publicar?",
    a: "Provincia, ubicación aproximada, hectáreas, tipo de uso, fotos y características principales del campo.",
  },
];

export default function LandingFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="py-20 bg-gray-50 border-t border-gray-200" id="preguntas">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm uppercase tracking-wide mb-4">
              <span>❓</span>
              Preguntas frecuentes
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-green-900 -tracking-wider">
              Claridad antes de publicar.
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpen(open === i ? -1 : i)}
                  className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-green-900 text-left">{faq.q}</span>
                  <span className={`text-2xl transition-transform ${open === i ? "rotate-180" : ""}`}>▼</span>
                </button>
                {open === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
