let currentEditingDashboardTransaction = null
let pendingDeleteDashboardTransaction = null
let currentPage = 1
const LIMIT = 5

let allTransactions = []
let dashboardTransactions = []

document.addEventListener('DOMContentLoaded', async () => {
    initialize_sidebar_navigation();
    bind_dashboard_transaction_actions();
    await init();
});


// ================= INIT =================
async function init(){

    const { transactions, total, page, limit } = await get_transactions({
        limit: LIMIT,
        page: currentPage
    })

    dashboardTransactions = transactions
    render_transactions(transactions)
    render_pagination({ total, page, limit })


    if (allTransactions.length === 0){
        const res = await get_transactions({ limit: 1000 })
        allTransactions = res.transactions
    }


    render_balance(allTransactions)
    render_income(allTransactions)
    render_expenses(allTransactions)
    render_chart(allTransactions)
}


// ================= RENDER =================
function render_transactions(transactions){
    const container = document.getElementById('recent-transactions-list')
    if (!container) return
    container.innerHTML = ''
    render_transaction_list(transactions, container, { useDataActions: true })
}

function render_balance(transactions){
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    const total_balance = document.getElementById('dashboardTotalBalance')
    if (!total_balance) return

    total_balance.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

    const trendIcon = document.querySelector('.balance-trend svg')
    const trendText = document.querySelector('.balance-trend span')

    if (trendIcon) {
        trendIcon.style.transform = total >= 0 ? 'rotate(0deg)' : 'rotate(180deg)'
        trendIcon.style.color = total >= 0 ? '' : 'red'
    }

    if (trendText) {
        trendText.textContent = total >= 0 ? 'Positive balance' : 'Negative balance'
        trendText.style.color = total >= 0 ? '' : 'red'
    }
}

function render_income(transactions){
    const total = transactions.reduce((acc, curr) => curr.amount > 0 ? acc + curr.amount : acc, 0);

    const income_element = document.getElementById('dashboardIncomeTotal')
    if (!income_element) return

    income_element.textContent = `$${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function render_expenses(transactions){
    const total = transactions.reduce((acc, curr) => curr.amount < 0 ? acc + curr.amount : acc, 0);

    const expenses_element = document.getElementById('dashboardExpensesTotal')
    if (!expenses_element) return

    expenses_element.textContent = `$${Math.abs(total).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
}

function render_chart(transactions){
    const canvas = document.getElementById('spendingTrendChart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // Destroy previous chart if exists
    if (window.dashboardChart) {
        window.dashboardChart.destroy()
    }

    // ===== GROUP BY MONTH =====
    const monthlyMap = {}

    transactions.forEach(tx => {
        if (!tx.date) return

        const date = new Date(tx.date)
        const key = `${date.getFullYear()}-${date.getMonth()}`

        if (!monthlyMap[key]) {
            monthlyMap[key] = 0
        }

        monthlyMap[key] += tx.amount
    })

    // Convert to arrays
    const sortedKeys = Object.keys(monthlyMap).sort((a, b) => new Date(a) - new Date(b))

    const labels = sortedKeys.map(key => {
        const [year, month] = key.split('-')
        return new Date(year, month).toLocaleString('en-US', { month: 'short' })
    })

    const data = sortedKeys.map(key => monthlyMap[key])

    // ===== CREATE CHART =====
    window.dashboardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{

                label: 'Monthly Balance',
                data: data,
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
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    ticks: {
                        callback: (value) => `$${value}`
                    }
                }
            }
        }
    })
}

function render_pagination({total, page, limit}){
    const container = document.getElementById('pagination')
    if (!container) return

    container.innerHTML = ''

    // PREV
    if (currentPage > 1){
        const prev = document.createElement('button')
        prev.textContent = 'Prev'
        prev.onclick = () => {
            currentPage--
            init()
        }
        container.appendChild(prev)
    }

    // PAGE LABEL
    const page_span = document.createElement('span')
    page_span.textContent = ` Page ${currentPage} `
    container.appendChild(page_span)

    // NEXT (solo si probablemente hay más)
    if (page * limit < total){
        const next = document.createElement('button')
        next.textContent = 'Next'
        next.onclick = () => {
            currentPage++
            init()
        }

        container.appendChild(next)
    }
}

// ================= EVENTS =================
function bind_dashboard_transaction_actions() {
    const list = document.getElementById('recent-transactions-list')

    if (list) {
        list.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-transaction-action]')
            if (!btn) return

            const item = btn.closest('.transaction-item')

            if (btn.dataset.transactionAction === 'edit') {
                open_edit_modal(item)
            }

            if (btn.dataset.transactionAction === 'delete') {
                open_delete_modal(item)
            }
        })
    }

    const form = document.getElementById('editTransactionForm')
    if(form){
        form.addEventListener('submit', save_transaction)
    }

    const delete_btn = document.getElementById('confirmDeleteTransactionBtn')
    if (delete_btn) delete_btn.addEventListener('click', delete_transaction)
}


// ================= EDIT =================
function open_edit_modal(item){
    const id = item.dataset.id

    const transaction = dashboardTransactions.find(tx => tx.id === id)
    if (!transaction) return

    currentEditingDashboardTransaction = transaction
    document.getElementById('editTitle').value = transaction.title

    const category_select = document.getElementById('editCategory')
    load_categories_into_select(category_select, transaction.category)

    document.getElementById('editAmount').value = transaction.amount

    const account_select = document.getElementById('editTransactionAccount')
    load_accounts_into_select(account_select, transaction.accountId)

    open_modal('editModalTransaction')
}

async function save_transaction(e){
    e.preventDefault()

    if (!currentEditingDashboardTransaction) return

    const id = currentEditingDashboardTransaction.id

    const form_data = new FormData(e.target)

    const data = {
        title: form_data.get('editTitle'),
        category: form_data.get('editCategory'),
        amount: Number(form_data.get('editAmount')),
        accountId: form_data.get('editTransactionAccount')
    }

    await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    close_modal('editModalTransaction')
    await init()
}


// ================= DELETE =================
function open_delete_modal(item){
    pendingDeleteDashboardTransaction = item
    open_modal('deleteModalTransaction')
}

async function delete_transaction(){
    if (!pendingDeleteDashboardTransaction) return

    const id = pendingDeleteDashboardTransaction.dataset.id

    await fetch(`/api/transactions/${id}`, { method: 'DELETE' })

    close_modal('deleteModalTransaction')
    await init()
}


// ================= ACCOUNTS =================
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

async function load_categories_into_select(select, selectedCategory){
    const categories = await get_categories()

    select.innerHTML = ''

    categories.forEach(cat => {
        const option = document.createElement('option')
        option.value = cat.name
        option.textContent = cat.name
        select.appendChild(option)
    })

    select.value = selectedCategory
}
