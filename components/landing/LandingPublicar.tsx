import Link from "next/link";
import BrandWordmark from "@/components/layout/BrandWordmark";

export default function LandingPublicar() {
  return (
    <section className="py-20 bg-white border-t border-b border-gray-200" id="publicar">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* COPY */}
          <div>
            <div className="flex items-center gap-2 text-green-700 font-bold text-sm uppercase tracking-wide mb-4">
              <span>📝</span>
              Publiquemos tu campo
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-green-900 mb-4 -tracking-wider">
              Accedé a tu cuenta y comenzá a recibir consultas de productores.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              En tu panel podés crear y gestionar la publicación de tu campo, ver los productores interesados, y comunicarte directamente con ellos.
            </p>

            <div className="space-y-3">
              {[
                { num: "1", text: "Accedés a tu cuenta." },
                { num: "2", text: "Cargás los datos de tu campo." },
                { num: "3", text: "Recibís consultas de productores interesados." },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-green-50 border border-green-900/10">
                  <strong className="text-green-900 text-lg">{item.num}.</strong>
                  <span className="text-green-900 font-semibold">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FORM CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg text-center">
            <div className="flex justify-center mb-6">
              <BrandWordmark className="brand-wordmark-cta" />
            </div>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed max-w-sm mx-auto">
              ¿Ya tenés una cuenta? Accedé ahora y gestiona tus campos desde tu panel privado.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-green-900 text-white font-bold rounded-full hover:bg-green-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
            >
              Ir a mi cuenta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
