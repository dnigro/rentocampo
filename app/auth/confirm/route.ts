import { createServerClient } from "@supabase/ssr";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
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
    // Verify OTP and attach every session cookie to the SAME redirect response.
    // cookies().set alone may not carry those cookies into a separately-created
    // NextResponse.redirect, leaving users back on /login after confirmation.
    const successResponse = NextResponse.redirect(new URL(next, origin));
    const { url, key } = getSupabasePublicConfig();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            successResponse.cookies.set(name, value, options);
          });
        },
      },
    });

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) return successResponse;

    const destination =
      type === "recovery" ? "/recuperar-contrasena" : "/login";
    const errorUrl = new URL(destination, origin);
    errorUrl.searchParams.set("error", "invalid_or_expired");
    errorUrl.searchParams.set("flow", type);
    return NextResponse.redirect(errorUrl);
  }

  // PKCE email links are redeemed on the client callback exactly once.
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
