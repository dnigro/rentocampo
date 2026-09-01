"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import "@/styles/public.css";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const origin = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`,
    });

    if (error) {
      setError(
        "No pudimos enviar el email. Verificá que la dirección sea correcta.",
      );
      setLoading(false);
      return;
    }

    setEnviado(true);
    setLoading(false);
  }

  if (enviado) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="confirm-icon">📬</div>
            <h1 className="auth-title">Revisá tu email</h1>
            <p className="auth-subtitle">
              Te enviamos un link para restablecer tu contraseña a{" "}
              <strong>{email}</strong>
            </p>
          </div>
          <div className="confirm-pasos">
            <div className="confirm-paso">
              <span className="paso-num">1</span>
              <span className="paso-texto">Abrí tu casilla de email</span>
            </div>
            <div className="confirm-paso">
              <span className="paso-num">2</span>
              <span className="paso-texto">
                Hacé click en &quot;Restablecer contraseña&quot;
              </span>
            </div>
            <div className="confirm-paso">
              <span className="paso-num">3</span>
              <span className="paso-texto">Ingresá tu nueva contraseña</span>
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
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Recuperar contraseña</h1>
          <p className="auth-subtitle">
            Ingresá tu email y te enviamos un link para crear una nueva
            contraseña
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperación"}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/login">← Volver al login</Link>
        </div>
      </div>
    </div>
  );
}
