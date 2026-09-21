import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import {
  buildLandPlanExternalReference,
  getPaidLandPlan,
  isPaidLandPlanId,
} from "@/lib/billing/land-plans";
import { getLandQuotaStatus } from "@/lib/billing/land-quota";
import { planTierraRank } from "@/data/planes-tierra";
import { getBnaUsdSellerRate, usdToArs } from "@/lib/billing/bna-rate";

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
  const isProduction = process.env.VERCEL_ENV === "production";

  if (!accessToken || !supabaseUrl || !serviceRole) {
    return NextResponse.json(
      {
        error:
          "Mercado Pago todavía no está configurado correctamente.",
        code: "billing_not_configured",
      },
      { status: 503 },
    );
  }

  if (isProduction && accessToken.startsWith("TEST-")) {
    return NextResponse.json(
      {
        error:
          "Mercado Pago Production todavía está usando credenciales de prueba. Cargá el Access Token productivo antes de cobrar.",
        code: "mercadopago_test_credentials_in_production",
      },
      { status: 503 },
    );
  }

  const plan = getPaidLandPlan(planId);

  let bnaRate;
  try {
    bnaRate = await getBnaUsdSellerRate();
  } catch {
    return NextResponse.json(
      {
        error:
          "No pudimos obtener la cotización oficial del Banco Nación. Intentá nuevamente en unos minutos.",
        code: "bna_rate_unavailable",
      },
      { status: 503 },
    );
  }

  const amount = usdToArs(plan.precioUsdAnual, bnaRate.seller);
  const currentQuota = await getLandQuotaStatus(user.id);

  if (planTierraRank(planId) <= planTierraRank(currentQuota.planId)) {
    return NextResponse.json(
      {
        error:
          planId === currentQuota.planId
            ? "Ese ya es tu plan actual."
            : "Ese plan ya está incluido dentro de tu plan actual.",
        code: "plan_not_upgrade",
      },
      { status: 409 },
    );
  }

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
      bna_usd_seller_ars: bnaRate.seller,
      bna_rate_fetched_at: bnaRate.fetchedAt,
      conversion_source: bnaRate.source,
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
          bna_usd_seller_ars: bnaRate.seller,
          bna_rate_fetched_at: bnaRate.fetchedAt,
          conversion_source: bnaRate.source,
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

  const checkoutUrl = isProduction
    ? mpData.init_point
    : mpData.sandbox_init_point ?? mpData.init_point;

  if (!checkoutUrl) {
    return NextResponse.json(
      { error: "Mercado Pago no devolvió una URL de checkout válida." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    checkoutUrl,
    preferenceId: mpData.id,
  });
}
