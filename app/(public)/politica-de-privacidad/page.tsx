import type { Metadata } from "next";
import { ShieldCheck, Mail } from "lucide-react";
import Link from "@/components/layout/SiteLink";
import "../terminos-y-condiciones/styles.css";

export const metadata: Metadata = {
  title: "Política de privacidad | RentoCampo",
  description: "Conocé de manera simple cómo RentoCampo utiliza y cuida tus datos.",
  alternates: { canonical: "https://rentocampo.com/politica-de-privacidad" },
  robots: { index: true, follow: true },
};

const topics = ["Qué información usamos","Para qué la necesitamos","Quién puede verlos","Cómo cuidamos tus datos","Tus derechos","Consultas y cambios"];

export default function PoliticaDePrivacidadPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-kicker"><ShieldCheck size={24} aria-hidden="true" /> Privacidad y datos personales · RentoCampo</p>
        <h1>Tu privacidad nos importa</h1>
        <p className="terms-intro">En RentoCampo queremos que conectarte con el campo sea simple y seguro. Te contamos qué información necesitamos, cómo la usamos y cómo podés gestionarla.</p>
        <p className="terms-operator">Contacto sobre privacidad: <a href="mailto:hola@rentocampo.com">hola@rentocampo.com</a></p>
        <p className="terms-date">Actualizada el 11 de noviembre de 2026</p>
      </header>
      <div className="terms-layout">
        <aside className="terms-sidebar">
          <nav aria-label="Índice de política de privacidad">
            <h2>En esta página</h2>
            {topics.map((topic, i) => <a key={topic} href={`#privacidad-${i + 1}`}><span>{String(i + 1).padStart(2, "0")}</span>{topic}</a>)}
          </nav>
          <a className="terms-contact" href="mailto:hola@rentocampo.com?subject=Consulta%20sobre%20privacidad"><Mail size={20} aria-hidden="true" /> Consultar por mis datos</a>
          <Link className="terms-home" href="/terminos-y-condiciones">Ver términos y condiciones</Link>
        </aside>
        <div className="terms-content"><section id="privacidad-1"><h2>1. Qué información usamos</h2><p>Para registrarte, usamos tu nombre y correo electrónico. También guardamos los datos que elegís compartir en tu perfil, publicaciones y mensajes. Si iniciás sesión con Google, recibimos los datos básicos que autorizás, como nombre, email y foto. No accedemos a tu contraseña de Google. El sitio también genera datos técnicos necesarios para las sesiones y la seguridad.</p></section>
<section id="privacidad-2"><h2>2. Para qué la necesitamos</h2><p>Usamos los datos para administrar tu cuenta, publicar campos y servicios, facilitar contactos, enviar avisos operativos, recuperar el acceso y proteger la plataforma. Podemos medir visitas y funcionamiento para mejorar la experiencia. No vendemos tus datos personales.</p></section>
<section id="privacidad-3"><h2>3. Quién puede verlos</h2><p>Otros visitantes pueden ver la información que decidís hacer pública en tus avisos y perfil; tus mensajes llegan a sus destinatarios. Para operar el servicio usamos proveedores tecnológicos como Supabase, Vercel y Google cuando elegís ingresar con esa cuenta. Algunos pueden procesar información desde otros países, con las protecciones aplicables.</p></section>
<section id="privacidad-4"><h2>4. Cómo cuidamos tus datos</h2><p>Utilizamos controles de acceso y medidas de seguridad para proteger la información. La conservamos mientras sea necesaria para el servicio, para resolver solicitudes o por obligaciones legales. Podemos usar cookies de sesión y herramientas de medición de visitas; podés gestionar las cookies desde tu navegador.</p></section>
<section id="privacidad-5"><h2>5. Tus derechos</h2><p>Podés pedir acceso, corrección o eliminación de tus datos y ejercer otros derechos reconocidos por la ley aplicable. Para hacerlo, escribinos a hola@rentocampo.com. Podemos verificar tu identidad para proteger tu cuenta.</p></section>
<section id="privacidad-6"><h2>6. Consultas y cambios</h2><p>Esta política se aplica a rentocampo.com, sus cuentas, publicaciones y herramientas de contacto. Si cambia la forma en que usamos la información, actualizaremos esta página y comunicaremos los cambios importantes cuando corresponda. Contacto: hola@rentocampo.com.</p></section></div></div></article>
  );
}
