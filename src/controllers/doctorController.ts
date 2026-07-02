import { Request, Response } from "express";
import { prisma } from "../utils/prisma";

// Endpoint público: pacientes pueden buscar doctores por especialidad
export async function getDoctoresPublico(req: Request, res: Response) {
  try {
    const { especialidad } = req.query;

    const where: any = {};
    if (especialidad) {
      where.especialidad = {
        contains: String(especialidad),
        mode: "insensitive",
      };
    }

    const doctors = await prisma.doctor.findMany({
      where,
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        telefono: true,
        especialidad: true,
      },
      orderBy: { nombre: "asc" },
    });

    const normalizedDoctors = doctors.map((d) => ({
      id: d.id,
      name: d.nombre,
      lastName: d.apellidos,
      phone: d.telefono,
      especialidad: d.especialidad,
    }));

    res.json({ doctors: normalizedDoctors });
  } catch (error) {
    console.error("Error en getDoctoresPublico:", error);
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
}

// Endpoint protegido: solo para doctores autenticados
export async function getDoctores(req: Request, res: Response) {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        id: true,
        nombre: true,
        apellidos: true,
        correo: true,
        telefono: true,
        especialidad: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const normalizedDoctors = doctors.map((d) => ({
      id: d.id,
      name: d.nombre,
      lastName: d.apellidos,
      email: d.correo,
      phone: d.telefono,
      especialidad: d.especialidad,
      createdAt: d.createdAt,
    }));

    res.json({ doctors: normalizedDoctors });
  } catch (error) {
    console.error("Error en getDoctores:", error);
    res.status(500).json({ error: "Error al obtener los doctores" });
  }
}

export async function eliminarDoctor(req: Request, res: Response) {
  try {
    const doctorId = Number(req.params.id);

    if (Number.isNaN(doctorId)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await prisma.doctor.delete({ where: { id: doctorId } });

    res.status(204).send();
  } catch (error) {
    console.error("Error en eliminarDoctor:", error);
    res.status(500).json({ error: "Error al eliminar el doctor" });
  }
}

export async function getPerfilDoctor(req: Request, res: Response) {
  try {
    const doctorId = (req as any).user.id;

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
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

    const normalizedDoctor = {
      id: doctor.id,
      name: doctor.nombre,
      lastName: doctor.apellidos,
      email: doctor.correo,
      phone: doctor.telefono,
      especialidad: doctor.especialidad,
      createdAt: doctor.createdAt,
    };

    res.json({ doctor: normalizedDoctor });
  } catch (error) {
    console.error("Error en getPerfilDoctor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
