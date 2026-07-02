import { Request, Response } from "express";
import { prisma } from "../utils/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 8 * 60 * 60 * 1000,
  });
}

export async function registerDoctor(req: Request, res: Response) {
  try {
    const { name, lastName, email, password } = req.body;

    if (!name || !lastName || !email || !password) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { correo: email },
    });

    if (existingDoctor) {
      return res.status(400).json({ error: "Correo ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await prisma.doctor.create({
      data: {
        nombre: name,
        apellidos: lastName || null,
        correo: email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { id: newDoctor.id, role: "doctor", nombre: newDoctor.nombre, apellidos: newDoctor.apellidos },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Registro exitoso",
      doctor: {
        id: newDoctor.id,
        name: newDoctor.nombre,
        lastName: newDoctor.apellidos,
        email: newDoctor.correo,
      },
    });
  } catch (error) {
    console.error("Error en registerDoctor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function loginDoctor(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { correo: email },
    }); 

    if (!doctor) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isValidPassword = await bcrypt.compare(password, doctor.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: doctor.id, role: "doctor", nombre: doctor.nombre, apellidos: doctor.apellidos },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );

    setAuthCookie(res, token);

    res.json({
      success: true,
      message: "Inicio de sesión correcto",
      doctor: {
        id: doctor.id,
        name: doctor.nombre,
        lastName: doctor.apellidos,
        email: doctor.correo,
      },
    });
  } catch (error) {
    console.error("Error en loginDoctor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function registerPaciente(req: Request, res: Response) {
  try {
    const { name, lastName, email, password, telefono } = req.body;

    if (!name || !lastName || !email || !password) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const existingPaciente = await prisma.paciente.findUnique({
      where: { correo: email },
    });

    if (existingPaciente) {
      return res.status(400).json({ error: "Correo ya registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newPaciente = await prisma.paciente.create({
      data: {
        nombre: name,
        apellidos: lastName,
        correo: email,
        password: hashedPassword,
        telefono: telefono || null,
      },
    });

    const token = jwt.sign(
      { id: newPaciente.id, role: "paciente", nombre: newPaciente.nombre, apellidos: newPaciente.apellidos },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: "Registro de paciente exitoso",
      paciente: {
        id: newPaciente.id,
        name: newPaciente.nombre,
        lastName: newPaciente.apellidos,
        email: newPaciente.correo,
      },
    });
  } catch (error) {
    console.error("Error en registerPaciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function loginPaciente(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Correo y contraseña requeridos" });
    }

    const paciente = await prisma.paciente.findUnique({
      where: { correo: email },
    });

    if (!paciente) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const isValidPassword = await bcrypt.compare(password, paciente.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const token = jwt.sign(
      { id: paciente.id, role: "paciente", nombre: paciente.nombre, apellidos: paciente.apellidos },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );

    setAuthCookie(res, token);

    res.json({
      success: true,
      message: "Inicio de sesión correcto",
      paciente: {
        id: paciente.id,
        name: paciente.nombre,
        lastName: paciente.apellidos,
        email: paciente.correo,
      },
    });
  } catch (error) {
    console.error("Error en loginPaciente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
