import Link from "next/link";
import Image from "next/image";
import LiteHeader from "@/components/lite/LiteHeader";
import RuralExperienceWorkflow from "@/components/landing/RuralExperienceWorkflow";
import "@/styles/hero-workflow-preview.css";
import heroTambo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
export const metadata: Metadata = { title: "RentoCampo Lite | Preview" };
export default async function LitePreview() {
 const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
 const t = (es: string, pt: string) => regionalText(country, es, pt);
 const links = [
  { title: t("Ver campos", "Ver terras"), subtitle: t("Encontrá tu próxima oportunidad", "Encontre sua próxima oportunidade"), href: "/lite/campos", icon: "↗", dark: true },
  { title: t("Ver servicios rurales", "Ver serviços rurais"), subtitle: t("Conectá con profesionales del campo", "Conecte-se com profissionais do campo"), href: "/lite/servicios", icon: "↗", dark: false },
 ];
 return <main style={{minHeight:"100dvh",background:"#f8f8f6",color:"#20201e",fontFamily:"Arial, Helvetica, sans-serif",maxWidth:520,margin:"auto",paddingBottom:95}}>
  <LiteHeader/>
  <section style={{position:"relative",height:210,overflow:"hidden",background:"#252525"}}>
   <Image src={heroTambo} alt="Vacas y tambo de RentoCampo" fill priority sizes="(max-width: 520px) 100vw, 520px" style={{objectFit:"cover",objectPosition:"68% center",filter:"grayscale(1) contrast(1.1) brightness(.72)"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 46%,rgba(0,0,0,.12) 100%)"}}/>
   
   <div style={{position:"relative",padding:"37px 25px",color:"white"}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#e6d39a"}}>{t("#1 RED FEDERAL", "#1 REDE DO CAMPO")}</span><h1 style={{fontSize:35,lineHeight:1.08,letterSpacing:-1.8,margin:"14px 0"}}>{t("El campo,", "O campo,")}<br/>{t("más cerca.", "mais perto.")}</h1><p style={{fontSize:13,maxWidth:230,lineHeight:1.5}}>{t("Tierras y servicios rurales en un solo lugar.", "Terras e serviços rurais em um só lugar.")}</p></div>
  </section>
  <div className="lite-experience"><RuralExperienceWorkflow country={country} /><Link className="lite-experience__register" href="/register">{t("REGISTRATE", "CADASTRE-SE")}</Link></div>
  <section style={{padding:"27px 20px 16px"}}><p style={{fontSize:11,letterSpacing:2,fontWeight:800,color:"#777",marginBottom:10}}>{t("EXPLORÁ RENTO CAMPO", "EXPLORE A RENTO CAMPO")}</p><h2 style={{fontSize:23,letterSpacing:-.7,margin:"0 0 19px"}}>{t("¿Qué necesitás hoy?", "Do que você precisa hoje?")}</h2>
  <div style={{display:"grid",gap:10}}>{links.map(item=><Link key={item.href} href={item.href} style={{background:item.dark?"#222":"#fff",color:item.dark?"#fff":"#222",border:item.dark?"none":"1px solid #e4e4e0",borderRadius:13,padding:"17px 18px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span><strong style={{fontSize:18,letterSpacing:-.5}}>{item.title}</strong><small style={{display:"block",marginTop:7,opacity:.65,fontSize:12}}>{item.subtitle}</small></span><span style={{fontSize:25}}>{item.icon}</span></Link>)}</div>
  <Link href="/lite/perfil" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,padding:"18px 20px",background:"#eae8e2",color:"#222",borderRadius:16,textDecoration:"none",fontWeight:700}}>{t("Publicar y administrar", "Anunciar e administrar")} <span>↗</span></Link>
  <p style={{fontSize:12,lineHeight:1.5,color:"#777",marginTop:20}}>{t("Preview Lite · Navegación Lite en construcción. Los flujos operativos siguen disponibles desde cada sección.", "Prévia Lite · Navegação em desenvolvimento. As funções continuam disponíveis nas respectivas seções.")}</p></section>
  <nav aria-label="Navegación Lite" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",borderTop:"1px solid #e8e8e8",padding:"13px 5px max(13px,env(safe-area-inset-bottom))",zIndex:10}}>
   {[["⌂",t("Inicio", "Início"),"/lite"],["▱",t("Campos", "Terras"),"/lite/campos"],["▦",t("Servicios", "Serviços"),"/lite/servicios"],["◯",t("Perfil", "Perfil"),"/lite/perfil"]].map(([icon,label,href])=><Link key={label} href={href} style={{display:"grid",justifyItems:"center",gap:4,color:"#222",textDecoration:"none",fontSize:11,fontWeight:700}}><span style={{fontSize:22}}>{icon}</span>{label}</Link>)}
  </nav>
 </main>
}