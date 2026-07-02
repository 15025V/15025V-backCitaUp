import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import citasRoutes from './routes/citas'
import doctorRoutes from "./routes/doctorRoutes";
import pacienteRoutes from "./routes/pacienteRoutes";
import cookieParser from "cookie-parser";
dotenv.config()

const app = express()
app.set("trust proxy", 1)
const PORT = process.env.PORT || 3100
const isProduction = process.env.NODE_ENV === "production"

// Parse allowed origins from environment variable
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000") 
// || "http://localhost:3000"
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (like Postman, curl)
    if (!origin) return callback(null, true)
    
    // Allow if origin is in allowed list or in development
    if (allowedOrigins.includes(origin) || !isProduction) {
      callback(null, true)
    } else {
      callback(new Error("CORS not allowed"), false)
    }
  },
  credentials: true,
}))
app.use(cookieParser());
app.use(express.json())

app.use('/auth', authRoutes)
app.use(doctorRoutes);
app.use(pacienteRoutes);
app.use('/', citasRoutes)


app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto :${PORT}`)
})