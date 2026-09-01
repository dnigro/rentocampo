import Link from "next/link";
import "@/styles/footer.css";
import BrandWordmark from "@/components/layout/BrandWordmark";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Logo y descripción */}
        <div className="footer-brand">
          <Link href="/" className="footer-logo">
            <BrandWordmark className="brand-wordmark-footer" />
          </Link>
          <p className="footer-desc">
            El marketplace que conecta propietarios de tierras con productores
            en toda Argentina.
          </p>
        </div>

        {/* Productores */}
        <div className="footer-col">
          <h4 className="footer-col-title">Productores</h4>
          <nav className="footer-nav">
            <Link href="/campos" className="footer-link">
              Explorar campos
            </Link>
            <Link href="/campos/mapa" className="footer-link">
              Ver mapa
            </Link>
            <Link href="/register?tipo=productor" className="footer-link">
              Cómo alquilar
            </Link>
          </nav>
        </div>

        {/* Propietarios */}
        <div className="footer-col">
          <h4 className="footer-col-title">Propietarios</h4>
          <nav className="footer-nav">
            <Link href="/register?tipo=propietario" className="footer-link">
              Publicar un campo
            </Link>
            <Link href="/mis-campos" className="footer-link">
              Panel del propietario
            </Link>
            <Link href="/register?tipo=propietario" className="footer-link">
              Cómo publicar
            </Link>
          </nav>
        </div>

        {/* Contacto */}
        <div className="footer-col">
          <h4 className="footer-col-title">Contacto</h4>
          <nav className="footer-nav">
            <a href="mailto:hola@rentocampo.com" className="footer-link">
              hola@rentocampo.com
            </a>
            <span className="footer-link">Buenos Aires, Argentina</span>
          </nav>
          <div className="footer-socials" aria-label="Redes sociales">
            <a
              href="https://www.instagram.com/rento_campo/"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Instagram de RentoCampo"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61593397379391"
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
              aria-label="Facebook @rentocampo"
            >
              Facebook · @rentocampo
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} RentoCampo. Todos los derechos
          reservados.
        </span>
      </div>
    </footer>
  );
}
