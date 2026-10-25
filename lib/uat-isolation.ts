const UAT_BRANCHES = ["feat/brasil-foundation-20261019", "feat/regional-ar-uy-py-20261014", "feat/regional-six-countries-20261015", "feat/latam18-mx-uat-20261023", "feat/us19-flags-20261025"];
const UAT_REF = "wibqszhvuvpjycheaxzi";
const UAT_URL = `https://${UAT_REF}.supabase.co`;

/** Only the regional preview is a UAT runtime; production is never changed. */
export function enforceUatIsolation(env: Record<string, string | undefined>) {
  if (env.VERCEL_ENV !== "preview" || !UAT_BRANCHES.includes(env.VERCEL_GIT_COMMIT_REF ?? "")) return;

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

  // Vercel's Supabase integration can inject a production URL across all environments.
  // A branch-specific UAT key is required before overriding that inherited URL.
  // Never combine a production public key with the UAT endpoint.
  // Only a key provided under the Brazil preview's branch-scoped UAT witness
  // may be used. Inherited NEXT_PUBLIC_* values can come from production;
  // overwrite them instead of accepting whichever env entry wins precedence.
  const brasilPreview = ["feat/brasil-foundation-20261019", "feat/latam18-mx-uat-20261023", "feat/us19-flags-20261025"].includes(env.VERCEL_GIT_COMMIT_REF ?? "");
  if (brasilPreview && (
    !env.UAT_SUPABASE_PUBLISHABLE_KEY ||
    !env.UAT_SUPABASE_PUBLISHABLE_KEY.startsWith("sb_publishable_")
  )) {
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    throw new Error("UAT isolation: Brazil preview requires branch-specific UAT credentials.");
  }

  const uatPublicKey = brasilPreview
    ? env.UAT_SUPABASE_PUBLISHABLE_KEY
    : env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!uatPublicKey || !uatPublicKey.startsWith("sb_publishable_")) {
    delete env.SUPABASE_SERVICE_ROLE_KEY;
    throw new Error("UAT isolation: configure NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY for the regional preview.");
  }
  const urlStatus = !env.NEXT_PUBLIC_SUPABASE_URL
    ? "missing"
    : env.NEXT_PUBLIC_SUPABASE_URL === UAT_URL
      ? "uat"
      : "overridden-inherited-value";
  console.info("[UAT isolation] Supabase URL status:", urlStatus);
  env.NEXT_PUBLIC_SUPABASE_URL = UAT_URL;
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = uatPublicKey;
  delete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  env.NEXT_PUBLIC_APP_URL = `https://rentocampo-git-${env.VERCEL_GIT_COMMIT_REF?.replaceAll("/", "-")}-rento-campo.vercel.app`;
}
