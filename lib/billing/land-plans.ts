import { PLANES_TIERRA, type PlanTierraId } from "@/data/planes-tierra";

export const PAID_LAND_PLAN_IDS = [
  "productiva",
  "administrador",
  "portfolio",
] as const;

export type PaidLandPlanId = (typeof PAID_LAND_PLAN_IDS)[number];

export function isPaidLandPlanId(value: string): value is PaidLandPlanId {
  return (PAID_LAND_PLAN_IDS as readonly string[]).includes(value);
}

export function getPaidLandPlan(planId: PaidLandPlanId) {
  const plan = PLANES_TIERRA.find((item) => item.id === planId);
  if (!plan || plan.precioUsdAnual <= 0) {
    throw new Error("Plan comercial inválido");
  }
  return plan;
}

export function buildLandPlanExternalReference(
  _userId: string,
  planId: PlanTierraId,
  purchaseId: string,
) {
  return `rc:${planId}:${purchaseId}`;
}
