export default function LandingConfianza() {
  const features = [
    {
      icon: "💰",
      title: "Publicación gratis",
      description:
        "Podés publicar tu campo sin pagar alta, comisiones ni costos por aparecer en la plataforma.",
    },
    {
      icon: "📱",
      title: "Contacto directo",
      description:
        "Los productores interesados pueden consultarte desde el sitio. Vos elegís con quién conversar.",
    },
    {
      icon: "✅",
      title: "Sin compromiso",
      description:
        "Publicar no significa cerrar un alquiler. Primero recibís consultas y después decidís si avanzar.",
    },
  ];

  return (
    <section className="py-20 bg-white" id="confianza">
      <div className="max-w-7xl mx-auto px-5">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-sm uppercase tracking-wide mb-4">
            <span>🛡️</span>
            Confianza para propietarios
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-green-900 mb-4 -tracking-wider">
            Mostrá tu campo de forma simple y clara.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            RentoCampo no reemplaza tu decisión. Te ayuda a ordenar el primer contacto entre quien tiene tierra disponible y quien busca producir.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-700 to-green-600 text-white flex items-center justify-center text-3xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-green-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
