import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import { requireLiteUser } from "@/lib/lite/require-user";
import Workflow from "@/app/(dashboard)/mensajes/[campoId]/page";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ campoId: string }>;
  searchParams: Promise<{ borrador?: string }>;
}) {
  await requireLiteUser();
  return (
    <LiteWorkflowLayout>
      <Workflow params={params} searchParams={searchParams} />
    </LiteWorkflowLayout>
  );
}
