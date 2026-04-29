import express from 'express'
import dotenv from 'dotenv'
import path from 'path'
import cors from "cors"
import { api_router } from "./routes/api.js";
import { __dirname } from "./env.js";
import { views_router } from "./routes/views.js";
import { connect } from "./db.js";
import {auth_middleware} from "./middleware/auth.js";
import { login_user , create_user } from "./controllers/users_controller.js";

dotenv.config()

const PORT = process.env.PORT || 3000
const app = express()
app.use(cors())
app.use(express.json())

// Serve Static Files
app.use(express.static(path.join(__dirname, '../FRONTEND')))

// PUBLIC ROUTES
app.post('/login', login_user)
app.post('/register', create_user)

// VIEWS (HTML)
app.use('/', views_router)


app.use('/api', auth_middleware)
app.use('/api', api_router)


connect().then( () => {
        app.listen(PORT, () => { console.log(`Server Running on Port: ${PORT}`)} )
    }
)
