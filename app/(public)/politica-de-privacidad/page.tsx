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
        <p className="terms-kicker"><ShieldCheck size={24} aria-hidden="true" /> Privacidad y datos personales · <strong>RentoCampo</strong></p>
        <h1>Tu privacidad nos importa</h1>
        <p className="terms-intro">En <strong>RentoCampo</strong> queremos que conectarte con el campo sea simple y seguro. Te contamos qué información necesitamos, cómo la usamos y cómo podés gestionarla.</p>
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
        <div className="terms-content"><section id="privacidad-1"><h2>1. Qué información usamos</h2><p>Para crear una cuenta, necesitamos datos básicos como tu nombre y correo electrónico. También utilizamos la información que decidís agregar a tu perfil, a tus publicaciones o a los mensajes que enviás. Si elegís ingresar con tu cuenta de Google, podemos recibir los datos de perfil que autorices. No recibimos tu contraseña de Google. Durante el uso del sitio también se generan datos necesarios para el funcionamiento, la seguridad y la medición de visitas.</p></section>
<section id="privacidad-2"><h2>2. Para qué la necesitamos</h2><p>En <strong>RentoCampo</strong> usamos esta información para que puedas publicar campos o servicios rurales, encontrar oportunidades, contactar a otros usuarios y administrar tu cuenta. También la utilizamos para responder consultas, enviar comunicaciones relacionadas con el servicio, mantener la seguridad y mejorar la experiencia. No comercializamos bases de datos personales de nuestros usuarios.</p></section>
<section id="privacidad-3"><h2>3. Quién puede verlos</h2><p>Los datos que elegís publicar en un aviso o perfil público pueden ser vistos por quienes visitan la plataforma. Los mensajes se comparten con las personas a las que los dirigís. Para prestar el servicio, cierta información puede ser tratada por empresas que nos brindan servicios de alojamiento, autenticación, comunicaciones o mantenimiento, sujetas a las obligaciones de privacidad que correspondan. Estos tratamientos pueden realizarse fuera de tu país, según el servicio utilizado y la normativa aplicable.</p></section>
<section id="privacidad-4"><h2>4. Cómo cuidamos tus datos</h2><p>En <strong>RentoCampo</strong> buscamos proteger tu información mediante medidas de seguridad y acceso apropiadas. Conservamos los datos mientras sean necesarios para ofrecer el servicio, atender solicitudes o cumplir obligaciones legales. Utilizamos tecnologías de sesión y podemos emplear herramientas de medición para comprender cómo se usa el sitio. Podés administrar las cookies desde tu navegador, aunque algunas son necesarias para iniciar sesión.</p></section>
<section id="privacidad-5"><h2>5. Tus derechos</h2><p>Podés solicitar acceso, actualización o eliminación de tus datos personales, además de ejercer los derechos que reconozca la legislación aplicable. Para hacerlo, escribinos a <a href="mailto:hola@rentocampo.com">hola@rentocampo.com</a>. Para cuidar tu información, podemos pedirte que confirmes tu identidad.</p></section>
<section id="privacidad-6"><h2>6. Consultas y cambios</h2><p>Esta política explica el uso de la información en <strong>RentoCampo</strong>, incluidas las cuentas, publicaciones y herramientas de contacto. Si realizamos cambios importantes, actualizaremos esta página y los comunicaremos cuando corresponda. Si tenés dudas, escribinos a <a href="mailto:hola@rentocampo.com">hola@rentocampo.com</a>.</p></section></div></div></article>
  );
}
