import { createClient as createAdminClient } from "@supabase/supabase-js";
import { PLANES_TIERRA } from "@/data/planes-tierra";
import {
  sendPlanPurchaseConfirmation,
  sendPlanQuotaExhaustedNotification,
} from "@/lib/send-plan-lifecycle-notifications";

type NotificationMetadata = Record<string, unknown> & {
  purchase_confirmation_sent_at?: string;
  quota_exhausted_notification_sent_at?: string;
};

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

async function getUserIdentity(userId: string) {
  const admin = getAdminClient();
  const [{ data: authUser, error: authError }, { data: profile }] =
    await Promise.all([
      admin.auth.admin.getUserById(userId),
      admin.from("profiles").select("nombre").eq("id", userId).maybeSingle(),
    ]);

  if (authError) throw authError;

  const email = authUser.user?.email;
  if (!email) throw new Error("El usuario no tiene email");

  const name =
    profile?.nombre ??
    (authUser.user?.user_metadata?.nombre as string | undefined) ??
    null;

  return { email, name };
}

export async function notifyPlanPurchaseActivated(purchaseId: string) {
  const admin = getAdminClient();
  const { data: purchase, error } = await admin
    .from("land_plan_purchases")
    .select(
      "id, user_id, plan_id, publication_limit, amount, currency, starts_at, expires_at, metadata",
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (error) throw error;
  if (!purchase?.starts_at || !purchase.expires_at) return;

  const metadata = (purchase.metadata ?? {}) as NotificationMetadata;
  if (metadata.purchase_confirmation_sent_at) return;

  const { email, name } = await getUserIdentity(purchase.user_id);
  const plan = PLANES_TIERRA.find((item) => item.id === purchase.plan_id);

  await sendPlanPurchaseConfirmation({
    email,
    name,
    planName: plan?.nombre ?? "RentoCampo",
    publicationLimit: purchase.publication_limit,
    amount: Number(purchase.amount),
    currency: purchase.currency,
    startsAt: purchase.starts_at,
    expiresAt: purchase.expires_at,
  });

  await admin
    .from("land_plan_purchases")
    .update({
      metadata: {
        ...metadata,
        purchase_confirmation_sent_at: new Date().toISOString(),
      },
    })
    .eq("id", purchase.id);
}

export async function notifyPlanQuotaExhausted(purchaseId: string) {
  const admin = getAdminClient();
  const { data: purchase, error } = await admin
    .from("land_plan_purchases")
    .select(
      "id, user_id, plan_id, publication_limit, publications_used, metadata",
    )
    .eq("id", purchaseId)
    .maybeSingle();

  if (error) throw error;
  if (!purchase?.publication_limit) return;
  if ((purchase.publications_used ?? 0) < purchase.publication_limit) return;

  const metadata = (purchase.metadata ?? {}) as NotificationMetadata;
  if (metadata.quota_exhausted_notification_sent_at) return;

  const { email, name } = await getUserIdentity(purchase.user_id);
  const plan = PLANES_TIERRA.find((item) => item.id === purchase.plan_id);

  await sendPlanQuotaExhaustedNotification({
    email,
    name,
    planName: plan?.nombre ?? "RentoCampo",
    publicationLimit: purchase.publication_limit,
  });

  await admin
    .from("land_plan_purchases")
    .update({
      metadata: {
        ...metadata,
        quota_exhausted_notification_sent_at: new Date().toISOString(),
      },
    })
    .eq("id", purchase.id);
}
