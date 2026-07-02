
import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import jwt from "jsonwebtoken";
import { notificarCitaConfirmada}  from "../utils/whatsApp";


export async function crearCitaPaciente(req: Request, res: Response) {
    try {
        // const doctorId = (req as any).user?.id;
        const { doctorId, nombrePaciente, telefonoPaciente, correoPaciente, fecha, motivo } = req.body;

        if (!doctorId) {
            return res.status(400).json({ error: "Falta el ID del doctor" });
        }
        //  Validación 1: Nombre    
        if (!nombrePaciente) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        if (nombrePaciente.trim().length < 5) {
            return res.status(400).json({ error: "El nombre debe tener al menos 5 caracteres" });
        }

        if (nombrePaciente.trim().length > 50) {
            return res.status(400).json({ error: "El nombre no puede exceder 50 caracteres" });
        }
        //  Validación del teléfono (10 dígitos MX)
        if (!/^\d{10}$/.test(telefonoPaciente)) {
            return res.status(400).json({ error: "El teléfono debe tener exactamente 10 dígitos numéricos" });
        }

        //  Validación del correo (solo si viene)
        if (correoPaciente && !/^\S+@\S+\.\S+$/.test(correoPaciente)) {
            return res.status(400).json({ error: "El correo no es válido" });
        }

        //  Validación de la fecha
        const fechaValida = new Date(fecha);
        if (isNaN(fechaValida.getTime())) {
            return res.status(400).json({ error: "La fecha es inválida" });
        }
        //  Nueva validación: fecha futura
        if (fechaValida < new Date()) {
            return res.status(400).json({ error: "La fecha debe ser futura" });
        }

        const citaExistente = await prisma.cita.findFirst({
            where: {
                OR: [
                    { doctorId: Number(doctorId), fecha: fechaValida },
                    { correoPaciente, fecha: fechaValida },
                    { telefonoPaciente, fecha: fechaValida }
                ],
                estado: "CONFIRMADA"
            },
        });

        if (citaExistente) {
            return res.status(400).json({ error: "Ya existe una cita para este doctor en la fecha especificada" });
        }

        // Si hay token de paciente autenticado, vincular la cita a su cuenta
        let pacienteId: number | null = null;
        const token = req.cookies?.token;
        if (token) {
            try {
                const secret = process.env.JWT_SECRET || "claveSecreta";
                const decoded = jwt.verify(token, secret) as any;
                if (decoded?.role === "paciente") {
                    pacienteId = decoded.id;
                }
            } catch {
                // Token inválido — tratar como anónimo
            }
        }

        const cita = await prisma.cita.create({
            data: {
                doctorId: Number(doctorId),
                pacienteId,
                nombrePaciente,
                telefonoPaciente,
                correoPaciente,
                fecha: new Date(fecha),
                motivo,
                estado: "PENDIENTE",
                creadoPor: "PACIENTE",
            },
        });

        return res.json({ cita });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Error interno" });
    }
}

export async function getCitasDoctor(req: Request, res: Response) {
  try {
    const { estado } = req.query;
    const  doctorId  = (req as any).user?.id;

    if (!doctorId) {
      return res.status(400).json({ error: "Token invalido o Sin ID del doctor" });
    }

    const where: any = { doctorId };

    if (estado) {
      where.estado = String(estado).toUpperCase();
    }

    // Solo filtrar futuras si son CONFIRMADAS
    if (where.estado === "CONFIRMADA") {
      where.fecha = { gte: new Date() };
    }

    const citas = await prisma.cita.findMany({
      where,
      orderBy: { fecha: "asc" },
    });

    res.json({ citas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
}




export async function crearCitaDoctor(req: Request, res: Response) {
    const doctorId = (req as any).user.id;
    const { nombrePaciente, telefonoPaciente, correoPaciente, fecha, motivo } = req.body;
    try {
        const fechaValida = new Date(fecha);
        if (isNaN(fechaValida.getTime())) {
            return res.status(400).json({ error: "La fecha es inválida" });
        }
        if (fechaValida < new Date()) {
            return res.status(400).json({ error: "La fecha debe ser futura" });
        }
        const citaExistente = await prisma.cita.findFirst({
            where: {
                OR: [
                    { doctorId: Number(doctorId), fecha: fechaValida },
                    { correoPaciente, fecha: fechaValida },
                    { telefonoPaciente, fecha: fechaValida }
                ],
                estado: "CONFIRMADA"
            },
        });
        if (citaExistente) {
            return res.status(400).json({ error: "Ya existe una cita para este doctor en la fecha especificada" });
        }

        const cita = await prisma.cita.create({
            data: {
                doctorId: Number(doctorId),
                nombrePaciente,
                telefonoPaciente,
                correoPaciente,
                fecha: new Date(fecha),
                motivo,
                estado: "CONFIRMADA",
                creadoPor: "DOCTOR",
            },
        });
        res.json({ cita });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error interno" });
    }
}

// // export async function confirmarCita(req: Request, res: Response) {
//     try {
//         const id = Number(req.params.id);
//         const doctorId = (req as any).user.id;

//         const citaExistente = await prisma.cita.findFirst({ where: { id, doctorId } });
//         if (!citaExistente) {
//             return res.status(404).json({ error: "Cita no encontrada" });
//         }

//         const cita = await prisma.cita.update({
//             where: { id },
//             data: { estado: "CONFIRMADA" },
//         });
//         res.json({ cita });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Error al confirmar la cita" });
//     }
// // }

export async function confirmarCita(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const doctorId = (req as any).user.id;

        const citaExistente = await prisma.cita.findFirst({ where: { id, doctorId } });
        if (!citaExistente) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        const cita = await prisma.cita.update({
            where: { id },
            data: { estado: "CONFIRMADA" },
            include: { doctor: true },
        });

        notificarCitaConfirmada({
            telefonoPaciente: cita.telefonoPaciente,
            nombrePaciente: cita.nombrePaciente,
            fecha: cita.fecha,
            nombreDoctor: cita.doctor.nombre,
        });

        res.json({ cita });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al confirmar la cita" });
    }
}
export async function eliminarCita(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        const doctorId = (req as any).user.id;

        const citaExistente = await prisma.cita.findFirst({ where: { id, doctorId } });
        if (!citaExistente) {
            return res.status(404).json({ error: "Cita no encontrada" });
        }

        await prisma.cita.delete({ where: { id } });
        res.json({ message: "Cita eliminada" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al eliminar la cita" });
    }
}
function notificarCitaConfirmada(data: { telefonoPaciente: string; nombrePaciente: string; fecha: Date; nombreDoctor: string; }) {
    // Implementación asíncrona sin bloquear
    setImmediate(async () => {
        try {
            const { telefonoPaciente, nombrePaciente, fecha, nombreDoctor } = data;
            
            // Formatear la fecha
            const fechaFormato = fecha.toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
            
            const mensaje = `Hola ${nombrePaciente}, tu cita con el doctor ${nombreDoctor} ha sido confirmada para el ${fechaFormato}. ¡Gracias por confiar en nosotros!`;
            
            // Aquí se integraría con un servicio de WhatsApp (Twilio, MessageBird, etc.)
            console.log(`[WhatsApp] Enviando mensaje a ${telefonoPaciente}: ${mensaje}`);
            
            // Ejemplo con Twilio (descomentar si está disponible):
            // await twilioClient.messages.create({
            //     body: mensaje,
            //     from: process.env.TWILIO_PHONE_NUMBER,
            //     to: `+52${telefonoPaciente}`
            // });
            
        } catch (error) {
            console.error("Error al notificar cita confirmada:", error);
        }
    });
}

