import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();



export async function crearCitaPaciente(req: Request, res: Response) {
    try {
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

        const cita = await prisma.cita.create({
            data: {
                doctorId: Number(doctorId),
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

export async function confirmarCita(req: Request, res: Response) {
    const id = Number(req.params.id);

    const cita = await prisma.cita.update({
        where: { id: Number(req.params.id) },
        data: { estado: "CONFIRMADA" },
    });

    res.json({ cita });
}

export async function eliminarCita(req: Request, res: Response) {
    const id = Number(req.params.id);

    await prisma.cita.delete({ where: { id } });

    res.json({ message: "Cita eliminada" });
}
