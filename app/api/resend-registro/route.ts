import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const RECIPIENT = "aarielmmartinez188@gmail.com";

export async function POST(request: Request) {
  const authorization = request.headers.get("authorization");
  const expectedSecret = process.env.RESEND_REGISTRATION_SECRET;

  if (!expectedSecret || authorization !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "RentoCampo <no-reply@rentocampo.com>";

  const { data, error } = await resend.emails.send(
    {
      from,
      to: [RECIPIENT],
      subject: "Te invitamos a volver a RentoCampo",
      html: `
        <!doctype html>
        <html lang="es">
          <body style="margin:0;background:#f5f2e9;font-family:Arial,sans-serif;color:#20251f">
            <div style="max-width:600px;margin:0 auto;padding:32px 20px">
              <div style="background:#ffffff;border-radius:16px;padding:32px;border:1px solid #e3dfd3">
                <p style="margin:0 0 8px;color:#697267;font-size:14px">RENTOCAMPO</p>
                <h1 style="margin:0 0 20px;font-size:28px;line-height:1.2">
                  Queremos volver a tenerte en RentoCampo
                </h1>
                <p style="font-size:16px;line-height:1.6">
                  Hola Ariel:
                </p>
                <p style="font-size:16px;line-height:1.6">
                  Actualizamos nuestra plataforma y, durante la migración, tu perfil y la publicación de tu campo anterior no pudieron conservarse.
                </p>
                <p style="font-size:16px;line-height:1.6">
                  Te pedimos que vuelvas a registrarte y cargues nuevamente tu campo. Publicar continúa siendo gratuito y solo te llevará unos minutos.
                </p>
                <p style="margin:28px 0">
                  <a href="https://rentocampo.com/register"
                    style="display:inline-block;background:#222d20;color:#ffffff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">
                    Crear mi cuenta nuevamente
                  </a>
                </p>
                <p style="font-size:16px;line-height:1.6">
                  Lamentamos la molestia y agradecemos que hayas confiado en RentoCampo desde el comienzo.
                </p>
                <p style="margin-top:28px;font-size:16px;line-height:1.6">
                  Equipo RentoCampo<br>
                  <a href="https://rentocampo.com" style="color:#43533f">rentocampo.com</a>
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    },
    {
      idempotencyKey: "registration-migration/aarielmmartinez188/v1",
    },
  );

  if (error) {
    return NextResponse.json(
      { error: "No se pudo enviar el correo", details: error },
      { status: 500 },
    );
  }

  return NextResponse.json({ sent: true, id: data?.id });
}
