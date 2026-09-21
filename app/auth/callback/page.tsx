"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import "@/styles/public.css";

export default function AuthCallbackPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function completeAuthentication() {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const requestedNext = url.searchParams.get("next");
      const next =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/dashboard";

      const authError = url.searchParams.get("error");
      if (authError) {
        const description =
          url.searchParams.get("error_description") ?? authError;
        if (!cancelled) setError(description);
        return;
      }

      // PKCE: Supabase returns a one-time authorization code.
      // Exchange it once in this callback, then continue with the new session.
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          if (!cancelled) {
            setError(
              "No pudimos confirmar el acceso. El enlace puede haber vencido o ya haber sido utilizado.",
            );
          }
          return;
        }

        if (!cancelled) router.replace(next);
        return;
      }

      // Compatibility with implicit/magic-link redirects where the SDK may
      // already have restored a session from the URL.
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && data.session) {
        if (!cancelled) router.replace(next);
        return;
      }

      if (!cancelled) {
        setError(
          "El enlace no contiene una confirmación válida. Solicitá uno nuevo e intentá nuevamente.",
        );
      }
    }

    void completeAuthentication();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          {error ? (
            <>
              <div className="confirm-icon">⚠️</div>
              <h1 className="auth-title">No pudimos validar el link</h1>
              <p className="auth-subtitle">{error}</p>
              <button
                type="button"
                className="btn-submit"
                onClick={() => router.replace("/recuperar-contrasena")}
              >
                Solicitar un nuevo link
              </button>
            </>
          ) : (
            <>
              <div className="confirm-icon">🔐</div>
              <h1 className="auth-title">Validando tu acceso</h1>
              <p className="auth-subtitle">Un momento, por favor...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
