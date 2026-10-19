"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/useTranslations";
import "@/styles/public.css";

export default function ResetPasswordPage() {
  const {t} = useTranslations();
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
        if (error) setLinkError(t("auth.linkExpired"));
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
      setError(t("auth.passwordTooShort"));
      return;
    }
    if (password !== confirmar) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      const message = error.message.toLowerCase();

      if (message.includes("same password")) {
        setError(t("auth.passwordDifferent"));
      } else if (
        error.code === "weak_password" ||
        message.includes("password should") ||
        message.includes("weak")
      ) {
        setError(
          t("auth.securityRequirements"),
        );
      } else if (
        message.includes("session") ||
        message.includes("jwt") ||
        message.includes("expired")
      ) {
        setError(
          t("auth.sessionExpired"),
        );
      } else {
        setError(`No pudimos actualizar la contraseña: ${error.message}`);
      }

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
            <h1 className="auth-title">{t("auth.passwordSaved")}</h1>
            <p className="auth-subtitle">{t("auth.redirecting")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{t("auth.newPassword")}</h1>
          <p className="auth-subtitle">{t("auth.enterNew")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {(linkError || error) && <div className="auth-error">{linkError || error}</div>}

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              {t("auth.newPassword")}
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder={t("auth.minSix")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirmar">
              {t("auth.confirmPassword")}
            </label>
            <input
              id="confirmar"
              type="password"
              className="form-input"
              placeholder={t("auth.repeatPassword")}
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || validandoLink || Boolean(linkError)}>
            {validandoLink ? t("auth.validating") : loading ? t("auth.saving") : t("auth.savePassword")}
          </button>
        </form>
      </div>
    </div>
  );
}
