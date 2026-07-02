import { Router } from "express";
import { eliminarDoctor, getDoctores, getPerfilDoctor, getDoctoresPublico } from "../controllers/doctorController";
import { cambiarPasswordDoctor, editarPerfilDoctor } from "../controllers/editarPerfilDoctor";
import { verifyDoctor } from "../middlewares/auth";

const router = Router();

// Público: para que los pacientes busquen doctores (sin auth)
router.get("/doctores", getDoctoresPublico);

// Protegido: solo doctores autenticados
router.get("/doctor", verifyDoctor, getDoctores);
router.delete("/doctor/:id", verifyDoctor, eliminarDoctor);
router.put("/doctor/perfil", verifyDoctor, editarPerfilDoctor);
router.put("/doctor/password", verifyDoctor, cambiarPasswordDoctor);
router.get("/doctor/perfil", verifyDoctor, getPerfilDoctor);

export default router;
