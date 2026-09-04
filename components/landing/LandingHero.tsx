import Link from "next/link";
import Image from "next/image";
import heroCampo from "@/public/landing-campo-rentocampo.jpg";

export default function LandingHero() {
  return (
    <section
      className="relative min-h-[700px] overflow-hidden flex items-center bg-[#eee9dc]"
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
      <div className="absolute inset-0 bg-gradient-to-r from-[#f7f2e8]/95 via-[#f7f2e8]/66 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#243d2b]/20 via-transparent to-[#172b20]/10" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-end">
          {/* COPY */}
          <div className="lg:col-span-2">
            <div className="max-w-2xl border border-[#35583d]/15 bg-[#fffdf7]/90 backdrop-blur-md rounded-[28px] p-7 sm:p-10 lg:p-12 shadow-[0_24px_70px_rgba(36,61,43,0.16)]">
              <div className="flex items-center gap-2 mb-6 text-[#9b563b] font-bold text-sm uppercase tracking-[0.14em]">
                <span>🌾</span>
                Marketplace rural de contacto directo
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#24442f] leading-[1.04] mb-6 -tracking-wider">
                Publicá tu campo gratis y conectá con productores.
              </h1>

              <p className="text-lg lg:text-[22px] text-[#505b52] leading-relaxed mb-8 max-w-2xl">
                RentoCampo ayuda a propietarios rurales a hacer visible su tierra para recibir consultas de productores que buscan alquilar campos en Argentina.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-7 py-4 bg-[#b96243] text-white font-bold rounded-full hover:bg-[#9f5036] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
                >
                  Ir a mi cuenta
                </Link>
                <Link
                  href="#como-funciona"
                  className="inline-flex items-center justify-center px-7 py-4 bg-transparent text-[#24442f] font-bold rounded-full border border-[#24442f]/25 hover:bg-white/70 transition-all hover:-translate-y-0.5 text-lg"
                >
                  Ver cómo funciona
                </Link>
              </div>

              <ul className="flex flex-wrap gap-4 text-[#35583d] font-bold text-sm">
                <li>✓ Sin costo de publicación</li>
                <li>✓ Contacto directo</li>
                <li>✓ Vos decidís si avanzar</li>
              </ul>
            </div>
          </div>

          {/* TRUST CARD */}
          <div className="bg-[#24442f]/94 backdrop-blur-sm text-[#fffdf7] rounded-[24px] p-7 shadow-xl border border-white/10">
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
