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
  const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_reference: externalReference,
      payer: user.email ? { email: user.email } : undefined,
      items: [
        {
          id: planId,
          title: `RentoCampo · ${plan.nombre}`,
          quantity: 1,
          currency_id: "ARS",
          unit_price: amount,
        },
      ],
      back_urls: {
        success: `${origin}/mis-campos/pago?resultado=success`,
        failure: `${origin}/mis-campos/pago?resultado=failure`,
        pending: `${origin}/mis-campos/pago?resultado=pending`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/billing/mercadopago/webhook`,
      statement_descriptor: "RENTOCAMPO",
    }),
  });

  const mpData = await mpResponse.json().catch(() => null);

  if (!mpResponse.ok || !mpData?.id || (!mpData?.init_point && !mpData?.sandbox_init_point)) {
    await admin
      .from("land_plan_purchases")
      .update({
        provider_status: "create_preference_failed",
        metadata: {
          reference_price_usd: plan.precioUsdAnual,
          source: "rentocampo_web",
          mercado_pago_error: mpData,
        },
      })
      .eq("id", purchaseId);

    return NextResponse.json(
      { error: "Mercado Pago no pudo crear la preferencia de pago." },
      { status: 502 },
    );
  }

  await admin
    .from("land_plan_purchases")
    .update({
      provider_order_id: mpData.id,
      provider_status: "preference_created",
    })
    .eq("id", purchaseId);

  return NextResponse.json({
    checkoutUrl: mpData.sandbox_init_point ?? mpData.init_point,
    preferenceId: mpData.id,
  });
}
