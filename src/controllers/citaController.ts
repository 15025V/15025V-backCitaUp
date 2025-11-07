import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function crearCitaPaciente(req: Request, res: Response) {
    try {
        const { nombrePaciente, telefonoPaciente, correoPaciente, fecha, motivo } = req.body;

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

        const doctorId = 1;

        const cita = await prisma.cita.create({
            data: {
                doctorId,
                nombrePaciente,
                telefonoPaciente,
                correoPaciente,
                fecha: new Date(fecha),
                motivo,
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



    const citas = await prisma.cita.findMany({

        orderBy: { fecha: "asc" },
    });

    res.json({ citas });
}

export async function crearCitaDoctor(req: Request, res: Response) {
    const { doctorId, nombrePaciente, telefonoPaciente, correoPaciente, fecha, motivo } = req.body;

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
}

export async function actualizarCita(req: Request, res: Response) {
    const id = Number(req.params.id);

    const cita = await prisma.cita.update({
        where: { id },
        data: req.body,
    });

    res.json({ cita });
}

export async function eliminarCita(req: Request, res: Response) {
    const id = Number(req.params.id);

    await prisma.cita.delete({ where: { id } });

    res.json({ message: "Cita eliminada" });
}
