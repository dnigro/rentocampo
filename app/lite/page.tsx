import Link from "next/link";
import Image from "next/image";
import LiteHeader from "@/components/lite/LiteHeader";
import heroTambo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
export const metadata: Metadata = { title: "RentoCampo Lite | Preview" };
export default async function LitePreview() {
 const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
 const t = (es: string, pt: string) => regionalText(country, es, pt);
 const steps = [
  t("REGISTRATE GRATIS", "CADASTRE-SE GRÁTIS"),
  t("CHATEÁ ONLINE", "CONVERSE ONLINE"),
  t("MAPA POR REGIÓN", "MAPA POR REGIÃO"),
  t("ACORDÁ LAS CONDICIONES", "COMBINE AS CONDIÇÕES"),
 ];
 const links = [
  { title: t("Ver campos", "Ver terras"), subtitle: t("Encontrá tu próxima oportunidad", "Encontre sua próxima oportunidade"), href: "/lite/campos", icon: "↗", dark: true },
  { title: t("Ver servicios rurales", "Ver serviços rurais"), subtitle: t("Conectá con profesionales del campo", "Conecte-se com profissionais do campo"), href: "/lite/servicios", icon: "↗", dark: false },
 ];
 return <main style={{minHeight:"100dvh",background:"#f8f8f6",color:"#20201e",fontFamily:"Arial, Helvetica, sans-serif",maxWidth:520,margin:"auto",paddingBottom:95}}>
  <LiteHeader/>
  <section style={{position:"relative",minHeight:236,overflow:"hidden",background:"#252525"}}>
   <Image src={heroTambo} alt="Vacas y tambo de RentoCampo" fill priority sizes="(max-width: 520px) 100vw, 520px" style={{objectFit:"cover",objectPosition:"68% center",filter:"grayscale(1) contrast(1.1) brightness(.72)"}}/><div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,rgba(0,0,0,.78) 0%,rgba(0,0,0,.55) 46%,rgba(0,0,0,.12) 100%)"}}/>
   
   <div style={{position:"relative",padding:"22px 20px 23px",color:"white"}}><span style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#e6d39a"}}>{t("#1 RED FEDERAL", "#1 REDE DO CAMPO")}</span><h1 style={{fontSize:"clamp(18px, 4.8vw, 25px)",lineHeight:1.12,letterSpacing:-.9,fontWeight:900,whiteSpace:"nowrap",margin:"12px 0 12px"}}>{t("SELECCIONÁ TU PAÍS", "SELECIONE SEU PAÍS")}</h1><ol aria-label={t("Cómo funciona RentoCampo", "Como funciona a RentoCampo")} style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:"7px 8px",maxWidth:460,margin:0,padding:0,listStyle:"none"}}>{steps.map((step,index)=><li key={step} style={{minWidth:0,display:"flex",alignItems:"center",gap:6,padding:"7px 6px",border:"1px solid rgba(255,255,255,.28)",background:"rgba(0,0,0,.27)",borderRadius:7,fontSize:"clamp(10px,2.5vw,12px)",fontWeight:800,lineHeight:1.2}}><span aria-hidden="true" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",flexShrink:0,width:22,height:22,border:"1px solid rgba(255,225,124,.8)",borderRadius:"50%",color:"#ffe17c",fontSize:13,fontWeight:900}}>{index+1}</span><span>{step}</span></li>)}</ol><p style={{display:"inline-flex",alignItems:"baseline",justifyContent:"center",gap:6,maxWidth:"100%",whiteSpace:"nowrap",color:"#ffe17c",borderBottom:"2px solid #ffe17c",paddingBottom:3,margin:"12px 0 0"}}><span style={{fontSize:"clamp(17px,5.5vw,26px)",fontWeight:900,letterSpacing:-.7}}>{t("100% GRATIS,", "100% GRÁTIS,")}</span><span style={{fontSize:"clamp(21px,6.8vw,33px)",fontWeight:900,letterSpacing:-1}}>{t("SUMATE", "JUNTE-SE")}</span></p></div>
  </section>
  <section style={{padding:"27px 20px 16px"}}><p style={{fontSize:11,letterSpacing:2,fontWeight:800,color:"#777",marginBottom:10}}>{t("EXPLORÁ RENTO CAMPO", "EXPLORE A RENTO CAMPO")}</p><h2 style={{fontSize:23,letterSpacing:-.7,margin:"0 0 19px"}}>{t("¿Qué necesitás hoy?", "Do que você precisa hoje?")}</h2>
  <div style={{display:"grid",gap:10}}>{links.map(item=><Link key={item.href} href={item.href} style={{background:item.dark?"#222":"#fff",color:item.dark?"#fff":"#222",border:item.dark?"none":"1px solid #e4e4e0",borderRadius:13,padding:"17px 18px",textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span><strong style={{fontSize:18,letterSpacing:-.5}}>{item.title}</strong><small style={{display:"block",marginTop:7,opacity:.65,fontSize:12}}>{item.subtitle}</small></span><span style={{fontSize:25}}>{item.icon}</span></Link>)}</div>
  <Link href="/lite/perfil" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,padding:"18px 20px",background:"#eae8e2",color:"#222",borderRadius:16,textDecoration:"none",fontWeight:700}}>{t("Publicar y administrar", "Anunciar e administrar")} <span>↗</span></Link>
  <p style={{fontSize:12,lineHeight:1.5,color:"#777",marginTop:20}}>{t("Preview Lite · Navegación Lite en construcción. Los flujos operativos siguen disponibles desde cada sección.", "Prévia Lite · Navegação em desenvolvimento. As funções continuam disponíveis nas respectivas seções.")}</p></section>
  <nav aria-label="Navegación Lite" style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:520,display:"grid",gridTemplateColumns:"repeat(4,1fr)",background:"#fff",borderTop:"1px solid #e8e8e8",padding:"13px 5px max(13px,env(safe-area-inset-bottom))",zIndex:10}}>
   {[["⌂",t("Inicio", "Início"),"/lite"],["▱",t("Campos", "Terras"),"/lite/campos"],["▦",t("Servicios", "Serviços"),"/lite/servicios"],["◯",t("Perfil", "Perfil"),"/lite/perfil"]].map(([icon,label,href])=><Link key={label} href={href} style={{display:"grid",justifyItems:"center",gap:4,color:"#222",textDecoration:"none",fontSize:11,fontWeight:700}}><span style={{fontSize:22}}>{icon}</span>{label}</Link>)}
  </nav>
 </main>
}