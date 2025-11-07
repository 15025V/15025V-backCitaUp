import { Router } from "express";
import {
  crearCitaPaciente,
  getCitasDoctor,
  crearCitaDoctor,
  actualizarCita,
  eliminarCita,
} from  '../controllers/citaController'

const router = Router();

// Paciente
router.post("/citas", crearCitaPaciente);

// Doctor (sin auth por ahora)
router.get("/doctor/citas", getCitasDoctor);
router.post("/doctor/citas", crearCitaDoctor);
router.put("/doctor/citas/:id", actualizarCita);
router.delete("/doctor/citas/:id", eliminarCita);

export default router;
