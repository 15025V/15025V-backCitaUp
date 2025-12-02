import { Request, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";
export async function logout(req: Request, res: Response) {
    try {
        //Borar la cookie del token
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
        });

        res.json({ message: "Cierre de sesión exitoso" });

    } catch (error) {
        console.error("Error en logout:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
}
