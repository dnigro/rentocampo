import RegionalLink from "@/components/layout/RegionalLink";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import Link from "next/link";
import "@/styles/footer.css";
import BrandWordmark from "@/components/layout/BrandWordmark";
import { regionalText } from "@/lib/i18n/regional";

export default async function Footer() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <BrandWordmark className="brand-wordmark-footer" />
          </Link>
          <p className="footer-desc">
            {t("Tierra productiva, productores y servicios rurales conectados en toda la región.", "Terras produtivas, produtores e serviços rurais conectados em toda a região.")}
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">{t("Productores", "Produtores")}</h4>
          <nav className="footer-nav">
            <Link href="/alquiler-de-campos" className="footer-link">
              {t("Alquiler de campos", "Arrendamento rural")}
            </Link>
            <Link href="/campos/mapa" className="footer-link">
              Ver mapa
            </Link>
            <RegionalLink href="/register?tipo=productor" fallbackCountry={country} className="footer-link">
              {t("Cómo alquilar", "Como arrendar")}
            </RegionalLink>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">{t("Propietarios", "Proprietários")}</h4>
          <nav className="footer-nav">
            <RegionalLink href="/register?tipo=propietario" fallbackCountry={country} className="footer-link">
              {t("Publicar un campo", "Anunciar terra")}
            </RegionalLink>
            <Link href="/mis-campos" className="footer-link">
              {t("Panel del propietario", "Painel do proprietário")}
            </Link>
            <RegionalLink href="/register?tipo=propietario" fallbackCountry={country} className="footer-link">
              {t("Cómo publicar", "Como anunciar")}
            </RegionalLink>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title">{t("Servicios rurales", "Serviços rurais")}</h4>
          <nav className="footer-nav">
            <Link href="/servicios-rurales" className="footer-link">
              {t("Buscar servicios", "Buscar serviços")}
            </Link>
            <Link href="/campos/mapa?vista=servicios" className="footer-link">
              {t("Ver mapa de servicios", "Ver mapa de serviços")}
            </Link>
            <RegionalLink href="/register?tipo=prestador" fallbackCountry={country} className="footer-link">
              {t("Ofrecer mis servicios", "Oferecer meus serviços")}
            </RegionalLink>
            <a href="mailto:hola@rentocampo.com" className="footer-link">
              hola@rentocampo.com
            </a>
            <span className="footer-link">{t("Red regional de servicios rurales", "Rede regional de serviços rurais")}</span>
          </nav>
          <div className="footer-socials" aria-label="Redes sociales">
            <a
              href="https://www.instagram.com/rento_campo/"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Instagram de RentoCampo"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61593397379391"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Facebook @rentocampo"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                aria-hidden="true"
                fill="currentColor"
              >
                <path d="M14 8h3V4.2c-.5-.1-2.2-.2-4.1-.2C9 4 6.3 6.4 6.3 10.8V14H3v4.3h3.3V24h4.1v-5.7h3.4L14.4 14h-4v-2.8C10.4 9.9 10.8 8 14 8Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} RentoCampo. {t("Todos los derechos reservados.", "Todos os direitos reservados.")}
        </span>
        <nav className="footer-bottom-links" aria-label="Información legal">
          <Link href="/terminos-y-condiciones" className="footer-bottom-link">
            {t("Términos y condiciones", "Termos e condições")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
