/** Never activate V3 aliases on a production deployment. */
export function isV3Preview(env: Record<string, string | undefined>) {
  return env.VERCEL_ENV === "preview" &&
    ["feature/rentocampo-v3", "codex/rentocampo-v3-review-20261112"].includes(env.VERCEL_GIT_COMMIT_REF ?? "");
}

export function v3PreviewRoutes(env: Record<string, string | undefined>) {
  const enabled = isV3Preview(env);
  return {
    redirects: enabled ? [
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
    ] : [] },
  };
}
