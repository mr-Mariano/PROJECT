import { Category } from "../models/Category.js";
import {Transaction} from "../models/Transaction.js";
import { get_or_create_general_category } from "./transactions_controller.js"
import {Budget} from "../models/Budget.js";

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
                    { returnDocument: 'after' }
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
                        return res.status(409).json({
                                message: 'CATEGORY_HAS_TRANSACTIONS'
                        })
                }

                await Budget.deleteMany({
                        category: id,
                        user: req.user._id
                })

                const category = await Category.findOneAndDelete({
                        _id: id,
                        user: req.user._id
                })

                if (!category) {
                        return res.status(404).json({
                                message: "Category not found"
                        })
                }

                return res.status(200).json({
                        message: "Category Deleted"
                })

        } catch (err) {

                return res.status(500).json({
                        message: "Internal Server Error"
                })
        }
}

export async function delete_category_keep_transactions(req, res) {
        const { id } = req.params

        try {
                const category = await Category.findOne({
                        _id: id,
                        user: req.user._id
                })

                if(!category){
                        return res.status(404).json({ message : "Category Doesn't exists" })
                }

                if(
                    category.name
                        .trim()
                        .toLowerCase() === 'general'
                ){
                        return res.status(400).json({
                                message: "General category cannot be deleted"
                        })
                }

                const general_category = await get_or_create_general_category(req.user._id)

                await Transaction.updateMany(
                    { user : req.user._id, category : category._id },
                    { '$set' : { category :  general_category._id } })

                await Budget.deleteMany({
                        user: req.user._id,
                        category: category._id
                })

                await category.deleteOne()

                return res.status(200).json({
                        message: "Category deleted and transactions moved to General"
                })

        }catch(err){
                return res.status(500).json({ message: "Internal Server Error" })
        }

}

export async function delete_category_with_transactions(req, res){
        const { id } = req.params

        try{
                const category = await Category.findOne({
                        _id: id,
                        user: req.user._id
                })

                if(!category){
                        return res.status(404).json({ message : "Category does not exist" })
                }

                if (
                    category.name
                        .trim()
                        .toLowerCase() === 'general'
                ){
                        return res.status(400).json({
                                message: "General category cannot be deleted"
                        })
                }

                await Transaction.deleteMany(
                    { user : req.user._id, category : category._id } )

                await Budget.deleteMany({
                        user: req.user._id,
                        category: category._id
                })

                await category.deleteOne()

                return res.status(200).json({
                        message: "The transactions and category were deleted"
                })

        }catch(err){
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

