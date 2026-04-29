import express from "express";
import send_views from "../utils/send_views.js";
import transactions from "./transactions.js";
import users from "./users.js";
import accounts from "./accounts.js";
import categories from "./categories.js";

export const api_router = express.Router()

// Routes
api_router.use('/users', users)
api_router.use('/transactions', transactions)
api_router.use('/accounts', accounts)
api_router.use('/categories', categories)


