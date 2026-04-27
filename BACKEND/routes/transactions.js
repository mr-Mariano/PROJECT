import express from "express";
import { get_transactions} from "../controllers/transactions_controller.js";

const transactions_router = express.Router()

transactions_router.get('/', get_transactions)

export default transactions_router