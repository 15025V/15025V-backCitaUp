import { Router } from "express";
import { body, validationResult } from "express-validator";
import { loginDoctor, registerDoctor, registerPaciente, loginPaciente } from "../controllers/authController";
import { logout } from "../controllers/logout";
import { me } from "../controllers/meController";
import { verifyToken } from "../middlewares/auth";

const router = Router();

const validate = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const registerValidation = [
  body("name").notEmpty().withMessage("name es requerido"),
  body("lastName").notEmpty().withMessage("lastName es requerido"),
  body("email").isEmail().withMessage("email debe ser válido"),
  body("password").isLength({ min: 6 }).withMessage("password debe tener mínimo 6 caracteres"),
];

const loginValidation = [
  body("email").isEmail().withMessage("email debe ser válido"),
  body("password").notEmpty().withMessage("password es requerido"),
];

router.post("/logout", logout);
router.post("/register/doctor", registerValidation, validate, registerDoctor);
router.post("/register/paciente", registerValidation, validate, registerPaciente);

router.post("/login/doctor", loginValidation, validate, loginDoctor);
router.post("/login/paciente", loginValidation, validate, loginPaciente);
// Alias de compatibilidad con el frontend existente
router.post("/login", loginValidation, validate, loginDoctor);

router.get("/me", verifyToken, me);

export default router;
