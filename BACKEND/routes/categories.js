import express from "express";
import { get_categories, create_category, update_category, delete_category } from "../controllers/categories_controller.js";

const categories_router = express.Router()

categories_router.get('/', get_categories)
categories_router.post('/', create_category)
categories_router.put('/:id', update_category)
categories_router.delete('/:id', delete_category)

export default categories_router