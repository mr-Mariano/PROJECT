import express from "express";
import { get_transactions, create_transaction , update_transaction, delete_transaction} from "../controllers/transactions_controller.js";

const transactions_router = express.Router()

transactions_router.get('/', get_transactions)
transactions_router.post('/', create_transaction)
transactions_router.put('/:id', update_transaction)
transactions_router.delete('/:id', delete_transaction)

export default transactions_router