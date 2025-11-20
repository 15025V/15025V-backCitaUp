import { Router } from "express";
import { eliminarDoctor, getDoctores, getPerfilDoctor } from "../controllers/doctorController";
import { cambiarPasswordDoctor, editarPerfilDoctor } from "../controllers/editarPerfilDoctor";
import { verifyToken } from "../middlewares/auth";

const router = Router();

router.get("/doctor",verifyToken, getDoctores);
router.delete("/doctor/:id", verifyToken, eliminarDoctor);
router.post("/doctor/:id/perfil", verifyToken, editarPerfilDoctor);
router.post("/doctor/:id/password", verifyToken, cambiarPasswordDoctor);
router.get("/doctor/perfil", verifyToken, getPerfilDoctor);
export default router;






