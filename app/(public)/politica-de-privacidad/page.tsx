import type { Metadata } from "next";
import { ShieldCheck, Mail } from "lucide-react";
import Link from "@/components/layout/SiteLink";
import "../terminos-y-condiciones/styles.css";

export const metadata: Metadata = {
  title: "Política de privacidad | RentoCampo",
  description: "Cómo RentoCampo recopila, utiliza, comparte y protege los datos personales de usuarios y visitantes.",
  alternates: { canonical: "https://rentocampo.com/politica-de-privacidad" },
  robots: { index: true, follow: true },
};

const topics = [
  "Responsable y alcance",
  "Qué información recopilamos",
  "Cómo obtenemos los datos",
  "Para qué usamos los datos",
  "Bases legales y consentimiento",
  "Visibilidad y destinatarios",
  "Proveedores y transferencias",
  "Conservación y seguridad",
  "Tus derechos y opciones",
  "Cookies y medición",
  "Menores y cambios",
  "Contacto",
];

export default function PoliticaDePrivacidadPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-kicker"><ShieldCheck size={24} aria-hidden="true" /> Privacidad y datos personales · RentoCampo</p>
        <h1>Política de privacidad</h1>
        <p className="terms-intro">Tu información es importante. Te explicamos qué datos utilizamos para conectar propietarios, productores y prestadores de servicios rurales, con quiénes pueden compartirse y cómo ejercer tus derechos.</p>
        <p className="terms-operator">Plataforma: <strong>RentoCampo</strong> · Consultas sobre privacidad: <a href="mailto:hola@rentocampo.com?subject=Privacidad%20y%20datos%20personales">hola@rentocampo.com</a></p>
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
        <div className="terms-content">
          <section id="privacidad-1">
            <h2>1. Responsable y alcance</h2>
            <p>RentoCampo es una plataforma digital de publicaciones y contacto directo entre personas interesadas en campos, actividades y servicios rurales. Esta política se aplica al sitio rentocampo.com, sus páginas públicas, formularios de registro, perfiles, publicaciones, herramientas de búsqueda y mensajería, y comunicaciones relacionadas con el servicio.</p>
            <p>Para consultar por el tratamiento de tus datos, solicitar información o ejercer tus derechos, escribí a <a href="mailto:hola@rentocampo.com">hola@rentocampo.com</a>. Identificá tu cuenta y explicá tu solicitud; nunca envíes contraseñas ni códigos de acceso por correo.</p>
          </section>
          <section id="privacidad-2">
            <h2>2. Qué información recopilamos</h2>
            <p><strong>Cuenta e identidad:</strong> dirección de correo electrónico, nombre o nombre público, datos de perfil y, si los proporcionás, teléfono, ubicación o imagen de perfil. Al iniciar sesión con Google podemos recibir los datos que autorices, habitualmente nombre, correo electrónico e imagen de perfil. No recibimos tu contraseña de Google.</p>
            <p><strong>Publicaciones y contactos:</strong> descripciones, imágenes, zonas geográficas, características de campos y servicios, y los mensajes que enviás mediante las funciones de contacto de la plataforma.</p>
            <p><strong>Información técnica:</strong> dirección IP, navegador, dispositivo, páginas visitadas, eventos de uso, errores y registros de seguridad. Algunas mediciones pueden realizarse mediante cookies o tecnologías similares, según la configuración del navegador y del sitio.</p>
          </section>
          <section id="privacidad-3">
            <h2>3. Cómo obtenemos los datos</h2>
            <p>Recibimos información directamente cuando creás una cuenta, completás un perfil, publicás un aviso, enviás un mensaje o te comunicás con nosotros. También obtenemos datos técnicos automáticamente al utilizar el sitio y datos de autenticación cuando elegís un proveedor de inicio de sesión, como Google.</p>
            <p>Si publicás información de otra persona, debés contar con una base legítima para hacerlo y evitar divulgar información sensible o privada sin autorización.</p>
          </section>
          <section id="privacidad-4">
            <h2>4. Para qué usamos los datos</h2>
            <p>Utilizamos los datos para crear y administrar cuentas, verificar el acceso, recuperar contraseñas, mostrar perfiles y avisos, facilitar búsquedas y contactos, entregar mensajes operativos, atender consultas, prevenir fraude y abuso, investigar incidentes, mantener la seguridad y mejorar el funcionamiento del sitio.</p>
            <p>También podemos analizar estadísticas agregadas de visitas y uso para evaluar el rendimiento de la plataforma. No vendemos tus datos personales como una base comercial de contactos. No utilizamos tu contraseña ni tus credenciales de Google para publicidad.</p>
          </section>
          <section id="privacidad-5">
            <h2>5. Bases legales y consentimiento</h2>
            <p>Según la legislación aplicable y el país desde el que utilices el servicio, tratamos datos para prestar las funciones que solicitás, cumplir obligaciones legales, proteger la seguridad de la plataforma y, cuando corresponda, sobre la base de tu consentimiento. Si una actividad requiere consentimiento específico, podrás otorgarlo o retirarlo por los mecanismos disponibles.</p>
            <p>El retiro del consentimiento no afecta los tratamientos realizados legítimamente con anterioridad ni los datos que debamos conservar por una obligación legal.</p>
          </section>
          <section id="privacidad-6">
            <h2>6. Visibilidad y destinatarios</h2>
            <p>Los datos que incluyas en perfiles públicos, publicaciones o anuncios pueden ser visibles para otros visitantes o usuarios, según la función utilizada. Los mensajes dirigidos a otra persona serán accesibles para sus destinatarios y podrán ser revisados cuando sea necesario para investigar reportes, abusos o problemas de seguridad, conforme a la ley.</p>
            <p>Te recomendamos no publicar documentos de identidad, datos bancarios, contraseñas, información médica ni direcciones particulares que no sean necesarias para ofrecer un campo o servicio.</p>
          </section>
          <section id="privacidad-7">
            <h2>7. Proveedores y transferencias internacionales</h2>
            <p>Para operar la plataforma podemos utilizar proveedores de infraestructura, alojamiento, autenticación, base de datos, correo transaccional, análisis de tráfico y seguridad. Entre las tecnologías utilizadas se encuentran Supabase para servicios de autenticación y datos, Vercel para infraestructura web y Google cuando elegís iniciar sesión con tu cuenta.</p>
            <p>Estos proveedores pueden procesar información en servidores ubicados fuera de tu país. Cuando corresponde, adoptamos medidas contractuales, técnicas y organizativas para protegerla y atender las normas de protección de datos aplicables. No compartimos información personal con anunciantes por el solo hecho de utilizar la plataforma.</p>
          </section>
          <section id="privacidad-8">
            <h2>8. Conservación y seguridad</h2>
            <p>Conservamos los datos durante el tiempo necesario para ofrecer el servicio, mantener registros de seguridad, resolver reclamos y cumplir obligaciones legales. Los períodos concretos dependen del tipo de información y su finalidad. Cuando ya no son necesarios, procuramos eliminarlos o desidentificarlos de forma segura.</p>
            <p>Aplicamos controles de acceso, autenticación y medidas de protección adecuadas al servicio. Ningún sistema es completamente inmune a incidentes: por eso recomendamos utilizar contraseñas únicas, mantener protegido tu correo y avisarnos si detectás un acceso no autorizado.</p>
          </section>
          <section id="privacidad-9">
            <h2>9. Tus derechos y opciones</h2>
            <p>Podés solicitar acceso, actualización, rectificación o eliminación de tus datos, así como oponerte a determinados tratamientos o retirar consentimientos cuando corresponda. Escribinos a <a href="mailto:hola@rentocampo.com?subject=Solicitud%20de%20datos%20personales">hola@rentocampo.com</a> e indicá qué necesitás. Podemos solicitar una verificación razonable de identidad antes de entregar o modificar información.</p>
            <p>La disponibilidad y el alcance de cada derecho dependen de la legislación aplicable. Si considerás que tu solicitud no fue atendida adecuadamente, podés acudir a la autoridad de protección de datos competente en tu jurisdicción.</p>
          </section>
          <section id="privacidad-10">
            <h2>10. Cookies y medición</h2>
            <p>El sitio puede utilizar cookies o almacenamiento local indispensables para mantener sesiones y preferencias, así como herramientas de analítica para comprender el uso de las páginas. Podés gestionar las cookies desde la configuración de tu navegador; deshabilitar las esenciales puede impedir el inicio de sesión o ciertas funciones.</p>
            <p>Cuando la normativa local exija consentimiento previo para tecnologías no esenciales, procuraremos ofrecer los controles correspondientes. Esta política no sustituye los avisos específicos de cookies que puedan mostrarse en el sitio.</p>
          </section>
          <section id="privacidad-11">
            <h2>11. Menores y cambios en esta política</h2>
            <p>RentoCampo está orientado a personas con capacidad legal para participar en actividades y acuerdos rurales. No está diseñado para recopilar intencionalmente datos de menores sin las autorizaciones exigidas por la legislación aplicable. Si detectamos datos aportados indebidamente, podremos tomar medidas para retirarlos.</p>
            <p>Podemos actualizar esta política para reflejar cambios del servicio, de nuestros proveedores o de las normas aplicables. Publicaremos la nueva versión y su fecha en esta misma página, e informaremos cambios importantes por medios razonables.</p>
          </section>
          <section id="privacidad-12">
            <h2>12. Contacto y documentación relacionada</h2>
            <p>Para preguntas sobre privacidad, seguridad o tratamiento de información personal, contactanos en <a href="mailto:hola@rentocampo.com">hola@rentocampo.com</a>. Para conocer las reglas de publicación, contacto y responsabilidad entre usuarios, consultá nuestros <Link href="/terminos-y-condiciones">Términos y condiciones</Link>.</p>
          </section>
        </div>
      </div>
    </article>
  );
}
