"use client";

import { useRef, useState } from "react";
import { LandPlot, Sprout, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { COUNTRIES, COUNTRY_CODES, type CountryCode } from "@/data/countries";
import { trackEvent } from "@/lib/analytics";
import { regionalText } from "@/lib/i18n/regional";
import { translate } from "@/lib/i18n/messages";

export default function RegisterForm({ initialCountry: paisInicial, initialRole: tipoInicial }: { initialCountry: CountryCode; initialRole: "propietario" | "productor" | "prestador" }) {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    tipo: tipoInicial as "propietario" | "productor" | "prestador",
    country_code: paisInicial,
  });
  const tt=(es:string,pt:string)=>regionalText(form.country_code,es,pt);
  const t=(key: Parameters<typeof translate>[1])=>translate(form.country_code,key);
  const [error, setError] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const interactionRecorded = useRef(false);

  function handleFirstInteraction() {
    if (interactionRecorded.current) return;
    interactionRecorded.current = true;
    trackEvent("registro_iniciado", { rol: form.tipo, pais: form.country_code });
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    if (e.target.name === "email") {
      setAccountExists(false);
    }
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAccountExists(false);
    setLoading(true);

    if (form.password.length < 6) {
      trackEvent("registro_error", { motivo: "password_corta", rol: form.tipo, pais: form.country_code });
      setError(t("auth.passwordTooShort"));
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      trackEvent("registro_error", { motivo: "terminos", rol: form.tipo, pais: form.country_code });
      setError(tt("Para crear tu cuenta, aceptá los términos y condiciones.", "Para criar sua conta, aceite os termos e condições."));
      setLoading(false);
      return;
    }

    trackEvent("registro_enviado", { rol: form.tipo, pais: form.country_code });

    // Construir la URL de callback dinámicamente según el entorno
    const origin = window.location.origin;
    const emailRedirectTo = `${origin}/auth/callback`;

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo,
        data: {
          nombre: form.nombre,
          tipo: form.tipo,
          country_code: form.country_code,
          terms_accepted_at: new Date().toISOString(),
          terms_version: "2026-09-23",
        },
      },
    });

    if (error) {
      const normalizedError = error.message.toLowerCase();
      const isDuplicateAccount =
        normalizedError.includes("already registered") ||
        normalizedError.includes("already exists") ||
        normalizedError.includes("already been registered") ||
        error.code === "user_already_exists";

      const isEmailLimit =
        error.code === "over_email_send_rate_limit" ||
        normalizedError.includes("email rate limit");
      trackEvent("registro_error", {
        motivo: isDuplicateAccount ? "cuenta_existente" : isEmailLimit ? "limite_email" : "error_auth",
        rol: form.tipo,
        pais: form.country_code,
      });

      if (isDuplicateAccount) {
        setAccountExists(true);
      } else {
        setError(
          isEmailLimit
            ? tt("Ahora no podemos enviar el correo de activación. Probá nuevamente más tarde.", "Não foi possível enviar o e-mail de ativação agora. Tente novamente mais tarde.")
            : normalizedError.includes("password")
              ? tt("La contraseña no cumple los requisitos mínimos.", "A senha não atende aos requisitos mínimos.")
              : tt(`No pudimos crear la cuenta: ${error.message}`, `Não foi possível criar a conta: ${error.message}`),
        );
      }
      setLoading(false);
      return;
    }

    // Con confirmación de email activa, Supabase puede devolver un usuario
    // ofuscado sin identidades cuando el correo ya está registrado.
    const isObfuscatedExistingAccount =
      data.user !== null &&
      Array.isArray(data.user.identities) &&
      data.user.identities.length === 0;

    if (isObfuscatedExistingAccount) {
      trackEvent("registro_error", { motivo: "cuenta_existente", rol: form.tipo, pais: form.country_code });
      setAccountExists(true);
      setLoading(false);
      return;
    }

    trackEvent("registrarse", {
      rol: form.tipo,
      pais: form.country_code,
    });

    // Si Auth devuelve sesión, no existe un correo pendiente que confirmar.
    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    trackEvent("registro_pendiente_confirmacion", {
      rol: form.tipo,
      pais: form.country_code,
    });
    router.push("/confirmar-email");
  }

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">{tt("Crear cuenta", "Criar conta")}</h1>
          <p className="auth-subtitle">{tt("Empezá a usar RentoCampo gratis", "Comece a usar a RentoCampo gratuitamente")}</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} onFocusCapture={handleFirstInteraction}>
          {accountExists && (
            <div className="auth-error" role="alert">
              <strong>{tt("La cuenta ya está registrada.", "Esta conta já está cadastrada.")}</strong>{" "}
              <Link href="/login">{tt("Ingresá con tu contraseña", "Entre com sua senha")}</Link> {tt("o", "ou")}{" "}
              <Link href="/recuperar-contrasena">{tt("recuperala acá", "recupere-a aqui")}</Link>.
            </div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label className="form-label">{tt("Soy...", "Sou...")}</label>
            <div className="tipo-selector">
              <div className="tipo-option">
                <input
                  type="radio"
                  id="tipo-propietario"
                  name="tipo"
                  value="propietario"
                  checked={form.tipo === "propietario"}
                  onChange={handleChange}
                />
                <label htmlFor="tipo-propietario" className="tipo-label">
                  <span className="tipo-emoji" aria-hidden="true"><LandPlot size={30} strokeWidth={1.8} /></span>
                  <span className="tipo-nombre">{tt("Propietario", "Proprietário")}</span>
                  <span className="tipo-desc">
                    {tt("Tengo campo y quiero arrendar", "Tenho terra e quero arrendá-la")}
                  </span>
                </label>
              </div>
              <div className="tipo-option">
                <input
                  type="radio"
                  id="tipo-productor"
                  name="tipo"
                  value="productor"
                  checked={form.tipo === "productor"}
                  onChange={handleChange}
                />
                <label htmlFor="tipo-productor" className="tipo-label">
                  <span className="tipo-emoji" aria-hidden="true"><Sprout size={30} strokeWidth={1.8} /></span>
                  <span className="tipo-nombre">{tt("Productor", "Produtor")}</span>
                  <span className="tipo-desc">{tt("Busco tierra para producir", "Procuro terra para produzir")}</span>
                </label>
              </div>
              <div className="tipo-option">
                <input
                  type="radio"
                  id="tipo-prestador"
                  name="tipo"
                  value="prestador"
                  checked={form.tipo === "prestador"}
                  onChange={handleChange}
                />
                <label htmlFor="tipo-prestador" className="tipo-label">
                  <span className="tipo-emoji" aria-hidden="true"><Wrench size={30} strokeWidth={1.8} /></span>
                  <span className="tipo-nombre">{tt("Servicios rurales", "Serviços rurais")}</span>
                  <span className="tipo-desc">
                    {tt("Ofrezco servicios para el campo", "Ofereço serviços para o campo")}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-field">
            <label className="form-label" htmlFor="country_code">
              {t("filters.country")}
            </label>
            <select
              id="country_code"
              name="country_code"
              className="form-input"
              value={form.country_code}
              onChange={handleChange}
              required
            >
              {COUNTRY_CODES.map((code) => <option key={code} value={code}>{COUNTRIES[code].flag} {COUNTRIES[code].name}</option>)}
            </select>
            <span className="form-hint">
              {tt("Usamos este dato para mostrarte campos, servicios y opciones de tu mercado.", "Usamos este dado para mostrar terras, serviços e opções do seu mercado.")}
            </span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="nombre">
              {tt("Nombre completo", "Nome completo")}
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="form-input"
              placeholder="Juan Pérez"
              value={form.nombre}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="email">
              {t("auth.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="tu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">
              {t("auth.password")}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder={t("auth.minSix")}
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <label className="register-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
            />
            <span>
              {tt("Leí y acepto los", "Li e aceito os")}{" "}
              <Link href="/terminos-y-condiciones" target="_blank" rel="noopener noreferrer">
                {tt("términos y condiciones", "termos e condições")}
              </Link>{" "}
              {tt("de RentoCampo.", "da RentoCampo.")}
            </span>
          </label>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? tt("Creando cuenta...", "Criando conta...") : tt("Crear cuenta", "Criar conta")}
          </button>
        </form>

        <div className="auth-footer">
          {tt("¿Ya tenés cuenta?", "Já tem conta?")} <Link href="/login">{tt("Ingresá acá", "Entre aqui")}</Link>
        </div>
      </div>
    </div>
  );
}
