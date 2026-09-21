import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const requestedNext = searchParams.get("next");
  const next =
    requestedNext?.startsWith("/") && !requestedNext.startsWith("//")
      ? requestedNext
      : "/dashboard";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }

    // Keep signup/confirmation failures separate from password recovery.
    // A failed signup link must never send the user to the recovery form.
    const destination =
      type === "recovery" ? "/recuperar-contrasena" : "/login";
    const errorUrl = new URL(destination, origin);
    errorUrl.searchParams.set("error", "invalid_or_expired");
    errorUrl.searchParams.set("flow", type);
    return NextResponse.redirect(errorUrl);
  }

  // PKCE links generated with emailRedirectTo arrive with ?code=...
  // Delegate those to the single client callback that exchanges the code once.
  const code = searchParams.get("code");
  if (code) {
    const callbackUrl = new URL("/auth/callback", origin);
    callbackUrl.searchParams.set("code", code);
    callbackUrl.searchParams.set("next", next);
    return NextResponse.redirect(callbackUrl);
  }

  const errorUrl = new URL("/login", origin);
  errorUrl.searchParams.set("error", "invalid_or_expired");
  errorUrl.searchParams.set("flow", "confirmation");
  return NextResponse.redirect(errorUrl);
}
