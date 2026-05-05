import express from "express";
import { get_accounts, create_account, update_account, delete_account } from "../controllers/accounts_controller.js";

const accounts_router = express.Router()

accounts_router.get('/', get_accounts)
accounts_router.post('/', create_account)
accounts_router.put('/:id', update_account)
accounts_router.delete('/:id', delete_account)

export default accounts_router