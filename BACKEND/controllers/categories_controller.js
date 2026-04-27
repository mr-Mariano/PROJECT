import { CATEGORIES } from "../data/categories.js";

export const get_categories = (req, res) => {
        return res.status(200).json({categories: CATEGORIES})
}