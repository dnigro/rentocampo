import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveCountry } from "@/data/countries";
import "./styles.css";

export const metadata: Metadata = {
  title: "Alianzas rurales gratuitas | RentoCampo",
  description:
    "Cooperativas, cámaras, asociaciones y redes rurales: sumá a tus asociados a RentoCampo y ayudalos a publicar campos y servicios de forma gratuita.",
  alternates: { canonical: "https://rentocampo.com/alianzas" },
  openGraph: {
    title: "Alianzas rurales | RentoCampo",
    description: "Conectemos cooperativas, contratistas, productores y propietarios sin costo en esta etapa de crecimiento.",
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
  const links = [
    {
      key: "01",
      title: t("Presentá la oportunidad", "Apresente a oportunidade"),
      text: t(
        "Una cooperativa, cámara o entidad comparte la invitación de RentoCampo solo con quien quiera conocerla.",
        "Uma cooperativa, câmara ou entidade compartilha o convite do RentoCampo apenas com quem tiver interesse.",
      ),
    },
    {
      key: "02",
      title: t("Cada asociado decide", "Cada associado decide"),
      text: t(
        "Propietarios y prestadores se registran y publican por cuenta propia; no necesitamos padrones ni contactos de terceros.",
        "Proprietários e prestadores se cadastram e publicam por conta própria; não precisamos de listas ou contatos de terceiros.",
      ),
    },
    {
      key: "03",
      title: t("Medimos oportunidades reales", "Medimos oportunidades reais"),
      text: t(
        "Evaluamos publicaciones activas y contactos generados, no solo cantidad de vistas o seguidores.",
        "Avaliamos anúncios ativos e contatos gerados, não apenas visualizações ou seguidores.",
      ),
    },
  ];
  return (
    <div className="rc-partners">
        <section className="rc-partners-hero">
          <div className="rc-partners-container">
            <p className="rc-partners-eyebrow">{t("RENTOCAMPO · ALIANZAS RURALES", "RENTOCAMPO · PARCERIAS RURAIS")}</p>
            <h1>{t("El campo crece cuando nos conectamos.", "O campo cresce quando nos conectamos.")}</h1>
            <p className="rc-partners-subtitle">
              {t(
                "Invitamos a cooperativas, sociedades rurales, cámaras de contratistas y organizaciones del interior a acercar oportunidades a sus comunidades. Sin pauta ni convenios comerciales obligatorios.",
                "Convidamos cooperativas, entidades rurais, associações de prestadores e organizações do interior a levar oportunidades às suas comunidades. Sem anúncios pagos ou acordos comerciais obrigatórios.",
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
                "Escribinos desde tu institución a hola@rentocampo.com. Respondemos a consultas recibidas voluntariamente.",
                "Escreva em nome da sua organização para hola@rentocampo.com. Respondemos a consultas enviadas voluntariamente.",
              )}
            </p>
          </div>
        </section>

        <section className="rc-partners-content">
          <div className="rc-partners-container">
            <div className="rc-partners-intro">
              <p className="rc-partners-eyebrow">{t("UNA PRUEBA SIMPLE Y FEDERAL", "UM PILOTO SIMPLES E REGIONAL")}</p>
              <h2>{t("Primero oportunidades reales. Después, escala.", "Primeiro oportunidades reais. Depois, escala.")}</h2>
              <p>
                {t(
                  "Buscamos sumar prestadores y campos reales por zona para que los productores tengan a quién consultar. Cada organización conserva su independencia; esta invitación no implica patrocinio ni vínculo formal.",
                  "Queremos reunir prestadores e propriedades reais por região para que os produtores encontrem oportunidades. Cada organização mantém sua independência; este convite não implica patrocínio ou vínculo formal.",
                )}
              </p>
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
                    "En la etapa actual, registrarse, publicar campos o servicios rurales y contactar directamente no tiene costo. No pedimos a las instituciones que compartan datos personales de sus asociados.",
                    "Nesta etapa, cadastrar-se, anunciar propriedades ou serviços rurais e entrar em contato diretamente não tem custo. Não pedimos às instituições dados pessoais de seus associados.",
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
                    "Contanos qué región o actividad representás. Podemos evaluar una difusión voluntaria y acotada, sin acceso a tus padrones de socios.",
                    "Conte qual região ou atividade sua organização representa. Podemos avaliar uma divulgação voluntária e limitada, sem acesso a listas de associados.",
                  )}
                </p>
                <a className="rc-partners-mail" href={propuestaMail}>hola@rentocampo.com</a>
                <p className="rc-partners-small">
                  {t(
                    "No existe convenio ni aval institucional hasta que ambas partes lo acuerden.",
                    "Não existe acordo nem apoio institucional até que ambas as partes concordem.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
