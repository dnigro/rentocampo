const UAT_BRANCH = "feat/regional-ar-uy-py-20261014";
const UAT_REF = "wibqszhvuvpjycheaxzi";
const UAT_URL = `https://${UAT_REF}.supabase.co`;

/** Only the regional preview is a UAT runtime; production is never changed. */
export function enforceUatIsolation(env: Record<string, string | undefined>) {
  if (env.VERCEL_ENV !== "preview" || env.VERCEL_GIT_COMMIT_REF !== UAT_BRANCH) return;

  // Remove inherited production credentials before accepting any requests.
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("POSTGRES_") ||
      key.startsWith("MERCADOPAGO_") ||
      key.startsWith("RESEND_") ||
      key === "CRON_SECRET" ||
      key === "SUPABASE_SECRET_KEY" ||
      key === "SUPABASE_JWT_SECRET"
    ) delete env[key];
  }

  if (env.NEXT_PUBLIC_SUPABASE_URL !== UAT_URL) {
    const actual = env.NEXT_PUBLIC_SUPABASE_URL;
    const classification = !actual
      ? "missing"
      : actual.trim() === UAT_URL
        ? "uat-with-surrounding-whitespace"
        : "different-value";
    // Diagnostic intentionally excludes URLs, project refs, and all secrets.
    console.error("[UAT isolation] NEXT_PUBLIC_SUPABASE_URL classification:", classification);
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    throw new Error("UAT isolation: the regional preview must use the UAT database.");
  }

  const token = env.SUPABASE_SERVICE_ROLE_KEY;
  let claims: { ref?: string; role?: string } = {};
  try {
    claims = JSON.parse(Buffer.from(token?.split(".")[1] ?? "", "base64url").toString("utf8"));
  } catch {
    // Invalid or missing credentials must not fall back to inherited credentials.
  }
  // This is a target sanity check, not signature verification; Supabase verifies the JWT.
  if (claims.ref !== UAT_REF || claims.role !== "service_role") {
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    // Public UAT pages and Auth remain testable; admin APIs fail closed with
    // their existing missing-key checks until the UAT Secret is configured.
  }

  env.SUPABASE_URL = UAT_URL;
  env.NEXT_PUBLIC_APP_URL = `https://rentocampo-git-${UAT_BRANCH.replaceAll("/", "-")}-rento-campo.vercel.app`;
}
