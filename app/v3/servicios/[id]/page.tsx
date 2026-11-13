import { unifiedExplorerHref } from "@/lib/campos/unified-search";
import RuralIcon from "../../components/RuralIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, ShieldCheck, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { tituloServicioRural, servicioLabel } from "@/data/servicios-rurales";
import { resolveCountry, displayCountryName } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import { normalizarCoordenada } from "@/lib/campos/visible-fields";
import { publicationPhotos } from "@/lib/publication-photos";
import V3PhotoGallery from "../../components/V3PhotoGallery";
import V3LocationMap from "../../components/V3LocationMap";
import V3DetailFacts from "../../components/V3DetailFacts";
import type { ServicioRural } from "@/types";

export const metadata: Metadata = { title: "Detalle de servicio rural | RentoCampo V3", robots: { index: false, follow: false } };
export default async function V3Servicio({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
 const { id } = await params;
 if (!/^[\da-f-]{36}$/i.test(id)) notFound();
 const filters = await searchParams;
 const client = await createClient();
 const { data, error } = await client.from("servicios_publicaciones")
  .select("*")
  .eq("id",id).eq("activo",true).maybeSingle();
 if(error || !data || id.startsWith("10000000-") || id.startsWith("20000000-")) notFound();
 const country = resolveCountry(data.country_code);
 const t = (es:string,pt:string,en:string) => regionalText(country,es,pt,en);
 const title = tituloServicioRural(data.servicios_rurales as ServicioRural[],country,data.nombre_comercial);
 const photos = publicationPhotos(data.foto_url,data.fotos_urls);
 const back = new URLSearchParams({pais:country});
 for(const key of ["provincia","servicio"]) if(typeof filters[key] === "string" && filters[key]) back.set(key,filters[key]);
 const lat=normalizarCoordenada(data.latitud), lng=normalizarCoordenada(data.longitud);
 const hasLocation=lat!=null && lng!=null && Math.abs(lat)<=90 && Math.abs(lng)<=180;
 return <article className="v3-detail v3-detail-refined">
  <Link href={filters.origen === "home" ? unifiedExplorerHref(filters,country) : `/v3/servicios?${back}`} className="v3-detail-back"><ArrowLeft size={17}/>{t("Volver a servicios","Voltar aos serviços","Back to services")}</Link>
  <div className="v3-detail-eyebrow">{t("SERVICIOS RURALES","SERVIÇOS RURAIS","RURAL SERVICES")}</div>
  <h1>{title}</h1><p className="v3-detail-location"><MapPin size={16}/>{[data.localidad,data.provincia].filter(Boolean).join(", ") || displayCountryName(country,country)}</p>
  <V3PhotoGallery country={country} photos={photos} title={title}/>
  <nav className="v3-detail-jump" aria-label={t("En esta publicación","Neste anúncio","On this listing")}><a href="#informacion">{t("Información","Informações","Details")}</a><a href="#actividades">{t("Actividades","Atividades","Activities")}</a><a href="#ubicacion">{t("Ubicación y cobertura","Localização e cobertura","Location and coverage")}</a></nav>
  <div className="v3-detail-columns"><div>
   <section id="informacion" className="v3-detail-section"><h2>{t("Conocé el servicio","Conheça o serviço","About this service")}</h2><p className="v3-detail-description">{data.detalle || t("El prestador todavía no agregó una descripción.","O prestador ainda não adicionou uma descrição.","The provider has not added a description yet.")}</p><V3DetailFacts facts={[{label:t("País","País","Country"),value:displayCountryName(country,country)},{label:t("Provincia o estado","Estado","State or province"),value:data.provincia},{label:t("Localidad","Localidade","Town"),value:data.localidad},{label:t("Zona de cobertura","Área de atendimento","Coverage area"),value:data.zona}]}/></section>
   <section id="actividades" className="v3-detail-section"><h2>{t("Actividades ofrecidas","Atividades oferecidas","Available activities")}</h2><div className="v3-detail-features">{(data.servicios_rurales || []).map((item:ServicioRural)=><span key={item}><RuralIcon name={item}/>{servicioLabel(item,country)}</span>)}</div></section>
   <section id="ubicacion" className="v3-detail-section"><h2>{t("Ubicación y cobertura","Localização e cobertura","Location and coverage")}</h2>{data.zona && <p className="v3-detail-description">{data.zona}</p>}{hasLocation ? <V3LocationMap lat={lat!} lng={lng!} country={country} title={title}/> : <p className="v3-detail-description">{t("La publicación no informa coordenadas precisas. Se muestra únicamente la zona declarada por el prestador.","O anúncio não informa coordenadas precisas. Apenas a região declarada pelo prestador é exibida.","No precise coordinates were provided. Only the provider's stated area is shown.")}</p>}</section>
  </div><aside className="v3-contact-panel"><span className="v3-kicker">{t("CONTACTO DIRECTO","CONTATO DIRETO","DIRECT CONTACT")}</span><h2>{t("Consultá al prestador","Fale com o prestador","Ask the provider")}</h2><p>{t("Acordá disponibilidad, alcance y condiciones con quien presta el servicio.","Combine disponibilidade, escopo e condições com o prestador.","Discuss availability, scope and terms with the provider.")}</p><div className="v3-contact-disabled" aria-disabled="true"><MessageCircle size={17}/> {t("Contacto deshabilitado en UAT","Contato desabilitado na prévia","Contact disabled in preview")}</div><p className="v3-preview-contact-note">{t("Esta vista previa no envía consultas.","Esta prévia não envia consultas.","This preview does not send inquiries.")}</p><div className="v3-detail-assurance"><ShieldCheck size={18}/>{t("Sin intermediarios ni comisiones","Sem intermediários nem comissões","No intermediaries or commissions")}</div></aside></div>
 </article>;
}
