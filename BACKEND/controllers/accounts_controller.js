import { Account } from "../models/Account.js"
import { Transaction } from "../models/Transaction.js"

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

export const delete_account = async (req, res) => {
        const { id } = req.params

        try {
                const isUsed = await Transaction.exists({
                        account: id,
                        user: req.user._id
                })

                if (isUsed) {
                        return res.status(400).json({
                                message: "Cannot delete account with transactions"
                        })
                }

                const account = await Account.findOneAndDelete({
                        _id: id,
                        user: req.user._id
                })

                if (!account) {
                        return res.status(404).json({ message: "Account not found" })
                }

                return res.status(200).json({ message: "Account deleted" })

        } catch {
                return res.status(500).json({ message: "Internal Server Error" })
        }
}