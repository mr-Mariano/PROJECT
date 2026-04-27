import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import { api_router } from "./routes/api.js";
import { __dirname } from "./env.js";
import { views_router } from "./routes/views.js";

dotenv.config()

// Esto es standard me imagino, no tanto algo que
// deba memorizar, sino entender que es la forma de obtener la ruta exacta y correcta siempre
// del frontend en este, caso, pero sería lo mismo si quisiera los archivos que están en otra
// parte del project donde está corriendo este server js que es el /BACKEND en este caso

const PORT = process.env.PORT || 3000
const app = express()

// Serve Static Files
app.use(express.static(path.join(__dirname, '../FRONTEND')))

// Views
app.use('/', views_router)

// API
app.use('/api', api_router)


app.listen(PORT, () => { console.log(`Server Running on Port: ${PORT}`)} )
