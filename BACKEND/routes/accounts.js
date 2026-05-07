import express from "express";
import {
    get_accounts,
    create_account,
    update_account,
    delete_account,
    delete_account_keep_transactions,
    delete_account_with_transactions
} from "../controllers/accounts_controller.js";

const accounts_router = express.Router()

accounts_router.get('/', get_accounts)
accounts_router.post('/', create_account)
accounts_router.put('/:id', update_account)
accounts_router.delete('/:id', delete_account)
accounts_router.delete('/:id/keep-transactions', delete_account_keep_transactions)
accounts_router.delete('/:id/delete-transactions', delete_account_with_transactions)

export default accounts_router