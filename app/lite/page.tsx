import Link from "next/link";
import Image from "next/image";
import LiteHeader from "@/components/lite/LiteHeader";
import "@/styles/lite-direct-hero.css";
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
  <section className="rcLiteDirectHero" aria-labelledby="rcLiteDirectHero-title">
   <Image src={heroTambo} alt="" fill priority sizes="(max-width: 520px) 100vw, 520px" className="rcLiteDirectHero__image"/>
   <div className="rcLiteDirectHero__tone" aria-hidden="true"/>
   <div className="rcLiteDirectHero__body">
    <p className="rcLiteDirectHero__eyebrow">{t("CONECTAMOS EL CAMPO","CONECTAMOS O CAMPO")}</p>
    <h1 id="rcLiteDirectHero-title" className="rcLiteDirectHero__title">
     <span>{t("SIN","SEM")}</span>
     <span>{t("INTERMEDIARIOS.","INTERMEDIÁRIOS.")}</span>
    </h1>
    <div className="rcLiteDirectHero__features" aria-label={t("Mapas, chat, productores, tierras y servicios","Mapas, chat, produtores, terras e serviços")}>
     <p className="rcLiteDirectHero__featurePrimary">{t("MAPAS + CHAT ONLINE","MAPAS + CHAT ONLINE")}</p>
     <p className="rcLiteDirectHero__featureSecondary">{t("Productores + Tierra + Servicios","Produtores + Terras + Serviços")}</p>
    </div>
    <p className="rcLiteDirectHero__line">{t("Vos publicás. Vos contactás. Vos acordás.","Você anuncia. Você conversa. Você combina.")}</p>
    <Link href="/lite/cuenta/registro" className="rcLiteDirectHero__register">{t("REGISTRATE GRATIS","CADASTRE-SE GRÁTIS")} <span aria-hidden="true">→</span></Link>
    <div className="rcLiteDirectHero__stats" aria-label={t("Sin comisiones y contacto directo","Sem comissões e contato direto")}>
     <div><strong>0%</strong><span>{t("COMISIONES.","COMISSÕES.")}</span></div>
     <div><strong>100%</strong><span>{t("CONTACTO DIRECTO.","CONTATO DIRETO.")}</span></div>
    </div>
   </div>
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