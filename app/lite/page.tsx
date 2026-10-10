import Link from "next/link";
import Image from "next/image";
import heroTambo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "RentoCampo Lite | Preview" };
const links = [
  { title: "Ver campos", subtitle: "Encontrá tu próxima oportunidad", href: "/lite/campos", icon: "↗", dark: true },
  { title: "Ver servicios rurales", subtitle: "Conectá con profesionales del campo", href: "/lite/servicios", icon: "↗", dark: false },
];
export default function LitePreview() {
 return <main style={{minHeight:"100dvh",background:"#f8f8f6",color:"#20201e",fontFamily:"Arial, Helvetica, sans-serif",maxWidth:520,margin:"auto",paddingBottom:95}}>
  <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"24px 22px 16px",background:"#fff"}}>
   <Link href="/lite" style={{display:"flex",alignItems:"center",gap:10,textDecoration:"none",color:"inherit"}}>
    <span style={{display:"grid",placeItems:"center",width:52,height:59,flexShrink:0}}><svg viewBox="0 0 207 240" width="52" height="59" aria-label="Escudo RC RentoCampo" role="img"><path d="M103 2 L205 29 L205 148 Q201 210 103 238 Q5 210 2 148 L2 29 Z" fill="white" stroke="#171717" strokeWidth="5"/><text x="20" y="118" fontSize="109" fontWeight="900" fontFamily="Arial" fill="#666" letterSpacing="-14">R</text><text x="93" y="118" fontSize="111" fontWeight="900" fontFamily="Arial" fill="#111">C</text><text x="18" y="150" fontSize="24" fontFamily="Arial" fill="#222">Rento</text><text x="88" y="150" fontSize="24" fontWeight="900" fontFamily="Arial" fill="#222">Campo</text><path d="M22 176 Q98 164 185 174 L183 182 Q102 177 29 192Z" fill="#111"/><path d="M36 202 Q86 181 162 188 L148 200 Q87 195 54 215Z" fill="#111"/><path d="M66 222 Q91 199 135 204 L111 231Z" fill="#111"/></svg></span>
    <span style={{fontSize:23,letterSpacing:-1}}><span style={{fontWeight:400}}>rento</span><strong>Campo</strong></span>
   </Link><Link href="/lite/perfil" style={{fontSize:13,color:"#20201e",textDecoration:"none",fontWeight:700}}>Mi cuenta ↗</Link>
  </header>
  <section style={{position:"relative",height:210,overflow:"hidden",background:"#252525"}}>
   <Image src={heroTambo} alt="Vacas y tambo de RentoCampo" fill priority sizes="(max-width: 520px) 100vw, 520px" style={{objectFit:"cover",objectPosition:"68% center",filter:"grayscale(1) contrast(1.1) brightness(.72)"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 46%,rgba(0,0,0,.12) 100%)"}}/>
   <div style={{position:"absolute",right:-85,bottom:-110,width:175,height:300,transform:"rotate(32deg)",borderLeft:"5px solid rgba(219,203,156,.85)",background:"rgba(0,0,0,.12)"}}/>
   <div style={{position:"relative",padding:"37px 25px",color:"white"}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#e6d39a"}}>#1 RED FEDERAL</span><h1 style={{fontSize:35,lineHeight:1.08,letterSpacing:-1.8,margin:"14px 0"}}>El campo,<br/>más cerca.</h1><p style={{fontSize:13,maxWidth:230,lineHeight:1.5}}>Tierras y servicios rurales en un solo lugar.</p></div>
  </section>
  <section style={{padding:"27px 20px 16px"}}><p style={{fontSize:11,letterSpacing:2,fontWeight:800,color:"#777",marginBottom:10}}>EXPLORÁ RENTO CAMPO</p><h2 style={{fontSize:23,letterSpacing:-.7,margin:"0 0 19px"}}>¿Qué necesitás hoy?</h2>
  <div style={{display:"grid",gap:10}}>{links.map(item=><Link key={item.href} href={item.href} style={{background:item.dark?"#222":"#fff",color:item.dark?"#fff":"#222",border:item.dark?"none":"1px solid #e4e4e0",borderRadius:13,padding:"17px 18px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span><strong style={{fontSize:18,letterSpacing:-.5}}>{item.title}</strong><small style={{display:"block",marginTop:7,opacity:.65,fontSize:12}}>{item.subtitle}</small></span><span style={{fontSize:25}}>{item.icon}</span></Link>)}</div>
  <Link href="/lite/perfil" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,padding:"18px 20px",background:"#eae8e2",color:"#222",borderRadius:16,textDecoration:"none",fontWeight:700}}>Publicar y administrar <span>↗</span></Link>
  <p style={{fontSize:12,lineHeight:1.5,color:"#777",marginTop:20}}>Preview V2 · Navegación Lite en construcción. Los flujos operativos siguen disponibles desde cada sección.</p></section>
  <nav aria-label="Navegación Lite" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",borderTop:"1px solid #e8e8e8",padding:"13px 5px max(13px,env(safe-area-inset-bottom))",zIndex:10}}>
   {[["⌂","Inicio","/lite"],["▱","Campos","/lite/campos"],["▦","Servicios","/lite/servicios"],["◯","Perfil","/lite/perfil"]].map(([icon,label,href])=><Link key={label} href={href} style={{display:"grid",justifyItems:"center",gap:4,color:"#222",textDecoration:"none",fontSize:11,fontWeight:700}}><span style={{fontSize:22}}>{icon}</span>{label}</Link>)}
  </nav>
 </main>
}