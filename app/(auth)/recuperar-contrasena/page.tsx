"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/useTranslations";
import "@/styles/public.css";

export default function RecuperarPage() {
  const {t} = useTranslations();
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
    const recoveryPath = "/auth/reset-password";
    const redirectTo = `${origin}/auth/confirm?next=${encodeURIComponent(recoveryPath)}`;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      setError(error.message);
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
            <h1 className="auth-title">{t("auth.checkEmail")}</h1>
            <p className="auth-subtitle">
              {t("auth.recoverySent")}{" "}
              <strong>{email}</strong>
            </p>
          </div>
          <div className="confirm-pasos">
            <div className="confirm-paso">
              <span className="paso-num">1</span>
              <span className="paso-texto">{t("auth.openInbox")}</span>
            </div>
            <div className="confirm-paso">
              <span className="paso-num">2</span>
              <span className="paso-texto">
                {t("auth.clickReset")}
              </span>
            </div>
            <div className="confirm-paso">
              <span className="paso-num">3</span>
              <span className="paso-texto">{t("auth.enterNew")}</span>
            </div>
          </div>
          <div className="confirm-footer">
            <p>{t("auth.checkSpam")}</p>
            <Link
              href="/login"
              className="btn-submit"
              style={{
                textAlign: "center",
                textDecoration: "none",
                display: "block",
              }}
            >
              {t("auth.backToLogin")}
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
          <h1 className="auth-title">{t("auth.recover")}</h1>
          <p className="auth-subtitle">
            {t("auth.recoverSubtitle")}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              {t("auth.email")}
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
            {loading ? t("auth.sending") : t("auth.sendRecovery")}
          </button>
        </form>

        <div className="auth-footer">
          <Link href="/login">← {t("auth.backToLogin")}</Link>
        </div>
      </div>
    </div>
  );
}
