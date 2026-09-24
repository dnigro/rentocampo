export type PlanExpiryStage = "30d" | "7d" | "1d" | "expired";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getPlanExpiryStage(
  expiresAt: string,
  now = new Date(),
): PlanExpiryStage | null {
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;

  const remainingMs = expiry.getTime() - now.getTime();
  if (remainingMs <= 0) return "expired";

  const remainingDays = Math.ceil(remainingMs / DAY_MS);
  if (remainingDays <= 1) return "1d";
  if (remainingDays <= 7) return "7d";
  if (remainingDays <= 30) return "30d";
  return null;
}

export function getPlanExpiryDays(expiresAt: string, now = new Date()) {
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / DAY_MS));
}
