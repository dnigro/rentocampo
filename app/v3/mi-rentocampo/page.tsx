import { v3Text } from "@/lib/i18n/v3-copy";
import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { canAccessManagementReport } from "@/lib/analytics/commercial-filters";
import { UserRound, Heart, MessageCircle, ClipboardList, ArrowUpRight, MapPin, ChartNoAxesCombined, LogIn, Tractor } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function V3Cuenta({ searchParams }: { searchParams: Promise<{ pais?: string }> }) {
  const country = resolveCountry((await searchParams).pais, (await cookies()).get("rentocampo_country")?.value);
  const t = (source: string) => v3Text(country, source);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const returnPath = `/v3/mi-rentocampo?pais=${country}`;
  if (!user) return <section className="v3-account-page v3-account-welcome">
    <span className="v3-kicker">{t("TU ESPACIO RURAL")}</span><h1>{t("Mi RentoCampo")}</h1>
    <p>{t("Tu perfil, tus publicaciones y tus conversaciones, en un mismo lugar.")}</p>
    <div className="v3-account-signin"><UserRound size={40}/><h2>{t("Ingresá a tu cuenta")}</h2><p>{t("Usá tu email o continuá con Google. Tus datos y publicaciones se conservan en tu cuenta.")}</p>
      <Link className="v3-primary-link" href={`/login?next=${encodeURIComponent(returnPath)}`}><LogIn size={18}/>{t("Iniciar sesión")}</Link>
      <Link href={`/register?pais=${country}`}>{t("Crear una cuenta")}</Link>
      <Link href="/recuperar-contrasena">{t("Recuperar mi contraseña")}</Link>
    </div>
  </section>;
  const { data: profile, error } = await supabase.from("profiles").select("nombre, roles, activo").eq("id", user.id).maybeSingle();
  const links = [
    { title: t("Mi perfil"), description: t("Datos personales y configuración"), href: "/perfil", Icon: UserRound },
    { title: t("Mis campos"), description: t("Administrar mis publicaciones de campos"), href: "/mis-campos", Icon: ClipboardList },
    { title: t("Mis servicios"), description: t("Administrar mis servicios rurales"), href: "/mis-servicios-rurales", Icon: Tractor },
    { title: t("Mensajes"), description: t("Consultas y conversaciones de mi cuenta"), href: "/mensajes", Icon: MessageCircle },
    { title: t("Favoritos"), description: t("Publicaciones guardadas en mi cuenta"), href: "/favoritos", Icon: Heart },
    { title: t("Explorar campos"), description: t("Volver al mapa y al catálogo"), href: "/v3/campos", Icon: MapPin },
  ];
  if (user.email_confirmed_at && canAccessManagementReport(user.email)) links.unshift({ title: t("Reporte gerencial"), description: t("Indicadores comerciales por país"), href: "/gerencial", Icon: ChartNoAxesCombined });
  return <section className="v3-account-page">
    <header className="v3-account-heading"><span className="v3-kicker">{t("TU ESPACIO RURAL")}</span><h1>{profile?.nombre ? `${t("Hola,")} ${profile.nombre.split(" ")[0]}` : t("Mi RentoCampo")}</h1><p>{t("Accedé a los módulos de tu cuenta y seguí administrando tus oportunidades.")}</p></header>
    {(error || !profile) && <p role="status">{t("No pudimos consultar los datos del perfil. Podés volver a intentarlo desde Mi perfil.")}</p>}
    {profile?.activo === false && <p role="alert">{t("Tu perfil figura inactivo. Revisá el estado de tu cuenta antes de publicar.")}</p>}
    <nav className="v3-real-account-grid" aria-label={t("Módulos de mi cuenta")}>{links.map(({ title, description, href, Icon }) => <Link key={href} href={`${href}?pais=${country}`}><Icon size={25}/><h2>{title}</h2><p>{description}</p><ArrowUpRight size={19}/></Link>)}</nav>
  </section>;
}
