import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import "./styles.css";

export const metadata: Metadata = {
  title: "Alianzas rurales gratuitas | RentoCampo",
  description:
    "Invitá a tus asociados a publicar campos y servicios rurales gratis. Una propuesta de colaboración para cooperativas, cámaras y organizaciones del campo.",
  alternates: { canonical: "https://rentocampo.com/alianzas" },
  openGraph: {
    title: "Alianzas rurales | RentoCampo",
    description: "Más visibilidad para tus asociados: campos, servicios rurales y contacto directo, sin costo de publicación en esta etapa.",
    url: "https://rentocampo.com/alianzas",
    type: "website",
    locale: "es_AR",
  },
};

const propuestaMail = "mailto:hola@rentocampo.com?subject=Propuesta%20de%20alianza%20rural%20-%20RentoCampo";

export default async function AlianzasPage() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const pt = country === "BR";
  const t = (es: string, br: string) => (pt ? br : es);
  const shareTarget = `https://rentocampo.com/alianzas?utm_source=whatsapp&utm_medium=referral&utm_campaign=alianzas_organicas_2026&pais=${country}`;
  const shareText = pt
    ? "Conheça o RentoCampo: anuncie propriedades e serviços rurais gratuitamente nesta etapa. "
    : "Conocé RentoCampo: publicá campos y servicios rurales gratis en esta etapa. ";
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(shareText + shareTarget)}`;
  const facebookShareHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://rentocampo.com/alianzas")}`;

  const links = [
    {
      key: "01",
      title: t("Compartí la invitación", "Compartilhe o convite"),
      text: t(
        "Compartí RentoCampo en tus canales institucionales para que tus asociados conozcan esta herramienta.",
        "Compartilhe o RentoCampo pelos canais da sua organização para que os associados conheçam a plataforma.",
      ),
    },
    {
      key: "02",
      title: t("Tus asociados publican gratis", "Seus associados anunciam grátis"),
      text: t(
        "Cada propietario o prestador crea su perfil y publica su campo o servicio sin costo durante esta etapa.",
        "Cada proprietário ou prestador cria seu perfil e anuncia a propriedade ou serviço gratuitamente nesta etapa.",
      ),
    },
    {
      key: "03",
      title: t("El contacto es directo", "O contato é direto"),
      text: t(
        "Los interesados pueden encontrar las publicaciones por zona y consultar directamente al anunciante.",
        "Os interessados podem encontrar anúncios por região e entrar em contato diretamente com quem publicou.",
      ),
    },
  ];
  return (
    <div className="rc-partners">
        <section className="rc-partners-hero">
          <div className="rc-partners-container">
            <p className="rc-partners-eyebrow">{t("RENTOCAMPO · ALIANZAS RURALES", "RENTOCAMPO · PARCERIAS RURAIS")}</p>
            <h1>{t("Más oportunidades para tus asociados. Más conexiones para el campo.", "Mais oportunidades para seus associados. Mais conexões para o campo.")}</h1>
            <p className="rc-partners-subtitle">
              {t(
                "Si representás una cooperativa, cámara o entidad rural, invitá a tu comunidad a publicar campos y servicios en RentoCampo. La participación y el contacto son gratuitos en esta etapa.",
                "Se você representa uma cooperativa, associação ou entidade rural, convide sua comunidade para anunciar propriedades e serviços no RentoCampo. Participar e entrar em contato é gratuito nesta etapa.",
              )}
            </p>
            <div className="rc-partners-actions">
              <a className="rc-partners-btn rc-partners-btn-primary" href={propuestaMail}>
                {t("Proponer una colaboración", "Propor uma parceria")}
              </a>
              <Link className="rc-partners-btn rc-partners-btn-secondary" href="/servicios-rurales">
                {t("Conocer la plataforma", "Conhecer a plataforma")}
              </Link>
            </div>
            <p className="rc-partners-note">
              {t(
                "¿Representás una entidad rural? Escribinos a hola@rentocampo.com.",
                "Representa uma entidade rural? Escreva para hola@rentocampo.com.",
              )}
            </p>
          </div>
        </section>

        <section className="rc-partners-content">
          <div className="rc-partners-container">
            <div className="rc-partners-intro">
              <p className="rc-partners-eyebrow">{t("UNA PROPUESTA PARA TU COMUNIDAD", "UMA PROPOSTA PARA SUA COMUNIDADE")}</p>
              <h2>{t("Ayudá a que el trabajo de tus asociados se vea.", "Dê mais visibilidade ao trabalho dos seus associados.")}</h2>
              <p>
                {t(
                  "RentoCampo reúne publicaciones de propietarios y prestadores rurales para que los productores encuentren opciones por zona. Tu organización puede compartir esta oportunidad sin administrar registros ni publicaciones.",
                  "O RentoCampo reúne anúncios de proprietários e prestadores rurais para que os produtores encontrem opções por região. Sua organização pode compartilhar essa oportunidade sem gerenciar cadastros ou anúncios.",
                )}
              </p>
            </div>
            <div className="rc-partners-share" aria-label={t("Compartir la invitación", "Compartilhar o convite")}>
              <div>
                <h3>{t("¿Querés acercar RentoCampo a tu comunidad?", "Quer compartilhar o RentoCampo com a sua comunidade?")}</h3>
                <p>{t(
                  "Compartí esta página desde tus canales. Cada institución y cada asociado decide si participa.",
                  "Compartilhe esta página pelos seus canais. Cada entidade e cada associado decide se deseja participar.",
                )}</p>
              </div>
              <div className="rc-partners-share-actions">
                <a href={whatsappShareHref} target="_blank" rel="noopener noreferrer" className="rc-partners-btn rc-partners-btn-dark">
                  {t("Compartir por WhatsApp", "Compartilhar no WhatsApp")}
                </a>
                <a href={facebookShareHref} target="_blank" rel="noopener noreferrer" className="rc-partners-btn rc-partners-btn-outline">
                  {t("Compartir en Facebook", "Compartilhar no Facebook")}
                </a>
              </div>
            </div>
            <div className="rc-partners-grid">
              {links.map((step) => (
                <article className="rc-partners-card" key={step.key}>
                  <span aria-hidden="true" className="rc-partners-number">{step.key}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
            <div className="rc-partners-split">
              <div>
                <p className="rc-partners-eyebrow">{t("PARA PRESTADORES Y PROPIETARIOS", "PARA PRESTADORES E PROPRIETÁRIOS")}</p>
                <h2>{t("Participar es gratis.", "Participar é gratuito.")}</h2>
                <p>
                  {t(
                    "Registrarse, publicar campos o servicios rurales y contactar directamente es gratis en esta etapa. Cada persona participa por decisión propia.",
                    "Cadastrar-se, anunciar propriedades ou serviços rurais e entrar em contato diretamente é grátis nesta etapa. Cada pessoa decide se quer participar.",
                  )}
                </p>
                <Link className="rc-partners-btn rc-partners-btn-dark" href={pt ? "/register?tipo=prestador&pais=BR" : "/register?tipo=prestador"}>
                  {t("Publicar mi servicio gratis", "Anunciar meu serviço grátis")}
                </Link>
              </div>
              <div className="rc-partners-contact">
                <p className="rc-partners-eyebrow">{t("CONTACTO INSTITUCIONAL", "CONTATO INSTITUCIONAL")}</p>
                <h3>{t("¿Representás una organización?", "Representa uma organização?")}</h3>
                <p>
                  {t(
                    "Contanos qué región o actividad representás. Podemos facilitarte una invitación breve para compartir con tus asociados, sin pedirte bases de datos ni información personal.",
                    "Conte qual região ou atividade sua organização representa. Podemos preparar um convite breve para seus associados, sem solicitar listas ou dados pessoais.",
                  )}
                </p>
                <a className="rc-partners-mail" href={propuestaMail}>hola@rentocampo.com</a>
                <p className="rc-partners-small">
                  {t(
                    "La difusión es voluntaria y no requiere exclusividad ni convenio comercial.",
                    "A divulgação é voluntária e não exige exclusividade nem acordo comercial.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
