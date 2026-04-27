import express from "express";
import send_views from "../utils/send_views.js";

export const views_router = express.Router()

// Ruta Principal -> Login
views_router.get('/', (req, res) => {
    send_views(res, 'index')
})

// Register
views_router.get('/register.html', (req, res) => {
    send_views(res, 'register')
})

// Dashboard
views_router.get('/dashboard.html', (req, res) => {
    send_views(res, 'dashboard')
})

// Transactions
views_router.get('/transactions.html', (req, res) => {
    send_views(res, 'transactions')
})

// Budgets
views_router.get('/budgets.html', (req, res) => {
    send_views(res, 'budgets')
})

// Documents
views_router.get('/documents.html', (req, res) => {
    send_views(res, 'documents')
})

// Profile
views_router.get('/profile.html', (req, res) => {
    send_views(res, 'profile')
})

