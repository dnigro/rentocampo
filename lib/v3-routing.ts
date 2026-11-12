/** Never activate V3 aliases on a production deployment. */
export function v3PreviewRoutes(env: Record<string, string | undefined>) {
  const enabled = env.VERCEL_ENV === "preview" &&
    ["feature/rentocampo-v3", "codex/rentocampo-v3-review-20261112"].includes(env.VERCEL_GIT_COMMIT_REF ?? "");
  return {
    redirects: enabled ? [
      { source: "/campos/mapa", destination: "/campos", permanent: false },
      { source: "/lite/campos/mapa", destination: "/lite/campos", permanent: false },
    ] : [],
    // beforeFiles is required: both source routes already exist on disk.
    rewrites: { beforeFiles: enabled ? [
      { source: "/campos", destination: "/v3/campos" },
      { source: "/lite/campos", destination: "/v3/campos" },
    ] : [] },
  };
}
