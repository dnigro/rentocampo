import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANES_TIERRA } from "@/data/planes-tierra";
import { getPlanExpiryStage } from "@/lib/billing/plan-expiry";
import { sendPlanExpiryNotification } from "@/lib/send-plan-expiry-notification";

type NotificationMetadata = Record<string, unknown> & {
  expiry_notifications?: Partial<Record<"30d" | "7d" | "1d" | "expired", string>>;
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() + 30);

  const { data: purchases, error } = await admin
    .from("land_plan_purchases")
    .select("id, user_id, plan_id, expires_at, metadata")
    .eq("status", "active")
    .not("expires_at", "is", null)
    .lte("expires_at", cutoff.toISOString())
    .order("expires_at", { ascending: true });

  if (error) {
    console.error("Error consultando planes por vencer:", error);
    return NextResponse.json({ error: "No se pudieron consultar los planes" }, { status: 500 });
  }

  const userIds = [...new Set((purchases ?? []).map((purchase) => purchase.user_id))];
  const { data: profiles } = userIds.length
    ? await admin.from("profiles").select("id, nombre, email").in("id", userIds)
    : { data: [] };
  const profileById = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  let sent = 0;
  let expired = 0;
  const failures: Array<{ purchaseId: string; error: string }> = [];

  for (const purchase of purchases ?? []) {
    const stage = getPlanExpiryStage(purchase.expires_at, now);
    if (!stage) continue;

    const metadata = (purchase.metadata ?? {}) as NotificationMetadata;
    const sentStages = metadata.expiry_notifications ?? {};
    const profile = profileById.get(purchase.user_id);
    let email = profile?.email as string | undefined;
    let name = profile?.nombre as string | undefined;

    if (!email) {
      const { data: authUser } = await admin.auth.admin.getUserById(purchase.user_id);
      email = authUser.user?.email;
      name = name ?? (authUser.user?.user_metadata?.nombre as string | undefined);
    }

    try {
      if (!sentStages[stage]) {
        if (!email) throw new Error("El usuario no tiene email");
        const plan = PLANES_TIERRA.find((item) => item.id === purchase.plan_id);
        await sendPlanExpiryNotification({
          email,
          name,
          planName: plan?.nombre ?? "RentoCampo",
          expiresAt: purchase.expires_at,
          stage,
        });
        sentStages[stage] = now.toISOString();
        sent += 1;
      }

      const update: Record<string, unknown> = {
        metadata: { ...metadata, expiry_notifications: sentStages },
      };
      if (stage === "expired") {
        update.status = "expired";
        expired += 1;
      }

      const { error: updateError } = await admin
        .from("land_plan_purchases")
        .update(update)
        .eq("id", purchase.id);
      if (updateError) throw updateError;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Error desconocido";
      failures.push({ purchaseId: purchase.id, error: message });
      console.error("Error procesando aviso de vencimiento:", {
        purchaseId: purchase.id,
        stage,
        error: message,
      });
    }
  }

  return NextResponse.json({
    ok: failures.length === 0,
    checked: purchases?.length ?? 0,
    sent,
    expired,
    failures,
  });
}
