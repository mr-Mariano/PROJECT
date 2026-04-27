import { TRANSACTIONS} from "../data/transactions.js";

export const get_transactions = (req, res) => {

    let { limit = 5, page = 1, category, account, search } = req.query

    limit = Number(limit)
    page = Number(page)

    let filtered = [...TRANSACTIONS]

    if (category) {
        filtered = filtered.filter(tx => tx.category === category)
    }

    if (account) {
        filtered = filtered.filter(tx => tx.accountId === account)
    }

    if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(tx =>
            tx.title.toLowerCase().includes(q)
        )
    }

    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    const start = (page - 1) * limit
    const end = start + limit
    const paginated = filtered.slice(start, end)

    return res.status(200).json({
        message: "Transactions Delivered",
        transactions: paginated,
        total: filtered.length,
        page,
        limit
    })

}