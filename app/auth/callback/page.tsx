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
    async function completeAuthentication() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const requestedNext = params.get("next");
      const next =
        requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
          ? requestedNext
          : "/dashboard";

      const authError = params.get("error");
      if (authError) {
        const description = params.get("error_description") ?? authError;
        router.replace(`/login?error=${encodeURIComponent(description)}`);
        return;
      }

      if (!code) {
        router.replace("/login");
        return;
      }

      const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        setError("El link de recuperación expiró o ya fue usado.");
        return;
      }

      router.replace(next);
    }

    completeAuthentication();
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
