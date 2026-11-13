import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import Workflow from "@/app/(dashboard)/mis-servicios-rurales/nuevo/page";
import {requireLiteUser} from "@/lib/lite/require-user";
export default async function Page({searchParams}:{searchParams:Promise<{pais?:string;zona?:string}>}){
 await requireLiteUser();
 return <LiteWorkflowLayout><Workflow searchParams={searchParams}/></LiteWorkflowLayout>;
}
