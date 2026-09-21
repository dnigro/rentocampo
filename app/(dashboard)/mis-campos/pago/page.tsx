import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { reconcileMercadoPagoPayment } from "@/lib/billing/mercadopago";
import "@/styles/pago-plan.css";

const COPY = {
  success: {
    title: "Pago recibido",
    text: "Estamos confirmando tu plan con Mercado Pago. Cuando se acredite, el cupo se activará automáticamente.",
  },
  pending: {
    title: "Pago pendiente",
    text: "Tu pago todavía está en proceso. El plan se activará automáticamente cuando Mercado Pago lo confirme.",
  },
  failure: {
    title: "Pago no completado",
    text: "No se realizó el cobro. Podés volver a Mis campos e intentarlo nuevamente cuando quieras.",
  },
} as const;

export default async function PagoPlanPage({
  searchParams,
}: {
  searchParams: Promise<{
    resultado?: string;
    payment_id?: string;
    collection_id?: string;
  }>;
}) {
  const { resultado, payment_id, collection_id } = await searchParams;
  const state =
    resultado === "success" || resultado === "pending" || resultado === "failure"
      ? resultado
      : "pending";
  let copy: { title: string; text: string } = COPY[state];

  if (state === "success") {
    const paymentId = payment_id ?? collection_id;

    if (paymentId) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const reconciliation = await reconcileMercadoPagoPayment(
          paymentId,
          user.id,
        );

        if (
          reconciliation.ok &&
          reconciliation.found &&
          reconciliation.status === "active"
        ) {
          copy = {
            title: "Plan activado",
            text: "El pago fue aprobado y tu plan ya quedó activo en RentoCampo.",
          };
        }
      }
    }
  }

  return (
    <div className="page-container pago-plan-page">
      <section className={`pago-plan-card pago-plan-card-${state}`}>
        <div className="pago-plan-kicker">Mercado Pago</div>
        <h1 className="pago-plan-title">{copy.title}</h1>
        <p className="pago-plan-text">{copy.text}</p>

        <Link href="/mis-campos" className="pago-plan-action">
          Volver a Mis campos
        </Link>
      </section>
    </div>
  );
}
