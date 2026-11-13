import Link from "@/components/layout/RegionalLink";
import { ChevronRight, UserRound, MapPinned, Tractor, Heart, MessageCircle, ChartNoAxesCombined, type LucideIcon } from "lucide-react";
import { regionalText } from "@/lib/i18n/regional";
import type { CountryCode } from "@/data/countries";
import styles from "./AccountOverview.module.css";

type Props = { name?: string | null; roles: readonly string[]; country: CountryCode; canViewReport: boolean; showAllPublications?: boolean };
export default function AccountOverview({ name, roles, country, canViewReport, showAllPublications=false }: Props) {
 const t = (es:string,pt:string,en:string)=>regionalText(country,es,pt,en);
 const labels = [roles.includes("productor") && t("Productor","Produtor","Farmer"),roles.includes("propietario") && t("Propietario","Proprietário","Landowner"),roles.includes("prestador") && t("Servicios rurales","Serviços rurais","Rural services")].filter(Boolean);
 const items: {href:string;title:string;description:string;Icon:LucideIcon}[] = [
  {href:"/perfil",title:t("Mi perfil","Meu perfil","My profile"),description:t("Datos personales y configuración","Dados pessoais e configurações","Personal details and settings"),Icon:UserRound},
  ...(showAllPublications||roles.includes("productor")||roles.includes("propietario")?[{href:"/mis-campos",title:t("Mis campos","Minhas terras","My farmland"),description:t("Publicá y gestioná tus campos","Anuncie e gerencie suas terras","List and manage your farmland"),Icon:MapPinned}]:[]),
  ...(showAllPublications||roles.includes("prestador")?[{href:"/mis-servicios-rurales",title:t("Mis servicios rurales","Meus serviços rurais","My rural services"),description:t("Tus servicios y zonas de trabajo","Seus serviços e regiões de trabalho","Your services and coverage areas"),Icon:Tractor}]:[]),
  {href:"/favoritos",title:t("Favoritos","Favoritos","Favorites"),description:t("Tus publicaciones guardadas","Seus anúncios salvos","Your saved listings"),Icon:Heart},
  {href:"/mensajes",title:t("Mensajes","Mensagens","Messages"),description:t("Consultas y conversaciones","Consultas e conversas","Inquiries and conversations"),Icon:MessageCircle},
  ...(canViewReport?[{href:"/gerencial",title:t("Reporte gerencial","Relatório gerencial","Management report"),description:t("Actividad y evolución por país","Atividade e evolução por país","Activity and trends by country"),Icon:ChartNoAxesCombined}]:[]),
 ];
 return <section data-account-overview className={styles.overview} aria-labelledby="account-overview-title">
  <header className={styles.header}><span className={styles.eyebrow}>{t("MI CUENTA","MINHA CONTA","MY ACCOUNT")}</span><h1 id="account-overview-title" className={styles.title}>{t("Hola","Olá","Hello")}, {name?.trim().split(/\s+/)[0] || t("bienvenido","bem-vindo","welcome")}</h1><p className={styles.roles}>{labels.join(" · ") || t("Tu espacio en RentoCampo","Seu espaço na RentoCampo","Your space on RentoCampo")}</p></header>
  <nav className={styles.grid} aria-label={t("Accesos de mi cuenta","Acessos da minha conta","Account shortcuts")}>{items.map(item=><Link key={item.href} href={item.href} fallbackCountry={country} className={styles.card}><span className={styles.icon}><item.Icon size={20} strokeWidth={1.5} aria-hidden="true"/></span><span className={styles.copy}><strong>{item.title}</strong><span>{item.description}</span></span><ChevronRight className={styles.arrow} size={16} strokeWidth={1.5} aria-hidden="true"/></Link>)}</nav>
 </section>;
}
