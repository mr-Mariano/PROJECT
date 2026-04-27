import express from "express";
import { get_accounts } from "../controllers/accounts_controller.js";

const accounts_router = express.Router()

accounts_router.get('/', get_accounts)

export default accounts_router