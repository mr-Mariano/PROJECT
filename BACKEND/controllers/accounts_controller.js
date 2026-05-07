import { Account } from "../models/Account.js"
import { Transaction } from "../models/Transaction.js"
import { get_or_create_general_account } from "./transactions_controller.js"

function map_account(acc){
        return {
                id: acc.id,
                name: acc.name
        }
}

export const get_accounts = async (req, res) => {
        try {
                const accounts = await Account.find({ user: req.user._id })
                return res.status(200).json({
                        accounts: accounts.map(map_account)
                })
        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const create_account = async (req, res) => {
        const { name } = req.body

        if (!name) {
                return res.status(400).json({ message: "Name is required" })
        }

        try {
                const exists = await Account.findOne({
                        name,
                        user: req.user._id
                })

                if (exists) {
                        return res.status(400).json({ message: "Account already exists" })
                }

                const account = await Account.create({
                        user: req.user._id,
                        name
                })

                return res.status(201).json({
                        account: map_account(account)
                })

        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const update_account = async (req, res) => {
        const { id } = req.params
        const { name } = req.body

        if (!name) {
                return res.status(400).json({ message: "Name is required" })
        }

        try {
                const exists = await Account.findOne({
                        name,
                        user: req.user._id,
                        _id: { $ne: id }
                })

                if (exists) {
                        return res.status(400).json({ message: "Account already exists" })
                }

                const account = await Account.findOneAndUpdate(
                        { _id: id, user: req.user._id },
                        { name },
                        { returnDocument: 'after' }
                )

                if (!account) {
                        return res.status(404).json({ message: "Account not found" })
                }

                return res.status(200).json({ account: map_account(account) })

        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const delete_account = async (req, res) => {
        const { id } = req.params

        try {
                const account = await Account.findOne({
                        _id: id,
                        user: req.user._id
                })

                if (!account) {
                        return res.status(404).json({ message: "Account not found" })
                }

                if (account.name.trim().toLowerCase() === 'general') {
                        return res.status(400).json({
                                message: "General account cannot be deleted"
                        })
                }

                const isUsed = await Transaction.exists({
                        account: id,
                        user: req.user._id
                })

                if (isUsed) {
                        return res.status(409).json({
                                message: "ACCOUNT_HAS_TRANSACTIONS"
                        })
                }

                await account.deleteOne()

                return res.status(200).json({ message: "Account deleted" })

        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const delete_account_keep_transactions = async (req, res) => {
        const { id } = req.params

        try {
                const account = await Account.findOne({
                        _id: id,
                        user: req.user._id
                })

                if (!account) {
                        return res.status(404).json({ message: "Account not found" })
                }

                if (account.name.trim().toLowerCase() === 'general') {
                        return res.status(400).json({
                                message: "General account cannot be deleted"
                        })
                }

                const general_account = await get_or_create_general_account(req.user._id)

                await Transaction.updateMany(
                        { user: req.user._id, account: account._id },
                        { '$set': { account: general_account._id } }
                )

                await account.deleteOne()

                return res.status(200).json({
                        message: "Account deleted and transactions moved to General"
                })
        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}

export const delete_account_with_transactions = async (req, res) => {
        const { id } = req.params

        try {
                const account = await Account.findOne({
                        _id: id,
                        user: req.user._id
                })

                if (!account) {
                        return res.status(404).json({ message: "Account not found" })
                }

                if (account.name.trim().toLowerCase() === 'general') {
                        return res.status(400).json({
                                message: "General account cannot be deleted"
                        })
                }

                await Transaction.deleteMany({
                        user: req.user._id,
                        account: account._id
                })

                await account.deleteOne()

                return res.status(200).json({
                        message: "The transactions and account were deleted"
                })
        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}