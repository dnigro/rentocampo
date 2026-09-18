export function isMissingMensajesDirectosLeido(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const candidate = error as {
    code?: string;
    message?: string;
    details?: string;
  };
  const description = `${candidate.message ?? ""} ${candidate.details ?? ""}`;

  return (
    (candidate.code === "42703" || candidate.code === "PGRST204") &&
    description.includes("mensajes_directos") &&
    description.includes("leido")
  );
}
