/** V3 review branches are enabled only in Preview. */
export function isV3Preview(env: Record<string, string | undefined>) {
  return env.VERCEL_ENV === "preview" &&
    ["feature/rentocampo-v3", "codex/rentocampo-v3-review-20261112", "design/v3-internas-apple-minimal-20261113", "codex/rentocampo-v3-rc-20261113"].includes(env.VERCEL_GIT_COMMIT_REF ?? "");
}

export function isV3Enabled(env: Record<string, string | undefined>) {
  return isV3Preview(env) || (env.VERCEL_ENV === "production" && env.VERCEL_GIT_COMMIT_REF === "main");
}

export function v3Routes(env: Record<string, string | undefined>) {
  const enabled = isV3Enabled(env);
  const production = enabled && env.VERCEL_ENV === "production";
  return {
    redirects: enabled ? [
      ...(production ? [
        { source: "/campos/mapa", has: [{ type: "query" as const, key: "vista", value: "servicios" }], destination: "/v3?tipo=servicio&vista=mapa", permanent: false },
        { source: "/campos/mapa", destination: "/v3?tipo=campo&vista=mapa", permanent: false },
        { source: "/lite/campos/mapa", destination: "/lite?tipo=campo&vista=mapa", permanent: false },
        { source: "/lite/servicios/mapa", destination: "/lite?tipo=servicio&vista=mapa", permanent: false },
      ] : []),
      { source: "/campos/mapa", destination: "/campos", permanent: false },
      { source: "/lite/campos/mapa", destination: "/lite/campos", permanent: false },
    ] : [],
    // beforeFiles is required: both source routes already exist on disk.
    rewrites: { beforeFiles: enabled ? [
      { source: "/lite", destination: "/v3" },
      { source: "/campos", destination: "/v3/campos" },
      { source: "/servicios-rurales", destination: "/v3/servicios" },
      ...["/campos", "/lite/campos"].map(source => ({ source: `${source}/:id([0-9a-fA-F-]{36})`, destination: "/v3/campos/:id" })),
      ...["/servicios-rurales", "/lite/servicios"].map(source => ({ source: `${source}/:id([0-9a-fA-F-]{36})`, destination: "/v3/servicios/:id" })),
      { source: "/lite/campos", destination: "/v3/campos" },
      { source: "/lite/servicios", destination: "/v3/servicios" },
    ] : [] },
  };
}
