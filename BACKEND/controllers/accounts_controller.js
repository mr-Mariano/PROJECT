import { ACCOUNTS } from "../data/accounts.js";

export const get_accounts = (req, res) => {
        return res.status(200).json({accounts: ACCOUNTS})
}