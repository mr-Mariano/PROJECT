import express from "express";
import { update_user, delete_user, get_me } from "../controllers/users_controller.js";

const users_router = express.Router()


users_router.get('/me', get_me)
users_router.put('/', update_user)
users_router.delete('/', delete_user)

export default users_router
