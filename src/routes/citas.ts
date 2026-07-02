import { Router } from "express";
import {
  crearCitaPaciente,
  getCitasDoctor,
  crearCitaDoctor,
  confirmarCita,
  eliminarCita,
} from "../controllers/citaController";
import { verifyDoctor } from "../middlewares/auth";

const router = Router();

// Paciente — público (cookie opcional para vincular al paciente si está autenticado)
router.post("/citas", crearCitaPaciente);

// Doctor — requiere rol doctor
router.get("/doctor/citas", verifyDoctor, getCitasDoctor);
router.post("/doctor/citas", verifyDoctor, crearCitaDoctor);
router.put("/doctor/citas/:id", verifyDoctor, confirmarCita);
router.delete("/doctor/citas/:id", verifyDoctor, eliminarCita);

export default router;
