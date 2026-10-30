import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import Workflow from "@/app/(public)/campos/mapa/page";

type MapSearchParams = {
  pais?: string;
  vista?: string;
  servicio?: string;
  provincia?: string;
};

export default async function Page({ searchParams }: { searchParams: Promise<MapSearchParams> }) {
  const params = await searchParams;
  return (
    <LiteWorkflowLayout>
      <Workflow searchParams={Promise.resolve({ ...params, vista: params.vista ?? "servicios" })} />
    </LiteWorkflowLayout>
  );
}
