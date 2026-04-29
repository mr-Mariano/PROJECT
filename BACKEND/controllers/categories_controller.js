import { Category } from "../models/Category.js";
import {Transaction} from "../models/Transaction.js";

function map_category(cat){
        return {
                id: cat.id,
                name: cat.name,
                icon: cat.icon
        }
}

export const get_categories = async (req, res) => {
        try{
                const categories = await Category.find({ user: req.user._id })
                return res.status(200).json({
                        categories: categories.map(map_category)
                })
        }catch(err){
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const create_category = async (req, res) => {
        const { name, icon } = req.body

        if (!name || !icon) {
                return res.status(400).json({ message: "Name and icon are required" })
        }

        try {
                const exists = await Category.findOne({
                        name,
                        user: req.user._id
                })

                if (exists) {
                        return res.status(400).json({ message: "Category already exists" })
                }

                const category = await Category.create({
                        user: req.user._id,
                        name,
                        icon
                })

                return res.status(201).json({
                        category: map_category(category)
                })

        } catch (err) {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const update_category = async (req, res) => {
        const { id } = req.params
        const { name, icon } = req.body

        try {
                const category = await Category.findOneAndUpdate(
                    { _id: id, user: req.user._id },
                    { name, icon },
                    { new: true }
                )

                if (!category) {
                        return res.status(404).json({ message: "Category not found" })
                }

                return res.status(200).json({
                        category: map_category(category)
                })

        } catch (err) {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const delete_category = async (req, res) => {
        const { id } = req.params


        try {
                const isUsed = await Transaction.exists({
                        category: id,
                        user: req.user._id
                })

                if (isUsed) {
                        return res.status(400).json({
                                message: "Cannot delete category with transactions"
                        })
                }

                const category = await Category.findOneAndDelete({
                        _id: id,
                        user: req.user._id
                })

                if (!category) {
                        return res.status(404).json({ message: "Category not found" })
                }

                return res.status(200).json({ message: "Category Deleted" })

        } catch (err) {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}