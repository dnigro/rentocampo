import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/landing-campo-rentocampo.jpg";

export default function LandingHero() {
  return (
    <section
      className="relative min-h-[720px] overflow-hidden flex items-center bg-stone-100"
      id="hero"
    >
      <Image
        src={heroCampo}
        alt="Campo argentino con tractor y silos para producción rural"
        fill
        priority
        placeholder="blur"
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/15" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/55 via-transparent to-black/5" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-end">
          {/* COPY */}
          <div className="lg:col-span-2">
            <div className="max-w-2xl border border-green-900/10 bg-gradient-to-br from-white/95 to-white/88 backdrop-blur-sm rounded-2xl p-7 sm:p-10 lg:p-12 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-green-700 font-bold text-sm uppercase tracking-wider">
                <span>🌾</span>
                Marketplace rural de contacto directo
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-900 leading-tight mb-6 -tracking-wider">
                Publicá tu campo gratis y conectá con productores.
              </h1>

              <p className="text-lg lg:text-2xl text-gray-700 leading-relaxed mb-8 max-w-2xl">
                RentoCampo ayuda a propietarios rurales a hacer visible su tierra para recibir consultas de productores que buscan alquilar campos en Argentina.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-4 bg-green-900 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                >
                  Ir a mi cuenta
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center px-7 py-4 bg-white text-green-900 font-bold rounded-full border border-white shadow-md hover:bg-white/95 transition-all hover:-translate-y-0.5 text-lg"
                >
                  Ver cómo funciona
                </Link>
              </div>

              <ul className="flex flex-wrap gap-4 text-green-900 font-bold text-sm">
                <li>✓ Sin costo de publicación</li>
                <li>✓ Contacto directo</li>
                <li>✓ Vos decidís si avanzar</li>
              </ul>
            </div>
          </div>

          {/* TRUST CARD */}
          <div className="bg-green-950/90 backdrop-blur-sm text-white rounded-2xl p-7 shadow-xl">
            <strong className="block text-2xl leading-tight -tracking-wide mb-3">Tu campo puede ser una nueva oportunidad.</strong>
            <span className="text-white/82 text-base leading-relaxed block">
              Publicar no te compromete a alquilar. Te permite recibir consultas y evaluar interesados con tranquilidad.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
