"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");
  const tipoInicial = ["propietario", "productor", "prestador"].includes(tipoParam ?? "")
    ? tipoParam
    : "productor";
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    tipo: tipoInicial as "propietario" | "productor" | "prestador",
  });
  const [error, setError] = useState("");
  const [accountExists, setAccountExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

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

      if (isDuplicateAccount) {
        setAccountExists(true);
      } else {
        setError(
          normalizedError.includes("password")
            ? "La contraseña no cumple los requisitos mínimos."
            : `No pudimos crear la cuenta: ${error.message}`,
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
      setAccountExists(true);
      setLoading(false);
      return;
    }

    // Redirigir a página de confirmación
    router.push("/confirmar-email");
  }

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Empezá a usar RentoCampo gratis</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {accountExists && (
            <div className="auth-error" role="alert">
              <strong>La cuenta ya está registrada.</strong>{" "}
              <Link href="/login">Ingresá con tu contraseña</Link> o{" "}
              <Link href="/recuperar-contrasena">recuperala acá</Link>.
            </div>
          )}
          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <div className="form-field">
            <label className="form-label">Soy...</label>
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
                  <span className="tipo-emoji">🏡</span>
                  <span className="tipo-nombre">Propietario</span>
                  <span className="tipo-desc">
                    Tengo campo y quiero arrendar
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
                  <span className="tipo-emoji">🌱</span>
                  <span className="tipo-nombre">Productor</span>
                  <span className="tipo-desc">Busco tierra para producir</span>
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
                  <span className="tipo-emoji">⚙️</span>
                  <span className="tipo-nombre">Servicios rurales</span>
                  <span className="tipo-desc">
                    Ofrezco servicios para el campo
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="form-divider" />

          <div className="form-field">
            <label className="form-label" htmlFor="nombre">
              Nombre completo
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
              Email
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
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tenés cuenta? <Link href="/login">Ingresá acá</Link>
        </div>
      </div>
    </div>
  );
}

function RegisterFallback() {
  return (
    <div className="auth-page auth-page-register">
      <div className="auth-card" aria-busy="true">
        <div className="auth-header">
          <h1 className="auth-title">Crear cuenta</h1>
          <p className="auth-subtitle">Preparando el formulario…</p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
