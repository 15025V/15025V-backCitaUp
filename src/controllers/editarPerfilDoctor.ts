import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt"; // más estable en TS/Next

const prisma = new PrismaClient();

export async function editarPerfilDoctor(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { nombre, apellidos, telefono, correo, password } = req.body;

    // 1. Validar que se envíe la contraseña actual
    if (!password) {
      return res.status(400).json({ error: "Debes ingresar tu contraseña actual" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ error: "Doctor no encontrado" });

    // 2. Validar contraseña actual
    const validarPassword = await bcrypt.compare(password, doctor.password);
    if (!validarPassword) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 3. Construir objeto dinámico SOLO con campos enviados
    const dataToUpdate: any = {};

    if (nombre) dataToUpdate.nombre = nombre;
    if (apellidos) dataToUpdate.apellidos = apellidos;

    if (telefono) {
      if (!/^\d{10}$/.test(telefono)) {
        return res.status(400).json({ error: "Teléfono debe tener 10 dígitos numéricos" });
      }
      dataToUpdate.telefono = telefono;
    }

    if (correo) {
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
        return res.status(400).json({ error: "Correo no es válido" });
      }
      dataToUpdate.correo = correo;
    }

    dataToUpdate.updatedAt = new Date();

    // 4. Si no se envió ningún campo editable
    if (Object.keys(dataToUpdate).length === 1) { // solo tiene updatedAt
      return res.status(400).json({ error: "No enviaste ningún dato para actualizar" });
    }

    // 5. Actualizar datos
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      message: "Perfil actualizado correctamente",
      doctor: updatedDoctor,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el perfil del doctor" });
  }
}


export async function cambiarPasswordDoctor(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { passwordActual, nuevaPassword, confirmarPassword } = req.body;

    if (!nuevaPassword || nuevaPassword.length < 6) {
      return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
    }
    if (nuevaPassword !== confirmarPassword) {
      return res.status(400).json({ error: "Las contraseñas no coinciden" });
    }

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) return res.status(404).json({ error: "Doctor no encontrado" });

    const validPassword = await bcrypt.compare(passwordActual, doctor.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);

    await prisma.doctor.update({
      where: { id },
      data: { password: hashedPassword, updatedAt: new Date() },
    });

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
}
