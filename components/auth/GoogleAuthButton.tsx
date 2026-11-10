"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { mode: "login" | "register"; country?: string; acceptedTerms?: boolean };

export default function GoogleAuthButton({ mode, acceptedTerms = false }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    if (mode === "register" && !acceptedTerms) {
      setError("Para crear tu cuenta con Google, primero aceptá los términos y condiciones.");
      return;
    }
    setBusy(true);
    setError("");
    const next = mode === "register" ? "/perfil?elegir=rol" : "/dashboard";
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);
    try {
    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      },
    });
    if (authError) {
      setError("No pudimos iniciar sesión con Google. Probá nuevamente o usá tu email.");
      setBusy(false);
    }
    } catch {
      setError("No pudimos conectar con Google. Probá nuevamente.");
      setBusy(false);
    }
  }
  return (
    <div className="auth-google-section">
      <div className="auth-google-divider"><span>o continuá con</span></div>
      <button type="button" className="auth-google-button" disabled={busy} onClick={start}>
        <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.89 46.98 24.55Z"/>
          <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.9 23.9 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19Z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.18 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48Z"/>
        </svg>
        {busy ? "Conectando..." : "Continuar con Google"}
      </button>
      {error && <p className="auth-error" role="alert">{error}</p>}
    </div>
  );
}
