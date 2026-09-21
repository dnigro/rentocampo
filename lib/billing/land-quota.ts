import { createClient as createAdminClient } from "@supabase/supabase-js";
import { PLANES_TIERRA, type PlanTierraId } from "@/data/planes-tierra";

export interface LandQuotaStatus {
  planId: PlanTierraId;
  planName: string;
  purchaseId: string | null;
  limit: number | null;
  used: number;
  remaining: number | null;
  unlimited: boolean;
  canPublish: boolean;
  expiresAt: string | null;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRole) {
    throw new Error("Supabase billing no configurado");
  }

  return createAdminClient(url, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getLandQuotaStatus(
  userId: string,
): Promise<LandQuotaStatus> {
  const admin = getAdminClient();
  const now = new Date().toISOString();

  const { data: activePurchase } = await admin
    .from("land_plan_purchases")
    .select(
      "id, plan_id, publication_limit, publications_used, expires_at, paid_at, created_at",
    )
    .eq("user_id", userId)
    .eq("status", "active")
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("paid_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activePurchase) {
    const plan =
      PLANES_TIERRA.find((item) => item.id === activePurchase.plan_id) ??
      PLANES_TIERRA[0];
    const limit = activePurchase.publication_limit ?? plan.publicaciones;
    const used = activePurchase.publications_used ?? 0;
    const unlimited = limit === null;

    return {
      planId: plan.id,
      planName: plan.nombre,
      purchaseId: activePurchase.id,
      limit,
      used,
      remaining: unlimited ? null : Math.max(0, limit - used),
      unlimited,
      canPublish: unlimited || used < limit,
      expiresAt: activePurchase.expires_at,
    };
  }

  const freePlan = PLANES_TIERRA[0];

  const { count: usedCount } = await admin
    .from("land_publication_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("plan_id", "inicial");

  const used = usedCount ?? 0;
  const limit = freePlan.publicaciones ?? 1;

  return {
    planId: "inicial",
    planName: freePlan.nombre,
    purchaseId: null,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    unlimited: false,
    canPublish: used < limit,
    expiresAt: null,
  };
}

export async function consumeLandPublicationQuota(args: {
  userId: string;
  campoId: string;
}) {
  const admin = getAdminClient();

  const { data: existing } = await admin
    .from("land_publication_events")
    .select("id")
    .eq("campo_id", args.campoId)
    .maybeSingle();

  if (existing) {
    return { ok: true as const, alreadyConsumed: true as const };
  }

  const quota = await getLandQuotaStatus(args.userId);

  if (!quota.canPublish) {
    return {
      ok: false as const,
      code: "quota_exhausted" as const,
      quota,
    };
  }

  const { error: eventError } = await admin.from("land_publication_events").insert({
    user_id: args.userId,
    campo_id: args.campoId,
    plan_purchase_id: quota.purchaseId,
    plan_id: quota.planId,
  });

  if (eventError) {
    return {
      ok: false as const,
      code: "quota_event_failed" as const,
      quota,
    };
  }

  if (quota.purchaseId && !quota.unlimited) {
    const { error: usageError } = await admin
      .from("land_plan_purchases")
      .update({ publications_used: quota.used + 1 })
      .eq("id", quota.purchaseId)
      .eq("publications_used", quota.used);

    if (usageError) {
      await admin
        .from("land_publication_events")
        .delete()
        .eq("campo_id", args.campoId);

      return {
        ok: false as const,
        code: "quota_increment_failed" as const,
        quota,
      };
    }
  }

  return {
    ok: true as const,
    alreadyConsumed: false as const,
    quota,
  };
}
