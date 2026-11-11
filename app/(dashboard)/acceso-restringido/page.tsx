import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export const metadata = {
  title: "Acceso restringido | RentoCampo",
  robots: { index: false, follow: false },
};

export default function AccesoRestringidoPage() {
  return (
    <main style={{minHeight:"65vh",display:"grid",placeItems:"center",padding:"40px 20px",background:"#f7f8fa"}}>
      <section style={{maxWidth:540,width:"100%",background:"#fff",border:"1px solid #d9e4ed",borderRadius:18,padding:"40px 32px",textAlign:"center",color:"#102a43"}}>
        <LockKeyhole size={42} strokeWidth={1.7} aria-hidden="true" style={{margin:"0 auto 16px"}} />
        <h1 style={{fontSize:"clamp(26px,4vw,36px)",margin:"0 0 14px"}}>Acceso restringido</h1>
        <p style={{fontSize:17,lineHeight:1.6,color:"#536579",margin:"0 0 24px"}}>Esta sección está reservada para cuentas autorizadas. Podés seguir utilizando el resto de <strong>RentoCampo</strong> con normalidad.</p>
        <Link href="/dashboard" style={{display:"inline-block",background:"#102a43",color:"#fff",borderRadius:12,padding:"13px 24px",fontWeight:700,textDecoration:"none"}}>Volver a mi cuenta</Link>
      </section>
    </main>
  );
}
