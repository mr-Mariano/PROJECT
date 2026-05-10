import { Transaction } from "../models/Transaction.js";
import { Category } from "../models/Category.js";
import {Account} from "../models/Account.js";

function map_transaction(tx){

    const category = tx.category && typeof tx.category === 'object' ? tx.category : null

    const account = tx.account && typeof tx.account === 'object' ? tx.account : null

    return {
        id: tx._id.toString(),
        title: tx.title,
        amount: tx.amount,
        date: tx.date,
        categoryId:
            category?._id?.toString() ||
            tx.category?.toString(),
        categoryName:
            category?.name || '',
        categoryIcon:
            category?.icon || '',
        accountId:
            account?._id?.toString() ||
            tx.account?.toString(),
        accountName:
            account?.name || ''
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

    if (from || to) {
        query.date = {}

        if (from) {
            query.date.$gte = new Date(from)
        }

        if (to) {
            query.date.$lte = new Date(to)
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
    const { title, amount, categoryId, accountId, date } = req.body
    if (!title || amount === undefined) {
        return res.status(400).json({ message: "Title and amount are required" })
    }

    try{
        let category
        let account

        if (categoryId) {
            category = await Category.findOne({
                _id: categoryId,
                user: req.user._id
            })

            if (!category) {
                return res.status(400).json({
                    message: 'Invalid category'
                })
            }
        } else {
            category = await get_or_create_general_category(
                req.user._id
            )
        }

        if (accountId) {
            account = await Account.findOne({
                _id: accountId,
                user: req.user._id
            })

            if (!account) {
                return res.status(400).json({
                    message: 'Invalid account'
                })
            }
        } else {
            account = await get_or_create_general_account(
                req.user._id
            )
        }

        // Procesar la fecha del documento si se proporciona
        let transactionDate = new Date() // Fecha actual por defecto
        if (date) {
            // Si la fecha viene como string en formato YYYY-MM-DD, convertirla
            if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                // Crear fecha en zona horaria local para evitar problemas de timezone
                const [year, month, day] = date.split('-').map(Number)
                transactionDate = new Date(year, month - 1, day)

                // Validar que la fecha sea razonable (no en el futuro muy lejano ni en el pasado muy lejano)
                const now = new Date()
                const minDate = new Date(now.getFullYear() - 10, 0, 1) // 10 años atrás
                const maxDate = new Date(now.getFullYear() + 1, 11, 31) // Fin del próximo año

                if (transactionDate < minDate || transactionDate > maxDate) {
                    return res.status(400).json({
                        message: 'Invalid transaction date. Date must be within the last 10 years and not in the far future.'
                    })
                }
            } else {
                // Si ya es un objeto Date o ISO string, usarlo directamente
                transactionDate = new Date(date)
                if (isNaN(transactionDate.getTime())) {
                    return res.status(400).json({
                        message: 'Invalid date format. Use YYYY-MM-DD format.'
                    })
                }
            }
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            title,
            amount,
            category: category._id,
            account: account._id,
            date: transactionDate
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
            { returnDocument: 'after' }
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


export async function get_or_create_general_category(userId) {

    let category = await Category.findOne({
        user: userId,
        name: 'General'
    })

    if (!category) {
        category = await Category.create({
            user: userId,
            name: 'General',
            icon: '🧾'
        })
    }

    return category
}

export async function get_or_create_general_account(userId) {

    let account = await Account.findOne({
        user: userId,
        name: 'General'
    })

    if (!account) {

        account = await Account.create({
            user: userId,
            name: 'General'
        })
    }

    return account
}