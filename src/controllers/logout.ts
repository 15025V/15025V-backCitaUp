import { Request, Response } from "express";

export async function logout(req: Request, res: Response) {
    try {
        //Borar la cookie del token
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.json({ message: "Cierre de sesión exitoso" });

    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
