// ================= GLOBAL STATE =================
let currentEditingDashboardTransaction = null
let pendingDeleteDashboardTransaction = null

let currentPage = 1
const LIMIT = 5

let allTransactions = []
let dashboardTransactions = []
let prevTransactions = []

// ====== UTILS ==========
function get_current_month_range(){
    const now = new Date()

    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    return {
        from: from.toISOString(),
        to: to.toISOString()
    }
}

function get_previous_month_range(){
    const now = new Date()
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    return {
        from: from.toISOString(),
        to: to.toISOString()
    }
}

function calculate_total(transactions){
    return transactions.reduce((acc, tx) => acc + tx.amount, 0)
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', async () => {
    initialize_sidebar_navigation()
    bind_dashboard_transaction_actions()
    await init()
})


// ================= MAIN INIT =================
async function init(){

    await refresh_transactions_only()

    const currentRange = get_current_month_range()
    const prevRange = get_previous_month_range()

    const [currentRes, prevRes] = await Promise.all([
        get_transactions({ limit: 1000, ...currentRange }),
        get_transactions({ limit: 1000, ...prevRange })
    ])

    const currentTx = currentRes.transactions
    const prevTx = prevRes.transactions

    const currentTotal = calculate_total(currentTx)
    const prevTotal = calculate_total(prevTx)

    const diff = currentTotal - prevTotal

    allTransactions = currentTx
    prevTransactions = prevTx

    render_balance(currentTx, diff)
    render_income(currentTx)
    render_expenses(currentTx)
    render_chart(currentTx)
}


// ================= PARTIAL REFRESH =================
async function refresh_transactions_only(){
    const loader = document.getElementById('transactionsLoader')
    const container = document.getElementById('transactions-container')

    loader.style.display = 'block'
    container.innerHTML = ''

    try {
        const { transactions, total, page, limit } = await get_transactions({
            limit: LIMIT,
            page: currentPage
        })
        dashboardTransactions = transactions
        render_transactions(transactions)
        render_pagination({ total, page, limit })
    } catch (err) {
        container.innerHTML = `<p style="color:red;">Error loading transactions</p>`
    } finally {
        loader.style.display = 'none'
    }
}


// ================= RENDER =================
function render_transactions(transactions){
    const container = document.getElementById('transactions-container')
    if (!container) return

    container.innerHTML = ''
    render_transaction_list(transactions, container, { useDataActions: true })
}



// ================= METRICS =================
function render_balance(transactions, diff = 0){
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0)

    const el = document.getElementById('dashboardTotalBalance')
    const trendEl = document.querySelector('.balance-trend')

    if (!el) return

    el.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    if (!trendEl) return

    if (diff >= 0){
        trendEl.innerHTML = `↑ +${diff.toFixed(2)} from last month`
        trendEl.style.color = '#22c55e'
    } else {
        trendEl.innerHTML = `↓ ${Math.abs(diff).toFixed(2)} from last month`
        trendEl.style.color = '#ef4444'
    }
}

function render_income(transactions){
    const total = transactions.reduce((acc, curr) => curr.amount > 0 ? acc + curr.amount : acc, 0)

    document.getElementById('dashboardIncomeTotal').textContent =
        `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function render_expenses(transactions){
    const total = transactions.reduce((acc, curr) => curr.amount < 0 ? acc + curr.amount : acc, 0)

    document.getElementById('dashboardExpensesTotal').textContent =
        `$${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}


// ================= CHART =================
function render_chart(transactions){
    const canvas = document.getElementById('spendingTrendChart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (window.dashboardChart) {
        window.dashboardChart.destroy()
    }

    const monthlyMap = {}

    transactions.forEach(tx => {
        if (!tx.date) return

        const date = new Date(tx.date)
        const key = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyMap[key]) monthlyMap[key] = 0

        monthlyMap[key] += tx.amount
    })

    const sortedKeys = Object.keys(monthlyMap).sort((a, b) => new Date(a) - new Date(b))

    const labels = sortedKeys.map(key => {
        const [year, month] = key.split('-')
        return new Date(year, month).toLocaleString('en-US', { month: 'short' })
    })

    const data = sortedKeys.map(key => monthlyMap[key])

    window.dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Monthly Balance',
                data,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderColor: 'hsl(270, 60%, 65%)',
                backgroundColor: 'rgba(167, 139, 250, 0.25)',
                pointBackgroundColor: 'hsl(270, 60%, 65%)',
                pointBorderColor: '#1e1e1e',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false } },
                y: {
                    ticks: {
                        callback: (value) => `$${value}`
                    }
                }
            }
        }
    })
}


