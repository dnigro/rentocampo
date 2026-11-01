"use client";

import RegionalLink from "@/components/layout/RegionalLink";
import Link from "next/link";
import { Tractor, House, Sprout, Mail } from "lucide-react";
import "@/styles/footer.css";
import BrandWordmark from "@/components/layout/BrandWordmark";
import { regionalText } from "@/lib/i18n/regional";
import { useRegionalCountry } from "@/lib/i18n/useRegionalCountry";

export default function Footer() {
  const country = useRegionalCountry();
  const t = (es: string, pt: string) => regionalText(country, es, pt);
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <BrandWordmark className="brand-wordmark-footer" />
          </Link>
          <p className="footer-desc">
            {t("Tierra, productores y servicios rurales conectados en la región.", "Terras, produtores e serviços rurais conectados na região.")}
          </p>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title"><Tractor aria-hidden="true" />{t("Productores", "Produtores")}</h4>
          <nav className="footer-nav">
            <Link href="/alquiler-de-campos" className="footer-link">
              {t("Alquiler de campos", "Arrendamento rural")}
            </Link>
            <Link href="/campos/mapa" className="footer-link">
              {t("Ver mapa", "Ver mapa")}
            </Link>
            <RegionalLink href="/register?tipo=productor" fallbackCountry={country} className="footer-link">
              {t("Cómo alquilar", "Como arrendar")}
            </RegionalLink>
          </nav>
        </div>

        <div className="footer-col">
          <h4 className="footer-col-title"><House aria-hidden="true" />{t("Propietarios", "Proprietários")}</h4>
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

        <div className="footer-col footer-col--services">
          <h4 className="footer-col-title"><Sprout aria-hidden="true" />{t("Servicios rurales", "Serviços rurais")}</h4>
          <nav className="footer-nav footer-nav--services">
            <Link href="/servicios-rurales" className="footer-link">{t("Buscar servicios", "Buscar serviços")}</Link>
            <Link href="/campos/mapa?vista=servicios" className="footer-link">{t("Ver mapa de servicios", "Ver mapa de serviços")}</Link>
            <RegionalLink href="/register?tipo=prestador" fallbackCountry={country} className="footer-link">
              {t("Ofrecer mis servicios", "Oferecer meus serviços")}
            </RegionalLink>
          </nav>
        </div>

        <div className="footer-col footer-col--contact">
          <h4 className="footer-col-title"><Mail aria-hidden="true" />{t("Contacto", "Contato")}</h4>
          <nav className="footer-nav">
            <Link href="/alianzas" className="footer-link">{t("Alianzas rurales", "Parcerias rurais")}</Link>
            <a href="mailto:hola@rentocampo.com" className="footer-link">hola@rentocampo.com</a>
          </nav>
          <div className="footer-socials" aria-label="Redes sociales">
            <a href="https://www.instagram.com/rento_campo/" target="_blank" rel="noopener noreferrer" className="footer-social-link"
              aria-label="Instagram de RentoCampo (se abre en una nueva pestaña)" title="Instagram · RentoCampo">
              <svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5.25" />
                <circle cx="12" cy="12" r="4.15" />
                <circle cx="17.6" cy="6.5" r="1.15" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61594630832899" target="_blank" rel="noopener noreferrer" className="footer-social-link"
              aria-label="Facebook de RentoCampo (se abre en una nueva pestaña)" title="Facebook · RentoCampo">
              <svg viewBox="0 0 24 24" width="27" height="27" fill="currentColor" aria-hidden="true">
                <path d="M13.65 21v-8h2.7l.43-3.2h-3.13V7.75c0-.93.26-1.55 1.6-1.55h1.67V3.34a23 23 0 0 0-2.45-.13c-2.43 0-4.1 1.49-4.1 4.23V9.8H7.65V13h2.72v8h3.28Z" />
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
