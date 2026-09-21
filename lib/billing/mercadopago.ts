import { createClient as createAdminClient } from "@supabase/supabase-js";

type ReconcileResult =
  | { ok: true; found: false; paymentStatus?: string }
  | {
      ok: true;
      found: true;
      purchaseId: string;
      status: string;
      paymentStatus: string;
    }
  | { ok: false; error: string };

export async function reconcileMercadoPagoPayment(
  paymentId: string,
  expectedUserId?: string,
): Promise<ReconcileResult> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!accessToken || !supabaseUrl || !serviceRole) {
    return { ok: false, error: "Billing no configurado" };
  }

  const paymentResponse = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!paymentResponse.ok) {
    return { ok: false, error: "No se pudo consultar el pago" };
  }

  const payment = await paymentResponse.json();
  const externalReference = payment.external_reference ?? "";

  if (!externalReference) {
    return {
      ok: true,
      found: false,
      paymentStatus: String(payment.status ?? ""),
    };
  }

  const admin = createAdminClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let purchaseQuery = admin
    .from("land_plan_purchases")
    .select("id, user_id, status, provider_payment_id, starts_at, expires_at")
    .eq("external_reference", externalReference);

  if (expectedUserId) {
    purchaseQuery = purchaseQuery.eq("user_id", expectedUserId);
  }

  const { data: purchase, error: purchaseError } =
    await purchaseQuery.maybeSingle();

  if (purchaseError) {
    return { ok: false, error: "No se pudo consultar la compra" };
  }

  if (!purchase) {
    return {
      ok: true,
      found: false,
      paymentStatus: String(payment.status ?? ""),
    };
  }

  let status = purchase.status;
  const update: Record<string, unknown> = {
    provider_status: `${payment.status ?? ""}:${payment.status_detail ?? ""}`,
    provider_payment_id: String(payment.id),
  };

  if (payment.status === "approved") {
    status = "active";

    if (purchase.status !== "active" || !purchase.starts_at || !purchase.expires_at) {
      const startsAt = payment.date_approved
        ? new Date(payment.date_approved)
        : new Date();
      const expiresAt = new Date(startsAt);
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      update.starts_at = startsAt.toISOString();
      update.expires_at = expiresAt.toISOString();
      update.paid_at = startsAt.toISOString();
    }
  } else if (payment.status === "refunded") {
    status = "refunded";
  } else if (
    payment.status === "cancelled" ||
    payment.status === "rejected"
  ) {
    status = "cancelled";
  }

  update.status = status;

  const { error: updateError } = await admin
    .from("land_plan_purchases")
    .update(update)
    .eq("id", purchase.id);

  if (updateError) {
    return { ok: false, error: "No se pudo actualizar la compra" };
  }

  return {
    ok: true,
    found: true,
    purchaseId: purchase.id,
    status,
    paymentStatus: String(payment.status ?? ""),
  };
}
