import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const me = (req: Request, res: Response) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "No autenticado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "claveSecreta");
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(403).json({ error: "Token inválido o expirado" });
  }
};
