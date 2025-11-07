import  express  from "express"
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import citasRoutes from './routes/citas'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3100

app.use (cors())
app.use(express.json())

app.use('/auth',authRoutes)
app.use('/',citasRoutes)

app.listen(PORT,()=>{
    console.log(`Servidor escuchando en http://192.168.0.8:${PORT}`)
})