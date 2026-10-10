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
    <span style={{display:"grid",placeItems:"center",width:100,height:108,flexShrink:0}}><svg viewBox="0 0 240 270" width="100" height="108" role="img" aria-label="Escudo RC RentoCampo"><path d="M120 7 L230 38 L230 167 Q224 226 120 264 Q16 226 10 167 L10 38 Z" fill="#fff" stroke="#111" strokeWidth="6"/><text x="33" y="141" fontFamily="Arial,sans-serif" fontSize="128" fontWeight="900" letterSpacing="-12" fill="#646464">R</text><text x="111" y="141" fontFamily="Arial,sans-serif" fontSize="130" fontWeight="900" letterSpacing="-12" fill="#070707">C</text><text x="36" y="175" fontFamily="Arial,sans-serif" fontSize="29" letterSpacing="-1.5" fill="#111">Rento</text><text x="112" y="175" fontFamily="Arial,sans-serif" fontSize="29" fontWeight="900" letterSpacing="-1.5" fill="#111">Campo</text><path d="M34 202 Q118 177 205 201 L194 213 Q114 193 42 218 Z" fill="#666"/><path d="M48 225 Q85 207 116 207 Q87 225 69 240Z M87 246 Q109 212 143 212 L128 256Z M150 248 Q161 225 187 218 L171 235Z" fill="#080808"/></svg></span>
    <span style={{fontSize:23,letterSpacing:-1}}><span style={{fontWeight:400}}>rento</span><strong>Campo</strong></span>
   </Link><Link href="/lite/perfil" style={{fontSize:13,color:"#20201e",textDecoration:"none",fontWeight:700}}>Mi cuenta ↗</Link>
  </header>
  <section style={{position:"relative",height:210,overflow:"hidden",background:"#252525"}}>
   <Image src={heroTambo} alt="Vacas y tambo de RentoCampo" fill priority sizes="(max-width: 520px) 100vw, 520px" style={{objectFit:"cover",objectPosition:"68% center",filter:"grayscale(1) contrast(1.1) brightness(.72)"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 46%,rgba(0,0,0,.12) 100%)"}}/>
   
   <div style={{position:"relative",padding:"37px 25px",color:"white"}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#e6d39a"}}>#1 RED FEDERAL</span><h1 style={{fontSize:35,lineHeight:1.08,letterSpacing:-1.8,margin:"14px 0"}}>El campo,<br/>más cerca.</h1><p style={{fontSize:13,maxWidth:230,lineHeight:1.5}}>Tierras y servicios rurales en un solo lugar.</p></div>
  </section>
  <section style={{padding:"27px 20px 16px"}}><p style={{fontSize:11,letterSpacing:2,fontWeight:800,color:"#777",marginBottom:10}}>EXPLORÁ RENTO CAMPO</p><h2 style={{fontSize:23,letterSpacing:-.7,margin:"0 0 19px"}}>¿Qué necesitás hoy?</h2>
  <div style={{display:"grid",gap:10}}>{links.map(item=><Link key={item.href} href={item.href} style={{background:item.dark?"#222":"#fff",color:item.dark?"#fff":"#222",border:item.dark?"none":"1px solid #e4e4e0",borderRadius:13,padding:"17px 18px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span><strong style={{fontSize:18,letterSpacing:-.5}}>{item.title}</strong><small style={{display:"block",marginTop:7,opacity:.65,fontSize:12}}>{item.subtitle}</small></span><span style={{fontSize:25}}>{item.icon}</span></Link>)}</div>
  <Link href="/lite/perfil" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,padding:"18px 20px",background:"#eae8e2",color:"#222",borderRadius:16,textDecoration:"none",fontWeight:700}}>Publicar y administrar <span>↗</span></Link>
  <p style={{fontSize:12,lineHeight:1.5,color:"#777",marginTop:20}}>Preview Lite · Navegación Lite en construcción. Los flujos operativos siguen disponibles desde cada sección.</p></section>
  <nav aria-label="Navegación Lite" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",borderTop:"1px solid #e8e8e8",padding:"13px 5px max(13px,env(safe-area-inset-bottom))",zIndex:10}}>
   {[["⌂","Inicio","/lite"],["▱","Campos","/lite/campos"],["▦","Servicios","/lite/servicios"],["◯","Perfil","/lite/perfil"]].map(([icon,label,href])=><Link key={label} href={href} style={{display:"grid",justifyItems:"center",gap:4,color:"#222",textDecoration:"none",fontSize:11,fontWeight:700}}><span style={{fontSize:22}}>{icon}</span>{label}</Link>)}
  </nav>
 </main>
}