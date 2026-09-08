"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Email o contraseña incorrectos."
          : error.message,
      );
      setLoading(false);
      return;
    }

    // Una navegación completa garantiza que la cookie de Supabase ya esté
    // disponible para Proxy y los Server Components protegidos.
    const next = new URLSearchParams(window.location.search).get("next");
    const destino = next?.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";
    window.location.assign(destino);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Bienvenido de vuelta</h1>
          <p className="auth-subtitle">Ingresá a tu cuenta de RentoCampo</p>
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

          <div className="form-field">
            <div className="form-label-row">
              <label className="form-label" htmlFor="password">
                Contraseña
              </label>
              <Link href="/recuperar-contrasena" className="form-label-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c5.2 0 9.4 4.2 10 8-0.3 1.8-1.5 3.7-3.2 5.1M6.6 6.6C4.6 8 3.2 10.1 2 12c0.8 3.8 5 8 10 8 1.4 0 2.8-0.3 4-0.8" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2 12s3.6-8 10-8 10 8 10 8-3.6 8-10 8S2 12 2 12Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tenés cuenta? <Link href="/register">Registrate gratis</Link>
        </div>
      </div>
    </div>
  );
}
