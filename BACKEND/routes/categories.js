import express from "express";
import { get_categories } from "../controllers/categories_controller.js";

const categories_router = express.Router()

categories_router.get('/', get_categories)

export default categories_router