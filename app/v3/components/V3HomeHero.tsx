import Image from "next/image";
import Link from "@/components/layout/SiteLink";
import { Anton } from "next/font/google";
import type { CountryCode } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import styles from "./V3EditorialHero.module.css";

const editorialFont = Anton({subsets:["latin"],weight:"400",display:"swap",variable:"--font-editorial-hero"});
export default function V3HomeHero({country}: {country: CountryCode}) {
 const t=(es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
 return <section className={`rural-hero-band ${styles.hero} ${editorialFont.variable}`} aria-labelledby="v3-home-title">
  <div className={styles.image}><Image src="/landing-campo-rentocampo.jpg" alt="" fill priority sizes="100vw"/></div>
  <div className={styles.shade}/>
  <div className={styles.content}>
   <h1 id="v3-home-title" className={styles.title}><span>{t("Tu campo tiene potencial.","Sua terra tem potencial.","Your land has potential.")}</span><span className={styles.emphasis}>{t("Hacelo visible.","Dê visibilidade a ela.","Make it visible.")}</span></h1>
   <p className={styles.description}>{t("Conectamos propietarios, productores y servicios rurales para encontrar nuevas oportunidades.","Conectamos proprietários, produtores e serviços rurais para encontrar novas oportunidades.","Connecting landowners, farmers and rural services to find new opportunities.")}</p>
   <div className={styles.actions}><Link href={`/mis-campos/nuevo?pais=${country}`} className={styles.primary}>{t("Publicá tu campo","Anuncie sua terra","List your farmland")}</Link><Link href={`/v3?pais=${country}&tipo=campo#explorar`} className={styles.secondary}>{t("Explorar campos","Explorar terras","Explore farmland")}</Link></div>
  </div>
  <div className={styles.benefits}><div><span>{t("Publicar es gratis","Anunciar é grátis","Free listings")}</span><span>{t("Contacto directo","Contato direto","Direct contact")}</span><span>{t("Campos y servicios rurales","Terras e serviços rurais","Farmland and rural services")}</span></div></div>
 </section>;
}
