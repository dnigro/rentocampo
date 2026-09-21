import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function parseSignature(value: string) {
  const parts = value.split(",");
  let ts = "";
  let v1 = "";

  for (const part of parts) {
    const [key, rawValue] = part.split("=", 2);
    if (key?.trim() === "ts") ts = rawValue?.trim() ?? "";
    if (key?.trim() === "v1") v1 = rawValue?.trim() ?? "";
  }

  return { ts, v1 };
}

function isValidSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string,
  secret: string,
) {
  const { ts, v1 } = parseSignature(xSignature);
  if (!ts || !v1 || !xRequestId || !dataId) return false;

  const normalizedDataId = dataId.toLowerCase();
  const manifest = `id:${normalizedDataId};request-id:${xRequestId};ts:${ts};`;
  const calculated = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  const a = Buffer.from(calculated);
  const b = Buffer.from(v1);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? "";
  const type = url.searchParams.get("type") ?? "";
  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!accessToken || !webhookSecret || !supabaseUrl || !serviceRole) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 503 });
  }

  if (
    type !== "order" ||
    !isValidSignature(xSignature, xRequestId, dataId, webhookSecret)
  ) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const orderResponse = await fetch(
    `https://api.mercadopago.com/v1/orders/${encodeURIComponent(dataId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!orderResponse.ok) {
    return NextResponse.json(
      { error: "No se pudo consultar la order" },
      { status: 502 },
    );
  }

  const order = await orderResponse.json();
  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: purchase } = await admin
    .from("land_plan_purchases")
    .select("id, status")
    .eq("provider_order_id", order.id)
    .maybeSingle();

  if (!purchase) {
    return NextResponse.json({ ok: true });
  }

  let status = purchase.status;
  const update: Record<string, unknown> = {
    provider_status: `${order.status ?? ""}:${order.status_detail ?? ""}`,
  };

  if (order.status === "processed" && order.status_detail === "accredited") {
    status = "active";
    const startsAt = new Date();
    const expiresAt = new Date(startsAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    update.starts_at = startsAt.toISOString();
    update.expires_at = expiresAt.toISOString();
    update.paid_at = startsAt.toISOString();
    const paymentId = order?.transactions?.payments?.[0]?.id;
    if (paymentId) update.provider_payment_id = String(paymentId);
  } else if (
    order.status === "refunded" ||
    order.status_detail === "refunded"
  ) {
    status = "refunded";
  } else if (order.status === "canceled") {
    status = "cancelled";
  } else if (order.status === "failed") {
    status = "cancelled";
  }

  update.status = status;

  await admin
    .from("land_plan_purchases")
    .update(update)
    .eq("id", purchase.id);

  return NextResponse.json({ ok: true });
}
