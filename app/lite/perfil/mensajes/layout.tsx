import LiteWorkflowLayout from "@/components/lite/LiteWorkflowLayout";
import InboxLayout from "@/components/mensajes/InboxLayout";
export default function Layout({children}:{children:React.ReactNode}) { return <LiteWorkflowLayout><InboxLayout>{children}</InboxLayout></LiteWorkflowLayout>; }
