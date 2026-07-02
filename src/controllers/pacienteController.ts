import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function getCitasPaciente(req: Request, res: Response) {
  try {
    const pacienteId = (req as any).user?.id;

    if (!pacienteId) {
      return res.status(400).json({ error: "Token inválido o sin ID de paciente" });
    }

    const { estado } = req.query;
    const where: any = { pacienteId };

    if (estado) {
      where.estado = String(estado).toUpperCase();
    }

    const citas = await prisma.cita.findMany({
      where,
      orderBy: { fecha: "asc" },
      include: {
        doctor: {
          select: {
            id: true,
            nombre: true,
            apellidos: true,
            especialidad: true,
            telefono: true,
          },
        },
      },
    });

    const normalizedCitas = citas.map((c) => ({
      id: c.id,
      fecha: c.fecha,
      motivo: c.motivo,
      estado: c.estado,
      creadoPor: c.creadoPor,
      doctor: {
        id: c.doctor.id,
        name: c.doctor.nombre,
        lastName: c.doctor.apellidos,
        especialidad: c.doctor.especialidad,
        phone: c.doctor.telefono,
      },
    }));

    res.json({ citas: normalizedCitas });
  } catch (err) {
    console.error("Error en getCitasPaciente:", err);
    res.status(500).json({ error: "Error al obtener las citas" });
  }
}

export async function cancelarCitaPaciente(req: Request, res: Response) {
  try {
    const pacienteId = (req as any).user?.id;
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de cita inválido" });
    }

    const cita = await prisma.cita.findFirst({
      where: { id, pacienteId },
    });

    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada" });
    }

    if (cita.estado === "CANCELADA") {
      return res.status(400).json({ error: "La cita ya está cancelada" });
    }

    const citaActualizada = await prisma.cita.update({
      where: { id },
      data: { estado: "CANCELADA" },
    });

    res.json({ message: "Cita cancelada correctamente", cita: citaActualizada });
  } catch (err) {
    console.error("Error en cancelarCitaPaciente:", err);
    res.status(500).json({ error: "Error al cancelar la cita" });
  }
}
