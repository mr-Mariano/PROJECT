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

// Ruta Principal -> Login
api_router.get('/', (req, res) => {
    send_views(res, 'index')
})

// Register
api_router.get('/register.html', (req, res) => {
    send_views(res, 'register')
})

// Dashboard
api_router.get('/dashboard.html', (req, res) => {
    send_views(res, 'dashboard')
})

// Transactions
api_router.get('/transactions.html', (req, res) => {
    send_views(res, 'transactions')
})

// Budgets
api_router.get('/budgets.html', (req, res) => {
    send_views(res, 'budgets')
})

// Documents
api_router.get('/documents.html', (req, res) => {
    send_views(res, 'documents')
})

// Profile
api_router.get('/profile.html', (req, res) => {
    send_views(res, 'profile')
})

