import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

export async function proxy(request: NextRequest) {
  // Las landings regionales tienen idioma estable para visitantes y Googlebot,
  // sin cambiar de forma persistente la preferencia de país del usuario.
  if (request.nextUrl.pathname === "/us") {
    request.cookies.set("rentocampo_country", "US");
  } else if (request.nextUrl.pathname === "/br") {
    request.cookies.set("rentocampo_country", "BR");
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabasePublicConfig();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        Object.entries(headers).forEach(([name, value]) => supabaseResponse.headers.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const protectedRoute =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/mis-campos") ||
    request.nextUrl.pathname.startsWith("/mis-servicios-rurales") ||
    request.nextUrl.pathname.startsWith("/gerencial") ||
    request.nextUrl.pathname.startsWith("/perfil") ||
    request.nextUrl.pathname.startsWith("/mensajes") ||
    request.nextUrl.pathname.startsWith("/favoritos");

  if (!user && protectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "next",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach(cookie => response.cookies.set(cookie));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  const authRoute = request.nextUrl.pathname.startsWith("/auth/") || ["/login", "/register", "/recuperar-contrasena"].includes(request.nextUrl.pathname);
  if (user || protectedRoute || authRoute) supabaseResponse.headers.set("Cache-Control", "private, no-store");
  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|woff|woff2)$).*)",
  ],
};
