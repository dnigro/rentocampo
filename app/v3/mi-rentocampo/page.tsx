import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { resolveCountry } from "@/data/countries";
import { canAccessManagementReport } from "@/lib/analytics/commercial-filters";
import { UserRound, Heart, MessageCircle, ClipboardList, ArrowUpRight, MapPin, ChartNoAxesCombined, LogIn, Tractor } from "lucide-react";

export const dynamic = "force-dynamic";
export default async function V3Cuenta({ searchParams }: { searchParams: Promise<{ pais?: string }> }) {
  const country = resolveCountry((await searchParams).pais, (await cookies()).get("rentocampo_country")?.value);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const returnPath = `/v3/mi-rentocampo?pais=${country}`;
  if (!user) return <section className="v3-account-page v3-account-welcome">
    <span className="v3-kicker">TU ESPACIO RURAL</span><h1>Mi RentoCampo</h1>
    <p>Tu perfil, tus publicaciones y tus conversaciones, en un mismo lugar.</p>
    <div className="v3-account-signin"><UserRound size={40}/><h2>Ingresá a tu cuenta</h2><p>Usá tu email o continuá con Google. Tus datos y publicaciones se conservan en tu cuenta.</p>
      <Link className="v3-primary-link" href={`/login?next=${encodeURIComponent(returnPath)}`}><LogIn size={18}/> Iniciar sesión</Link>
      <Link href={`/register?pais=${country}`}>Crear una cuenta</Link>
      <Link href="/recuperar-contrasena">Recuperar mi contraseña</Link>
    </div>
  </section>;
  const { data: profile, error } = await supabase.from("profiles").select("nombre, roles, activo").eq("id", user.id).maybeSingle();
  const links = [
    { title: "Mi perfil", description: "Datos personales y configuración", href: "/perfil", Icon: UserRound },
    { title: "Mis campos", description: "Administrar mis publicaciones de campos", href: "/mis-campos", Icon: ClipboardList },
    { title: "Mis servicios", description: "Administrar mis servicios rurales", href: "/mis-servicios-rurales", Icon: Tractor },
    { title: "Mensajes", description: "Consultas y conversaciones de mi cuenta", href: "/mensajes", Icon: MessageCircle },
    { title: "Favoritos", description: "Publicaciones guardadas en mi cuenta", href: "/favoritos", Icon: Heart },
    { title: "Explorar campos", description: "Volver al mapa y al catálogo", href: "/v3/campos", Icon: MapPin },
  ];
  if (user.email_confirmed_at && canAccessManagementReport(user.email)) links.unshift({ title: "Reporte gerencial", description: "Indicadores comerciales por país", href: "/gerencial", Icon: ChartNoAxesCombined });
  return <section className="v3-account-page">
    <header className="v3-account-heading"><span className="v3-kicker">TU ESPACIO RURAL</span><h1>{profile?.nombre ? `Hola, ${profile.nombre.split(" ")[0]}` : "Mi RentoCampo"}</h1><p>Accedé a los módulos de tu cuenta y seguí administrando tus oportunidades.</p></header>
    {(error || !profile) && <p role="status">No pudimos consultar los datos del perfil. Podés volver a intentarlo desde Mi perfil.</p>}
    {profile?.activo === false && <p role="alert">Tu perfil figura inactivo. Revisá el estado de tu cuenta antes de publicar.</p>}
    <nav className="v3-real-account-grid" aria-label="Módulos de mi cuenta">{links.map(({ title, description, href, Icon }) => <Link key={href} href={`${href}?pais=${country}`}><Icon size={25}/><h2>{title}</h2><p>{description}</p><ArrowUpRight size={19}/></Link>)}</nav>
  </section>;
}
