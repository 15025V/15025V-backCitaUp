import { Router } from "express";
import { getCitasPaciente, cancelarCitaPaciente } from "../controllers/pacienteController";
import { verifyPaciente } from "../middlewares/auth";

const router = Router();

router.get("/paciente/citas", verifyPaciente, getCitasPaciente);
router.delete("/paciente/citas/:id", verifyPaciente, cancelarCitaPaciente);

export default router;
