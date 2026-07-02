import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // ej. "whatsapp:+14155238886"

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Convierte un número mexicano de 10 dígitos (ej. "5512345678")
 * al formato E.164 que espera Twilio para WhatsApp (ej. "whatsapp:+525512345678").
 */
function formatMxWhatsApp(telefono: string): string {
  const soloDigitos = telefono.replace(/\D/g, "");
  return `whatsapp:+52${soloDigitos}`;
}

interface DatosCitaConfirmada {
  telefonoPaciente: string;
  nombrePaciente: string;
  fecha: Date;
  nombreDoctor: string;
}

export async function notificarCitaConfirmada(datos: DatosCitaConfirmada) {
  if (!client || !whatsappFrom) {
    console.warn(
      "Twilio no está configurado (faltan TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_WHATSAPP_FROM). Se omite la notificación."
    );
    return;
  }

  const fechaFormateada = datos.fecha.toLocaleString("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  });

  const mensaje =
    `¡Hola ${datos.nombrePaciente}! ✅\n\n` +
    `Tu cita con el Dr(a). ${datos.nombreDoctor} ha sido *confirmada*.\n\n` +
    `📅 ${fechaFormateada}\n\n` +
    `Si necesitas reagendar o cancelar, contáctanos con anticipación. ¡Te esperamos!`;

  try {
    await client.messages.create({
      from: whatsappFrom,
      to: formatMxWhatsApp(datos.telefonoPaciente),
      body: mensaje,
    });
  } catch (err) {
    // No queremos que un fallo de notificación tumbe la confirmación de la cita
    console.error("Error enviando notificación de WhatsApp:", err);
  }
}