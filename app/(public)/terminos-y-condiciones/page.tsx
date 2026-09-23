import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Términos y condiciones | RentoCampo",
  description:
    "Condiciones de uso de RentoCampo para propietarios, productores y prestadores de servicios rurales.",
  alternates: { canonical: "https://rentocampo.com/terminos-y-condiciones" },
};

export default function TerminosYCondicionesPage() {
  return (
    <article className="terms-page">
      <header className="terms-header">
        <p className="terms-kicker">Información legal · RentoCampo</p>
        <h1>Términos y condiciones</h1>
        <p className="terms-intro">
          RentoCampo es un espacio para publicar oportunidades rurales y poner
          en contacto a propietarios, productores y prestadores. Leé estas
          condiciones antes de publicar, contactar o contratar con otra persona.
        </p>
        <p className="terms-date">Versión del 23 de septiembre de 2026</p>
      </header>

      <div className="terms-content">
        <section>
          <h2>1. Alcance y rol de RentoCampo</h2>
          <p>
            RentoCampo ofrece herramientas para crear perfiles, publicar campos
            o servicios rurales, buscar oportunidades y comunicarse por la
            plataforma. Salvo que se informe expresamente lo contrario en un
            servicio específico, RentoCampo no es propietario, arrendador,
            productor, empleador, contratista, asegurador ni representante de
            quienes publican o responden a los avisos. La disponibilidad de un
            anuncio o de un chat no significa que RentoCampo haya verificado,
            avalado o garantizado a la persona, al inmueble, al servicio o a la
            operación propuesta.
          </p>
        </section>

        <section>
          <h2>2. Cuenta y publicaciones</h2>
          <p>
            Quien usa RentoCampo debe aportar información veraz, actualizada y
            suficiente; mantener segura su cuenta; y publicar únicamente
            campos, derechos o servicios que esté legitimado para ofrecer. No
            debe suplantar identidades, ocultar restricciones relevantes,
            publicar datos o imágenes ajenos sin autorización, ni anunciar
            condiciones engañosas. El contenido de cada perfil, publicación y
            mensaje es responsabilidad de quien lo genera.
          </p>
          <p>
            RentoCampo puede solicitar correcciones o documentación y retirar
            publicaciones o restringir cuentas cuando existan indicios
            razonables de fraude, ilegalidad, riesgo para otras personas o
            incumplimiento de estas condiciones. Se informará el motivo por
            los medios disponibles, salvo que hacerlo afecte una investigación,
            la seguridad o una obligación legal.
          </p>
        </section>

        <section>
          <h2>3. Acuerdos entre usuarios</h2>
          <p>
            Los contactos y negociaciones se realizan directamente entre las
            partes. Cada una decide libremente si contrata y bajo qué
            condiciones. RentoCampo no participa en la negociación, firma,
            ejecución, cobro o resolución de arrendamientos, aparcerías,
            compraventas, labores o prestaciones rurales acordadas entre
            usuarios, salvo que una función futura lo indique expresamente con
            sus propias condiciones.
          </p>
          <p>
            Antes de entregar dinero, ingresar a un campo o iniciar tareas,
            las partes deben verificar identidad, representación y facultades
            para contratar; ubicación, titularidad o derecho de uso y estado
            del inmueble o de los equipos; precio, plazos, forma de pago,
            alcance del trabajo, seguros, responsabilidades y condiciones de
            entrega. Es recomendable documentar por escrito lo acordado y
            obtener asesoramiento profesional cuando corresponda.
          </p>
        </section>

        <section>
          <h2>4. Obligaciones rurales y trato leal</h2>
          <p>
            Cada parte debe cumplir las normas que correspondan a su actividad
            y al lugar de ejecución, incluidas las obligaciones agrarias,
            laborales, fiscales, ambientales, sanitarias, de seguridad,
            habilitaciones, permisos y seguros. Quien presta un servicio rural
            responde por su oferta, personal, equipos, habilitaciones y
            ejecución; quien ofrece un campo responde por su legitimación y
            por la información que proporciona. Estas asignaciones no alteran
            las responsabilidades que establezca la ley o el contrato entre
            las partes.
          </p>
          <p>
            Se prohíben el fraude, las solicitudes de pagos engañosas, la
            discriminación, las amenazas, la difusión no autorizada de datos
            personales y cualquier uso del chat para perjudicar a terceros.
          </p>
        </section>

        <section>
          <h2>5. Pagos y condiciones comerciales</h2>
          <p>
            RentoCampo no recibe, custodia ni garantiza pagos entre usuarios
            por operaciones rurales, salvo que una funcionalidad futura lo
            indique de modo expreso. La primera publicación de un campo es
            gratuita. Si se ofrecen planes pagos para publicar más, su precio,
            vigencia, prestaciones y condiciones aplicables deberán mostrarse
            antes de contratar; estos términos no crean por sí mismos un cargo
            ni una suscripción.
          </p>
        </section>

        <section>
          <h2>6. Alcance de la responsabilidad</h2>
          <p>
            RentoCampo presta el servicio digital de publicación, búsqueda y
            contacto. En la medida permitida por la ley, no garantiza que una
            publicación sea exacta, que una contraparte cumpla lo prometido o
            que una negociación concluya, y no asume obligaciones derivadas de
            contratos celebrados exclusivamente entre usuarios. Los reclamos
            por incumplimientos, daños, pagos, calidad del trabajo o conflictos
            relativos a esos contratos deben dirigirse a la parte involucrada,
            sin perjuicio de las vías legales que correspondan.
          </p>
          <p>
            Nada de estas condiciones excluye o limita la responsabilidad de
            RentoCampo por sus propias acciones u omisiones cuando la ley la
            imponga, ni restringe derechos irrenunciables de consumidores o
            usuarios. RentoCampo atenderá las comunicaciones sobre usos
            indebidos de la plataforma y adoptará las medidas que correspondan
            según el caso.
          </p>
        </section>

        <section>
          <h2>7. Reportes y conflictos</h2>
          <p>
            Si detectás una publicación falsa, una conducta desleal o un
            posible fraude, escribí a{" "}
            <a href="mailto:hola@rentocampo.com?subject=Reporte%20de%20uso%20indebido">
              hola@rentocampo.com
            </a>{" "}
            e incluí el enlace del aviso o la conversación y una descripción
            de lo sucedido. RentoCampo podrá revisar y actuar sobre el uso de
            la plataforma, pero no arbitra ni garantiza la solución de
            controversias contractuales entre particulares. Si hay un delito o
            riesgo inmediato, acudí a la autoridad competente.
          </p>
        </section>

        <section>
          <h2>8. Cambios y ley aplicable</h2>
          <p>
            La versión vigente de estas condiciones se publicará en esta
            página con su fecha. Los cambios sustanciales se comunicarán por
            medios razonables antes de aplicarse y no modificarán
            retroactivamente acuerdos ya celebrados entre usuarios. La
            relación con RentoCampo se rige por la normativa que resulte
            aplicable, sin desplazar normas obligatorias del lugar donde se
            presta un servicio o se encuentra un campo, ni limitar la
            competencia o los derechos que la ley reconozca a consumidores.
          </p>
        </section>
      </div>
    </article>
  );
}
