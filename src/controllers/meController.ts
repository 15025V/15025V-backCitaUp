import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export const me = async (req: Request, res: Response) => {
  try {
    const { id, role } = (req as any).user;

    if (role === "paciente") {
      const paciente = await prisma.paciente.findUnique({
        where: { id },
        select: {
          id: true,
          nombre: true,
          apellidos: true,
          correo: true,
          telefono: true,
          createdAt: true,
        },
      });

      if (!paciente) {
        return res.status(404).json({ error: "Paciente no encontrado" });
      }

      return res.json({
        user: {
          id: paciente.id,
          name: paciente.nombre,
          lastName: paciente.apellidos,
          email: paciente.correo,
          phone: paciente.telefono,
          createdAt: paciente.createdAt,
          role: "paciente",
        },
      });
    }

    // Doctor (role === "doctor" o tokens viejos sin role)
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
        telefono: true,
        especialidad: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor no encontrado" });
    }

    res.json({
      user: {
        id: doctor.id,
        name: doctor.nombre,
        lastName: doctor.apellidos,
        email: doctor.correo,
        phone: doctor.telefono,
        especialidad: doctor.especialidad,
        createdAt: doctor.createdAt,
        role: "doctor",
      },
    });
  } catch (error) {
    console.error("Error en me:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
