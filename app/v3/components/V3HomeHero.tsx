import Image from "next/image";
import Link from "@/components/layout/SiteLink";
import { Montserrat } from "next/font/google";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import styles from "./V3EditorialHero.module.css";

const monumentalFont = Montserrat({subsets:["latin"],weight:["800","900"],display:"swap",variable:"--font-monumental-hero"});
export default function V3HomeHero({country}: {country: CountryCode}) {
 const t=(es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
 return <section className={`rural-hero-band ${styles.hero} ${monumentalFont.variable}`} aria-labelledby="v3-home-title">
  <div className={styles.image}><Image src="/hero-cow-monochrome.png" alt="" fill priority sizes="(max-width:650px) 70vw,55vw"/></div>
  <div className={styles.content}>
   <h1 id="v3-home-title" className={styles.title}><span>{t("EL CAMPO","O CAMPO","THE COUNTRYSIDE")}</span><span className={styles.emphasis}>{t("TE CONECTA","CONECTA VOCÊ","CONNECTS YOU")}</span></h1>
   <p className={styles.description}>{t("Campos y servicios rurales. Contacto directo.","Terras e serviços rurais. Contato direto.","Farmland and rural services. Direct contact.")}</p>
   <div className={styles.actions}><Link href={`/v3?pais=${country}&vista=mapa#explorar`} className={styles.primary}>{t("Explorar mapa","Explorar mapa","Explore map")}</Link><Link href={`/registro?pais=${country}`} className={styles.secondary}>{t("Quiero publicar","Quero anunciar","Create a listing")}</Link></div>
  </div>

 </section>;
}
