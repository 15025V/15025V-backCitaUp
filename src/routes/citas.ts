import { Router } from "express";
import {
  crearCitaPaciente,
  getCitasDoctor,
  crearCitaDoctor,
  confirmarCita,

  eliminarCita,
} from  '../controllers/citaController'
import { verifyToken } from "../middlewares/auth";

const router = Router();

// Paciente
router.post("/citas", crearCitaPaciente);

// Doctor   
router.get("/doctor/citas", verifyToken, getCitasDoctor);
router.post("/doctor/citas", verifyToken, crearCitaDoctor);
router.put("/doctor/citas/:id", verifyToken, confirmarCita);
router.delete("/doctor/citas/:id", verifyToken, eliminarCita);

export default router;  
