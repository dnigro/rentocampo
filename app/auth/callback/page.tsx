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

      // createBrowserClient automatically exchanges the one-time PKCE code.
      // Await that initialization instead of exchanging the same code twice.
      const { error: initializationError } = await supabase.auth.initialize();
      if (initializationError) {
        if (!cancelled) {
          setError("No pudimos confirmar el acceso. Volvé a ingresar para iniciar una nueva sesión.");
        }
        return;
      }

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (!cancelled) {
          setError("No encontramos una sesión válida. Volvé a ingresar e intentá nuevamente.");
        }
        return;
      }

      if (!cancelled) {
        // Preserve existing accounts; only new Google signups complete onboarding.
        if (next.startsWith("/perfil?elegir=rol")) {
          const createdAt = user.created_at ? Date.parse(user.created_at) : 0;
          const isNew = createdAt > 0 && Date.now() - createdAt < 5 * 60 * 1000;
          router.replace(isNew ? next : "/dashboard");
        } else {
          router.replace(next);
        }
      }
    }

    void completeAuthentication();
    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  // Keep OAuth validation and session creation; do not render a full-page
  // intermediate screen while redirecting to the requested destination.
  if (!error) return <span className="sr-only" role="status">Ingresando a RentoCampo...</span>;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="confirm-icon">⚠️</div>
          <h1 className="auth-title">No pudimos completar el ingreso</h1>
          <p className="auth-subtitle" role="alert">{error}</p>
          <button
            type="button"
            className="btn-submit"
            onClick={() => router.replace("/login")}
          >
            Volver a ingresar
          </button>
        </div>
      </div>
    </div>
  );
}
