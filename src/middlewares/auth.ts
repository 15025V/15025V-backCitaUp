import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token requerido" });
  }

  try {
    const secret = process.env.JWT_SECRET || "claveSecreta";
    const decoded = jwt.verify(token, secret);
    // guardamos los datos del doctor en req.user
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
}
