import express from "express";
import { get_budgets, create_budget, update_budget, delete_budget} from "../controllers/budgets_controller.js";

const budgets_router = express.Router()

budgets_router.get('/', get_budgets)
budgets_router.post('/', create_budget)
budgets_router.put('/:id', update_budget)
budgets_router.delete('/:id', delete_budget)

export default budgets_router