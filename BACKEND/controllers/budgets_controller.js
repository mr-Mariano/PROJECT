import {Category} from "../models/Category.js";
import { Budget} from "../models/Budget.js";

export const get_budgets = async(req, res) => {
    try {
        const budgets = await Budget.find({
            user: req.user._id
        })
            .populate('category', 'name icon')
            .sort({ createdAt: -1 })

        return res.status(200).json({
            message: "Budgets fetched",
            budgets
        })

    } catch(e) {
        return res.status(500).json({
            message: e.message || 'Internal Server Error'
        })

    }
}

export const create_budget = async (req, res) => {

    const { categoryId, budgetName, limit } = req.body

    const budget = {
        user: req.user._id
    }

    if (!categoryId) {
        return res.status(400).json({
            message: "Category is required"
        })
    }

    budget.category = categoryId

    if (!budgetName || budgetName.trim() === '') {
        return res.status(400).json({
            message: "Budget name cannot be empty"
        })
    }

    budget.name = budgetName.trim()


    const limit_number = Number(limit)

    if (Number.isNaN(limit_number) || limit_number <= 0) {
        return res.status(400).json({
            message: "Budget limit must be a positive number"
        })
    }

    budget.limit = limit_number

    try {
        const category = await Category.findOne({
            _id: categoryId,
            user: req.user._id
        })

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            })
        }

        const existingBudget = await Budget.findOne({
            user: req.user._id,
            category: categoryId
        })

        if (existingBudget) {
            return res.status(409).json({
                message: "Budget already exists for this category"
            })
        }

        const budget_obj = await Budget.create(budget)
        const populated_budget = await budget_obj.populate(
            'category',
            'name icon'
        )

        return res.status(201).json({
            message: "Budget created",
            budget: populated_budget
        })

    } catch (e) {
        return res.status(500).json({
            message: e.message || 'Internal Server Error'
        })
    }
}

export const update_budget = async (req, res) => {

    const { id } = req.params
    const { budgetName, budgetLimit, budgetCategoryId } = req.body

    const update_data = {}

    if (budgetName !== undefined) {
        if (budgetName.trim() === '') {
            return res.status(400).json({
                message: "Budget name cannot be empty"
            })
        }

        update_data.name = budgetName.trim()
    }


    if (budgetLimit !== undefined) {
        const limit_number = Number(budgetLimit)

        if (Number.isNaN(limit_number) || limit_number <= 0) {
            return res.status(400).json({
                message: "Budget limit must be a positive number"
            })
        }

        update_data.limit = limit_number
    }

    try {
        if (budgetCategoryId) {
            const category = await Category.findOne({
                _id: budgetCategoryId,
                user: req.user._id
            })
            if (!category) {
                return res.status(404).json({
                    message: "Category not found"
                })
            }

            const existingBudget = await Budget.findOne({
                user: req.user._id,
                category: budgetCategoryId,
                _id: { $ne: id }
            })

            if (existingBudget) {
                return res.status(409).json({
                    message: "A budget already exists for this category"
                })
            }

            update_data.category = budgetCategoryId
        }

        const updated_budget = await Budget.findOneAndUpdate(
            {
                _id: id,
                user: req.user._id
            },
            update_data,
            { new: true }
        ).populate('category', 'name icon')

        if (!updated_budget) {
            return res.status(404).json({
                message: "Budget not found"
            })
        }

        return res.status(200).json({
            message: "Budget updated",
            budget: updated_budget
        })

    } catch(err) {
        return res.status(500).json({
            message: err.message || 'Internal Server Error'
        })
    }

}

export const delete_budget = async (req, res) => {
    const { id } = req.params

    try {

        const deleted_budget = await Budget.findOneAndDelete({
            _id: id,
            user: req.user._id
        })

        if (!deleted_budget) {
            return res.status(404).json({
                message: "Budget not found"
            })
        }

        return res.status(200).json({
            message: "Budget deleted"
        })

    } catch(err) {

        return res.status(500).json({
            message: err.message || 'Internal Server Error'
        })

    }


}