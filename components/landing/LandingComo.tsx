import Link from "next/link";

export default function LandingComo() {
  const steps = [
    {
      num: "01",
      title: "Creás tu cuenta",
      description: "Registro simple para identificar al propietario y empezar la publicación.",
    },
    {
      num: "02",
      title: "Cargás el campo",
      description: "Ubicación, superficie, tipo de uso, fotos, mejoras y datos principales.",
    },
    {
      num: "03",
      title: "Recibís consultas",
      description: "Productores interesados te contactan directo para evaluar la oportunidad.",
    },
  ];

  return (
    <section className="py-16 lg:py-20 bg-white" id="como-funciona">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-sm uppercase tracking-wide mb-4">
            <span>⚙️</span>
            Cómo funciona
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-green-900 -tracking-wider">
            Publicá gratis. Conectá directo. Vos decidís.
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Sin comisiones ni intermediarios obligatorios: tres pasos para hacer visible tu campo.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="min-h-56 p-8 rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all group"
            >
              {/* Decorative circle */}
              <div className="absolute -right-10 -bottom-15 w-44 h-44 bg-green-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="text-green-800 font-bold text-sm tracking-widest mb-8">{step.num}</div>
                <h3 className="text-2xl font-bold text-green-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/register?tipo=propietario" className="inline-flex rounded-full bg-orange-500 px-7 py-3.5 font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-600">
            Publicar mi campo →
          </Link>
        </div>
      </div>
    </section>
  );
}
