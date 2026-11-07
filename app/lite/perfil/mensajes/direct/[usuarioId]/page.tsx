
import { requireLiteUser } from "@/lib/lite/require-user";
import Workflow from "@/app/(dashboard)/mensajes/direct/[usuarioId]/page";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ usuarioId: string }>;
  searchParams: Promise<{ borrador?: string }>;
}) {
  await requireLiteUser();
  return <Workflow params={params} searchParams={searchParams} />;
}
