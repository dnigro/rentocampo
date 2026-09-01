import Link from "next/link";
import "@/styles/public.css";

export default function ConfirmarEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="confirm-icon">📬</div>
          <h1 className="auth-title">Revisá tu email</h1>
          <p className="auth-subtitle">
            Te enviamos un link de confirmación. Hacé click en el link para
            activar tu cuenta.
          </p>
        </div>

        <div className="confirm-pasos">
          <div className="confirm-paso">
            <span className="paso-num">1</span>
            <span className="paso-texto">Abrí tu casilla de email</span>
          </div>
          <div className="confirm-paso">
            <span className="paso-num">2</span>
            <span className="paso-texto">Buscá el mail de RentoCampo</span>
          </div>
          <div className="confirm-paso">
            <span className="paso-num">3</span>
            <span className="paso-texto">Hacé click en "Confirmar email"</span>
          </div>
        </div>

        <div className="confirm-footer">
          <p>¿No llegó el mail? Revisá la carpeta de spam.</p>
          <Link
            href="/login"
            className="btn-submit"
            style={{
              textAlign: "center",
              textDecoration: "none",
              display: "block",
            }}
          >
            Ya confirmé, ingresar
          </Link>
        </div>
      </div>
    </div>
  );
}
