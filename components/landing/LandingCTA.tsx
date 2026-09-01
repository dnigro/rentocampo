import Link from "next/link";
import BrandWordmark from "@/components/layout/BrandWordmark";

export default function LandingCTA() {
  return (
    <section className="py-14 bg-[#f3f5ee]">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center bg-white border border-green-900/10 rounded-3xl p-8 sm:p-10 shadow-xl">
          <BrandWordmark className="brand-wordmark-cta mb-5" />
          <h2 className="text-4xl lg:text-5xl font-bold text-green-900 mb-4 -tracking-wider">
            ¿Tenés un campo? Hacelo visible hoy.
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
            Publicar es gratis y el contacto con los productores es directo.
          </p>
          <Link
            href="/register?tipo=propietario"
            className="inline-flex items-center justify-center px-8 py-4 bg-green-900 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
          >
            Publicar mi campo gratis
          </Link>
        </div>
      </div>
    </section>
  );
}
