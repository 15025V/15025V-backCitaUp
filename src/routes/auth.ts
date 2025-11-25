import { Router } from "express";
import { login, registerDoctor } from "../controllers/authController";
import { logout } from "../controllers/logout";
import { verify } from "crypto";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.post("/logout", logout);
router.post("/register/doctor", registerDoctor);
router.post("/login", login);
router.get("/me",verifyToken, (req, res) => {
    const user = (req as any).user;
    res.json({ user });
});
export default router;
