import { Router } from "express";
import { login, registerDoctor } from "../controllers/authController";

const router = Router();

router.post("/register/doctor", registerDoctor);
router.post("/login", login);

export default router;
