"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/public.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkError, setLinkError] = useState("");
  const [listo, setListo] = useState(false);
  const [validandoLink, setValidandoLink] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function validarLink() {
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) setLinkError("El link de recuperación expiró o ya fue usado.");
      } else {
        const { data } = await supabase.auth.getSession();
        if (!data.session) setLinkError("El link de recuperación expiró o ya fue usado.");
      }
      setValidandoLink(false);
    }
    validarLink();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(
        "No pudimos actualizar la contraseña. El link puede haber expirado.",
      );
      setLoading(false);
      return;
    }

    setListo(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (listo) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="confirm-icon">✅</div>
            <h1 className="auth-title">¡Contraseña actualizada!</h1>
            <p className="auth-subtitle">Redirigiendo a tu cuenta...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Nueva contraseña</h1>
          <p className="auth-subtitle">Ingresá tu nueva contraseña</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {(linkError || error) && <div className="auth-error">{linkError || error}</div>}

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirmar">
              Confirmar contraseña
            </label>
            <input
              id="confirmar"
              type="password"
              className="form-input"
              placeholder="Repetí la contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || validandoLink || Boolean(linkError)}>
            {validandoLink ? "Validando link..." : loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
