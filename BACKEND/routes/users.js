import express from "express";
import { login_user, register_user } from "../controllers/users_controller.js";

const users_router = express.Router()

users_router.post('/login', login_user)
users_router.post('/register', register_user)

export default users_router
