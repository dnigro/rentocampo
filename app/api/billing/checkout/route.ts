import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  buildLandPlanExternalReference,
  getPaidLandPlan,
  isPaidLandPlanId,
} from "@/lib/billing/land-plans";

const ARS_ENV_BY_PLAN = {
  productiva: "MERCADOPAGO_PRODUCTIVA_ARS",
  administrador: "MERCADOPAGO_ADMINISTRADOR_ARS",
  portfolio: "MERCADOPAGO_PORTFOLIO_ARS",
} as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const planId = body?.planId;

  if (typeof planId !== "string" || !isPaidLandPlanId(planId)) {
    return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const amountEnv = process.env[ARS_ENV_BY_PLAN[planId]];
  const amount = Number(amountEnv);

  if (!accessToken || !supabaseUrl || !serviceRole || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json(
      {
        error:
          "Mercado Pago todavía no está configurado para pruebas. Falta credencial o precio local ARS.",
        code: "billing_not_configured",
      },
      { status: 503 },
    );
  }

  const plan = getPaidLandPlan(planId);
  const admin = createAdminClient(supabaseUrl, serviceRole, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const purchaseId = crypto.randomUUID();
  const externalReference = buildLandPlanExternalReference(
    user.id,
    planId,
    purchaseId,
  );

  const { error: insertError } = await admin.from("land_plan_purchases").insert({
    id: purchaseId,
    user_id: user.id,
    plan_id: planId,
    status: "pending",
    publication_limit: plan.publicaciones,
    publications_used: 0,
    amount,
    currency: "ARS",
    country_code: "AR",
    payment_provider: "mercadopago",
    external_reference: externalReference,
    metadata: {
      reference_price_usd: plan.precioUsdAnual,
      source: "rentocampo_web",
    },
  });

  if (insertError) {
    return NextResponse.json(
      { error: "No se pudo iniciar la compra del plan." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const idempotencyKey = crypto.randomUUID();
  const total = amount.toFixed(2);

  const mpResponse = await fetch("https://api.mercadopago.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify({
      type: "online",
      processing_mode: "manual",
      capture_mode: "automatic_async",
      total_amount: total,
      external_reference: externalReference,
      description: `RentoCampo · ${plan.nombre}`,
      payer: user.email ? { email: user.email } : undefined,
      items: [
        {
          title: `RentoCampo · ${plan.nombre}`,
          unit_price: total,
          quantity: 1,
          unit_measure: "unit",
          total_amount: total,
        },
      ],
      config: {
        online: {
          success_url: `${origin}/mis-campos/pago?resultado=success`,
          failure_url: `${origin}/mis-campos/pago?resultado=failure`,
          pending_url: `${origin}/mis-campos/pago?resultado=pending`,
          auto_return: "all",
        },
      },
    }),
  });

  const mpData = await mpResponse.json().catch(() => null);

  if (!mpResponse.ok || !mpData?.id || !mpData?.checkout_url) {
    await admin
      .from("land_plan_purchases")
      .update({
        provider_status: "create_order_failed",
        metadata: {
          reference_price_usd: plan.precioUsdAnual,
          source: "rentocampo_web",
          mercado_pago_error: mpData,
        },
      })
      .eq("id", purchaseId);

    return NextResponse.json(
      { error: "Mercado Pago no pudo crear la orden de pago." },
      { status: 502 },
    );
  }

  await admin
    .from("land_plan_purchases")
    .update({
      provider_order_id: mpData.id,
      provider_status: mpData.status ?? "created",
    })
    .eq("id", purchaseId);

  return NextResponse.json({
    checkoutUrl: mpData.checkout_url,
    orderId: mpData.id,
  });
}
