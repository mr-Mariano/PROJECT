import { Transaction } from "../models/Transaction.js";
import { Category } from "../models/Category.js";
import {Account} from "../models/Account.js";

function map_transaction(tx){

    return {
        id: tx.id,
        title: tx.title,
        amount: tx.amount,
        date: tx.date,
        categoryId: tx.category?._id?.toString() || tx.category?.toString(),
        categoryName: tx.category?.name,
        accountId: tx.account?._id?.toString() || tx.account?.toString(),
        accountName: tx.account?.name
    }
}

export const get_transactions = async (req, res) => {
    let { limit = 5, page = 1, category, account, search, from, to } = req.query

    limit = Number(limit)
    page = Number(page)

    let query = {}

    if (category) {
        query.category = category
    }

    if (account) {
        query.account = account
    }

    if (search) {
        const safe_search = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        query.title = {
            $regex: safe_search,
            $options: 'i'
        }
    }

    if (from && to) {
        query.date = {
            $gte: new Date(req.query.from),
            $lte: new Date(req.query.to)
        }
    }


    try {
        query.user = req.user._id

        const results = await Transaction.find(query)
            .populate('category', 'name icon')
            .populate('account', 'name')
            .limit(limit)
            .skip((page - 1) * limit)
            .sort({ date : -1})

        const total = await Transaction.countDocuments(query)
        return res.status(200).json({
            message: "Transactions Delivered",
            transactions: results.map(map_transaction),
            total,
            page,
            limit
        })
    }catch(err){
        return res.status(500).json({
            errorMessage : "Internal Server Error"
        })
    }
}

export const create_transaction = async(req,res) => {
    const { title, amount, categoryId, accountId } = req.body
    if (!title || amount === undefined) {
        return res.status(400).json({ message: "Title and amount are required" })
    }

    try{
        const category = await Category.findOne({
            _id: categoryId,
            user: req.user._id
        })

        if (!category) {
            return res.status(400).json({ message: "Invalid category" })
        }

        const account = await Account.findOne({
            _id: accountId,
            user: req.user._id
        })

        if (!account) {
            return res.status(400).json({ message: "Invalid account" })
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            title,
            amount,
            category: categoryId,
            account: accountId
        })

        return res.status(201).json({
            transaction: map_transaction(transaction)
        })

    }catch(err){
        return res.status(500).json({ message: "Internal server error" })
    }
}


export const update_transaction = async (req, res) => {
    const { id } = req.params
    const { title, amount, categoryId, accountId } = req.body

    if (!title || amount === undefined) {
        return res.status(400).json({ message: "Title and amount are required" })
    }

    try{
        const category = await Category.findOne({
            _id: categoryId,
            user: req.user._id
        })

        if (!category) {
            return res.status(400).json({ message: "Invalid category" })
        }

        const account = await Account.findOne({
            _id: accountId,
            user: req.user._id
        })

        if (!account) {
            return res.status(400).json({ message: "Invalid account" })
        }

        const transaction = await Transaction.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                title,
                amount,
                category: categoryId,
                account: accountId
            },
            { new: true }
        )
            .populate('category', 'name icon')
            .populate('account', 'name')

        if(!transaction){ return res.status(404).json({ message : "Transaction not found"})}
        return res.status(200).json({
            transaction: map_transaction(transaction)
        })
    }catch(err){
        console.log(err)
        return res.status(500).json({ message : "Internal Server Error" })
    }

}


export const delete_transaction = async(req, res) => {
    const { id } = req.params

    try{
        const transaction = await Transaction.findOneAndDelete({
            _id: id,
            user: req.user._id
        })

        if(!transaction){ return res.status(404).json({ message : "Transaction not found"})}
        return res.status(200).json({ message : "Transaction Deleted" })
    }catch(err){
        return res.status(500).json({ message : "Internal Server Error" })
    }
}