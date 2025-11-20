import express from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import citasRoutes from './routes/citas'
import doctorRoutes from "./routes/doctorRoutes";
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3100

app.use(cors({
    origin: (process.env.ALLOWED_ORIGINS || "").split(","),
    credentials: true,
}))
app.use(express.json())

app.use('/auth', authRoutes)
app.use(doctorRoutes);
app.use('/', citasRoutes)

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto :${PORT}`)
})