// ================= PAGINATION =================
function render_pagination({ total, page, limit }){
    const container = document.getElementById('pagination')
    if (!container) return

    container.innerHTML = ''

    if (page > 1){
        const prev = document.createElement('button')
        prev.textContent = 'Prev'
        prev.onclick = async () => {
            currentPage--
            await refresh_transactions_only()
        }
        container.appendChild(prev)
    }

    const span = document.createElement('span')
    span.textContent = ` Page ${page} `
    container.appendChild(span)

    if (page * limit < total){
        const next = document.createElement('button')
        next.textContent = 'Next'
        next.onclick = async () => {
            currentPage++
            await refresh_transactions_only()
        }
        container.appendChild(next)
    }
}


// ================= EVENTS =================
function bind_dashboard_transaction_actions(){
    const list = document.getElementById('transactions-container')

    list.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-transaction-action]')
        if (!btn) return

        const item = btn.closest('.transaction-item')

        if (btn.dataset.transactionAction === 'edit'){
            open_edit_modal(item)
        }

        if (btn.dataset.transactionAction === 'delete'){
            open_delete_modal(item)
        }
    })

    document.getElementById('editTransactionForm')
        ?.addEventListener('submit', save_transaction)

    document.getElementById('confirmDeleteTransactionBtn')
        ?.addEventListener('click', delete_transaction)

}


// ================= EDIT =================
function open_edit_modal(item){
    const id = item.dataset.id

    const transaction = dashboardTransactions.find(tx => tx.id === id)
    if (!transaction) return

    currentEditingDashboardTransaction = transaction

    document.getElementById('editTitle').value = transaction.title
    document.getElementById('editAmount').value = transaction.amount

    load_categories_into_select(
        document.getElementById('editCategory'),
        transaction.categoryId
    )

    load_accounts_into_select(
        document.getElementById('editTransactionAccount'),
        transaction.accountId
    )

    open_modal('editModalTransaction')
}

async function save_transaction(e){
    e.preventDefault()

    const id = currentEditingDashboardTransaction.id
    const form = new FormData(e.target)

    const updatedData = {
        title: form.get('editTitle'),
        categoryId: form.get('editCategory'),
        amount: Number(form.get('editAmount')),
        accountId: form.get('editTransactionAccount')
    }

    const response = await update_transaction(id, updatedData)
    const updatedTx = response.transaction || response

    allTransactions = allTransactions.map(tx =>
        tx.id === id ? updatedTx : tx
    )

    dashboardTransactions = dashboardTransactions.map(tx =>
        tx.id === id ? updatedTx : tx
    )

    render_transactions(dashboardTransactions)
    const currentTotal = calculate_total(allTransactions)
    const prevTotal = calculate_total(prevTransactions)
    const diff = currentTotal - prevTotal

    render_balance(allTransactions, diff)
    render_income(allTransactions)
    render_expenses(allTransactions)
    render_chart(allTransactions)
    close_modal('editModalTransaction')
}



// ================= DELETE =================
function open_delete_modal(item){
    pendingDeleteDashboardTransaction = item
    open_modal('deleteModalTransaction')
}

async function delete_transaction(){
    const id = pendingDeleteDashboardTransaction.dataset.id

    await delete_transaction_api(id)
    allTransactions = allTransactions.filter(tx => tx.id !== id)

    const isLastItemOnPage = dashboardTransactions.length === 1 && currentPage > 1
    if (isLastItemOnPage) {
        currentPage--
    }

    await refresh_transactions_only()
    const currentTotal = calculate_total(allTransactions)
    const prevTotal = calculate_total(prevTransactions)
    const diff = currentTotal - prevTotal

    render_balance(allTransactions, diff)
    render_income(allTransactions)
    render_expenses(allTransactions)
    render_chart(allTransactions)
    close_modal('deleteModalTransaction')
}



// ================= SELECT HELPERS =================
async function load_accounts_into_select(select, selectedId){
    const accounts = await get_accounts()

    select.innerHTML = ''

    accounts.forEach(acc => {
        const option = document.createElement('option')
        option.value = acc.id
        option.textContent = acc.name
        select.appendChild(option)
    })

    select.value = selectedId
}

async function load_categories_into_select(select, selectedId){
    const categories = await get_categories()

    select.innerHTML = ''

    categories.forEach(cat => {
        const option = document.createElement('option')
        option.value = cat.id
        option.textContent = cat.name
        select.appendChild(option)
    })

    select.value = selectedId
}