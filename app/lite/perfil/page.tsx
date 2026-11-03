import Image from "next/image";
import heroTambo from "@/public/rentocampo-hero-campo-bn-1920x1080.webp";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ArrowUpRight, FilePenLine, MapPinned, MessageCircle, PlusCircle, UserRound, Wrench } from "lucide-react";
import { resolveCountry } from "@/data/countries";
import { regionalText } from "@/lib/i18n/regional";
import LiteHeader from "@/components/lite/LiteHeader";
import LiteProfilePanel from "@/components/lite/LiteProfilePanel";
import { createClient } from "@/lib/supabase/server";
import "@/styles/rc-lite-profile-cards.css";

export default async function Page() {
  const country = resolveCountry((await cookies()).get("rentocampo_country")?.value);
  const tt = (es: string, pt: string) => regionalText(country, es, pt);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.user_metadata?.onboarding_pending_roles === true) {
    redirect("/lite/perfil/editar");
  }

  const links = [
    { href: "/lite/perfil/editar", title: tt("Editar mi perfil", "Editar meu perfil"), description: tt("Datos y configuración", "Dados e configurações"), Icon: UserRound },
    { href: "/lite/campos/publicar", title: tt("Publicar campo", "Anunciar terra"), description: tt("Nueva publicación", "Novo anúncio"), Icon: PlusCircle },
    { href: "/lite/servicios/publicar", title: tt("Publicar servicio", "Anunciar serviço"), description: tt("Nueva oferta rural", "Nova oferta rural"), Icon: Wrench },
    { href: "/lite/campos/mis-publicaciones", title: tt("Mis publicaciones", "Meus anúncios"), description: tt("Gestionar campos", "Gerenciar terras"), Icon: MapPinned },
    { href: "/lite/servicios/mis-publicaciones", title: tt("Mis servicios", "Meus serviços"), description: tt("Gestionar ofertas", "Gerenciar ofertas"), Icon: FilePenLine },
    { href: "/lite/perfil/mensajes", title: tt("Mis mensajes", "Minhas mensagens"), description: tt("Consultas y contactos", "Consultas e contatos"), Icon: MessageCircle },
  ];

  return (
    <>
      <LiteHeader />
      <main className="rc-lite-profile">
        <div className="rc-lite-profile__eyebrow">{tt("MI CUENTA", "MINHA CONTA")}</div>
        <h1 className="rc-lite-profile__title">{tt("Mi perfil", "Meu perfil")}</h1>
        <p className="rc-lite-profile__subtitle">{tt("Tus publicaciones, mensajes y datos", "Seus anúncios, mensagens e dados")}</p>
        <div className="rc-lite-profile__photo">
          <Image src={heroTambo} alt={tt("Paisaje rural de RentoCampo", "Paisagem rural da RentoCampo")} fill sizes="(max-width:520px) 100vw, 520px"
            style={{ objectFit: "cover", objectPosition: "65% center", filter: "grayscale(1) contrast(1.1) brightness(.73)" }} />
        </div>
        <LiteProfilePanel />
        <p className="rc-lite-profile__hint">
          {user
            ? tt("Administrá tu cuenta y publicaciones.", "Gerencie sua conta e seus anúncios.")
            : tt("Ingresá o creá tu cuenta para publicar y administrar.", "Entre ou crie sua conta para anunciar e gerenciar.")}
        </p>
        {user && (
          <section className="rc-lite-profile__links" aria-label={tt("Accesos a mi cuenta", "Acessos à minha conta")}>
            {links.map(({ href, title, description, Icon }) => (
              <Link key={href} href={href} className="rc-lite-profile__link">
                <span className="rc-lite-profile__link-icon"><Icon size={28} strokeWidth={1.85} aria-hidden="true" /></span>
                <span className="rc-lite-profile__link-body">
                  <strong>{title}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight className="rc-lite-profile__link-arrow" size={19} aria-hidden="true" />
              </Link>
            ))}
          </section>
        )}
        <nav className="rc-lite-profile__nav" aria-label={tt("Navegación Lite", "Navegação Lite")}>
          <Link href="/lite">{tt("Inicio", "Início")}</Link>
          <Link href="/lite/campos">{tt("Campos", "Terras")}</Link>
          <Link href="/lite/servicios">{tt("Servicios", "Serviços")}</Link>
          <Link href="/lite/perfil" aria-current="page">Perfil</Link>
        </nav>
      </main>
    </>
  );
}
