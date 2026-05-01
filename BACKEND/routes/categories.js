import express from "express";
import { get_categories, create_category, update_category, delete_category, delete_category_keep_transactions, delete_category_with_transactions } from "../controllers/categories_controller.js";

const categories_router = express.Router()

categories_router.get('/', get_categories)
categories_router.post('/', create_category)
categories_router.put('/:id', update_category)
categories_router.delete('/:id', delete_category)
categories_router.delete('/:id/keep-transactions', delete_category_keep_transactions)
categories_router.delete('/:id/delete-transactions', delete_category_with_transactions)
export default categories_router