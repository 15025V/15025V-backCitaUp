import { Router } from "express";
import { login, registerDoctor } from "../controllers/authController";
import { logout } from "../controllers/logout";

import { me } from "../controllers/meController";


const router = Router();

router.post("/logout", logout);
router.post("/register/doctor", registerDoctor);
router.post("/login", login);
router.get("/me", me);


export default router;
