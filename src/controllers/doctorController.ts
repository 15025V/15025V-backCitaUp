import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Obtener todos los doctores registrados
export async function getDoctores(req: Request, res: Response) {
  try {

    
    const doctores = await prisma.doctor.findMany({
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
        telefono: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ doctores });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
}
export async function eliminarDoctor(req: Request, res: Response) {
    const id = Number(req.params.id);

    await prisma.doctor.delete({ where: { id } });

    res.json({ message: "Doctor eliminado" });
}
export async function getPerfilDoctor(req: Request, res: Response) {
  try {
    const doctorId = (req as any).user.id; //  viene del token

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
        telefono: true,
        createdAt: true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ error: "Doctor no encontrado" });
    }

    res.json({ doctor });
  } catch (error) {
    console.error("Error en getPerfilDoctor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
