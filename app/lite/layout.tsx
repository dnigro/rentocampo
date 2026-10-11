import Link from "next/link";
export default function LiteLayout({children}:{children:React.ReactNode}){
 return <div style={{minHeight:"100dvh",background:"#f7f7f5"}}>
 {children}
 <footer style={{background:"#191919",color:"#e8e8e8",textAlign:"center",padding:"26px 16px 105px",fontFamily:"Arial,sans-serif",fontSize:13}}>
 <div style={{fontWeight:700,letterSpacing:".02em",marginBottom:12}}>rentoCampo · Red Federal</div>
 <Link href="/terminos-y-condiciones" style={{color:"#fff",textDecoration:"underline",textUnderlineOffset:4,fontWeight:600}}>Términos y condiciones</Link>
 <div style={{color:"#aaa",marginTop:12}}>© {new Date().getFullYear()} RentoCampo</div>
 </footer></div>
}