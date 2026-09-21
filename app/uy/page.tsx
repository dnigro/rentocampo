import type { Metadata } from "next";
import Link from "next/link";
import BrandWordmark from "@/components/layout/BrandWordmark";
import { COUNTRIES } from "@/lib/countries";
import "@/styles/country-preview.css";

const country = COUNTRIES.UY;

export const metadata: Metadata = {
  title: "RentoCampo Uruguay | Tierra y servicios rurales",
  description:
    "Preview de RentoCampo Uruguay: campos, productores y servicios rurales conectados en una misma plataforma.",
  alternates: { canonical: "https://rentocampo.com/uy" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "RentoCampo Uruguay",
    description:
      "Campos, productores y servicios rurales de Uruguay en una misma plataforma.",
    locale: "es_UY",
    type: "website",
  },
};

export default function UruguayPreviewPage() {
  return (
    <main className="country-preview">
      <header className="country-preview-header">
        <Link href="/uy" className="country-preview-brand">
          <BrandWordmark />
        </Link>

        <nav className="country-switcher" aria-label="País">
          <Link href="/" className="country-pill">
            <span>🇦🇷</span> Argentina
          </Link>
          <span className="country-pill country-pill-active">
            <span>{country.flag}</span> Uruguay
          </span>
        </nav>
      </header>

      <section className="country-preview-hero">
        <div className="country-preview-copy">
          <p className="country-preview-eyebrow">{country.heroEyebrow}</p>
          <h1>{country.heroTitle}</h1>
          <p className="country-preview-lead">{country.heroDescription}</p>

          <div className="country-preview-actions">
            <button type="button" className="country-cta country-cta-primary">
              Publicar campo gratis
            </button>
            <button type="button" className="country-cta country-cta-secondary">
              Explorar Uruguay
            </button>
          </div>

          <p className="country-preview-note">
            {country.serviceLine}
          </p>
        </div>

        <aside className="country-preview-market">
          <div className="market-number">UY</div>
          <p className="market-label">Mercado</p>
          <h2>Uruguay</h2>
          <dl>
            <div>
              <dt>Moneda</dt>
              <dd>{country.currency}</dd>
            </div>
            <div>
              <dt>División</dt>
              <dd>{country.subdivisionLabel}</dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>{country.locale}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="country-preview-steps">
        <article>
          <span>01</span>
          <h3>Tierra productiva</h3>
          <p>Publicaciones organizadas por departamento y localidad.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Productores</h3>
          <p>Contacto directo, mapa y búsqueda adaptada al mercado uruguayo.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Servicios rurales</h3>
          <p>Contratistas y prestadores con cobertura por zona.</p>
        </article>
      </section>

      <section className="country-preview-billing">
        <div>
          <p className="country-preview-eyebrow">Arquitectura multipaís</p>
          <h2>Una sola base. Cada país con sus reglas.</h2>
        </div>
        <div className="billing-grid">
          <span>🇦🇷 ARS · Provincia · es-AR</span>
          <span>🇺🇾 UYU · Departamento · es-UY</span>
          <span>Pagos configurables por mercado</span>
          <span>Copy y SEO local por país</span>
        </div>
      </section>

      <footer className="country-preview-footer">
        <BrandWordmark />
        <span>Preview interno · RentoCampo Uruguay</span>
      </footer>
    </main>
  );
}
