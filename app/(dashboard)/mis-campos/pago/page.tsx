import Link from "next/link";

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
  searchParams: Promise<{ resultado?: string }>;
}) {
  const { resultado } = await searchParams;
  const state =
    resultado === "success" || resultado === "pending" || resultado === "failure"
      ? resultado
      : "pending";
  const copy = COPY[state];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{copy.title}</h1>
          <p className="page-subtitle">{copy.text}</p>
        </div>
      </div>

      <Link href="/mis-campos" className="btn-primary-lg">
        Volver a Mis campos
      </Link>
    </div>
  );
}
