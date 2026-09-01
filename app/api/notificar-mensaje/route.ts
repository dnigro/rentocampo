import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { mensajeId } = await request.json();
    if (!mensajeId)
      return NextResponse.json(
        { error: "mensajeId requerido" },
        { status: 400 },
      );

    const supabase = await createClient();

    // Traer el mensaje con datos del remitente, destinatario y campo
    const { data: mensaje } = await supabase
      .from("mensajes")
      .select(
        `
        contenido,
        campo:campos(id, titulo, provincia),
        remitente:profiles!mensajes_remitente_id_fkey(nombre),
        destinatario:profiles!mensajes_destinatario_id_fkey(nombre, email)
      `,
      )
      .eq("id", mensajeId)
      .single();

    if (!mensaje)
      return NextResponse.json(
        { error: "Mensaje no encontrado" },
        { status: 404 },
      );

    const campo = mensaje.campo as any;
    const remitente = mensaje.remitente as any;
    const destinatario = mensaje.destinatario as any;

    if (!destinatario?.email)
      return NextResponse.json(
        { error: "Sin email destinatario" },
        { status: 400 },
      );

    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const urlMensaje = `${origin}/mensajes/${campo?.id}`;

    await resend.emails.send({
      from: "RentoCampo <noreply@rentocampo.com>",
      to: destinatario.email,
      subject: `Nuevo mensaje de ${remitente?.nombre} — ${campo?.titulo}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #faf9f6; margin: 0; padding: 40px 20px;">
          <div style="max-width: 520px; margin: 0 auto; background: #fff; border-radius: 16px; border: 1px solid #e8e6e0; overflow: hidden;">
            
            <!-- Header -->
            <div style="background: #2d6a2d; padding: 28px 32px;">
              <p style="margin:0;font-size:32px;font-weight:800;line-height:1;letter-spacing:-1.5px;"><span style="color:#71845b;">Rento</span><span style="color:#df7953;">Campo</span></p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">
              <p style="font-size: 16px; font-weight: 600; color: #1a3a1a; margin: 0 0 6px;">
                Tenés un nuevo mensaje
              </p>
              <p style="font-size: 14px; color: #888; margin: 0 0 24px;">
                <strong style="color: #2d6a2d;">${remitente?.nombre}</strong> te escribió sobre el campo <strong style="color: #1a3a1a;">${campo?.titulo}</strong>
              </p>

              <!-- Burbuja del mensaje -->
              <div style="background: #f7f5f0; border-left: 3px solid #2d6a2d; border-radius: 8px; padding: 16px 20px; margin-bottom: 28px;">
                <p style="font-size: 14px; color: #333; margin: 0; line-height: 1.6;">
                  "${mensaje.contenido}"
                </p>
              </div>

              <!-- CTA -->
              <a href="${urlMensaje}" 
                 style="display: inline-block; background: #2d6a2d; color: #fff; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; font-weight: 700;">
                Responder mensaje
              </a>
            </div>

            <!-- Footer -->
            <div style="padding: 20px 32px; border-top: 1px solid #f0eeea;">
              <p style="font-size: 12px; color: #bbb; margin: 0;">
                Recibís este mail porque tenés una cuenta en RentoCampo.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error enviando email:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
