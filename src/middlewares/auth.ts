import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  id: number;
  role?: "doctor" | "paciente";
  nombre?: string;
  apellidos?: string;
  iat?: number;
  exp?: number;
}

export function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token;

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET || "claveSecreta";
    const decoded = jwt.verify(token, secret) as DecodedToken;
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.error("Error en verifyToken:", error);
    res.status(403).json({ error: "Token inválido o expirado" });
  }
}

export function verifyDoctor(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  verifyToken(req, res, () => {
    const user = (req as any).user;
    if (!user || user.role !== "doctor") {
      res.status(403).json({ error: "Acceso exclusivo para doctores" });
      return;
    }
    next();
  });
}

export function verifyPaciente(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  verifyToken(req, res, () => {
    const user = (req as any).user;
    if (!user || user.role !== "paciente") {
      res.status(403).json({ error: "Acceso exclusivo para pacientes" });
      return;
    }
    next();
  });
}
