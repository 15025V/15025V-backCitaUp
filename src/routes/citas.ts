import { Router } from "express";
import {
  crearCitaPaciente,
  getCitasDoctor,
  crearCitaDoctor,
  confirmarCita,

  eliminarCita,
} from  '../controllers/citaController'

const router = Router();

// Paciente
router.post("/citas", crearCitaPaciente);

// Doctor   
router.get("/doctor/citas", getCitasDoctor);
router.post("/doctor/citas", crearCitaDoctor);
router.put("/doctor/citas/:id", confirmarCita);
router.delete("/doctor/citas/:id", eliminarCita);

export default router;  
