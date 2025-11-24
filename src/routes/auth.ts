import { Router } from "express";
import { login, registerDoctor } from "../controllers/authController";
import { logout } from "../controllers/logout";

const router = Router();

router.post("/logout", logout);
router.post("/register/doctor", registerDoctor);
router.post("/login", login);

export default router;
