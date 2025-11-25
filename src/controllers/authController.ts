import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function registerDoctor(req: Request, res: Response) {
  try {
    const { nombre, apellidos, correo, password } = req.body;

    if (!nombre ||!apellidos || !correo || !password) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const exists = await prisma.doctor.findUnique({ 
      where: { correo },
    });

    if (exists) {
      return res.status(400).json({ error: "Correo ya registrado" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        nombre,
        apellidos,
        correo,
        password: hashed,
        
      },
    });
    const token =jwt.sign(
      { 
        id: doctor.id, 
        nombre: doctor.nombre, 
        apellidos: doctor.apellidos,  
        correo: doctor.correo, 
        telefono: doctor.telefono 
      },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, 
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    res.status(201).json({
      success: true,
      message: "Registro exitoso",
      doctor: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellidos: doctor.apellidos,
        correo: doctor.correo,
        telefono: doctor.telefono,
      },
      
    });
  } catch (error) {
    console.error("Error en registerDoctor:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { correo, password } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { correo },
    });

    if (!doctor) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    const validPassword = await bcrypt.compare(password, doctor.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    //Para generar el token JWT haber si no truena 
    const token =jwt.sign(
      { 
        id: doctor.id,
         nombre: doctor.nombre, 
         apellidos: doctor.apellidos, 
         correo: doctor.correo, 
         telefono: doctor.telefono },
      process.env.JWT_SECRET || "claveSecreta",
      { expiresIn: "8h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure:false, 
      sameSite: "lax",
      maxAge: 8 * 60 * 60 * 1000, // 8 horas
    });

    res.json({
      success: true,
      message: "Inicio de sesión correcto",
      doctor: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellidos: doctor.apellidos,
        correo: doctor.correo,
        telefono: doctor.telefono,
      },
      
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
}
