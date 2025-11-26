import { Router } from "express";
import { login, registerDoctor } from "../controllers/authController";
import { logout } from "../controllers/logout";
import jwt from "jsonwebtoken";


const router = Router();

router.post("/logout", logout);
router.post("/register/doctor", registerDoctor);
router.post("/login", login);
router.get("/me", (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "claveSecreta");
        return res.json({ user: decoded });

    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
    // res.json({ user: (req as any).user });
}

);
export default router;
