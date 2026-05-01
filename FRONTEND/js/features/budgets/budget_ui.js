let budgets = []
let categories = []
let transactions = []

let currentEditingBudget = null
let currentDeletingBudget = null


document.addEventListener('DOMContentLoaded', async () => {

    initialize_sidebar_navigation()

    bind_budget_modal_buttons()
    bind_budget_forms()
    bind_budget_actions()
    bind_delete_budget_button()

    await init()
})


// ========= INIT  ==========
async function init(){

    await Promise.all([
        refresh_budgets(),
        refresh_categories(),
        refresh_transactions()
    ])

    render_budgets()
}


// ========== REFRESH =================
async function refresh_budgets(){
    budgets = await get_budgets()
}

async function refresh_categories(){
    categories = await get_categories()
}

async function refresh_transactions(){
    const now = new Date()
    const from = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    )

    const to = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
    )

    to.setMilliseconds(-1)
    const response = await get_transactions({
        limit: 1000,
        from: from.toISOString(),
        to: to.toISOString()
    })

    transactions = response.transactions
    console.log(transactions)
}

function bind_budget_modal_buttons(){
    document.getElementById('createBudgetBtn')
        ?.addEventListener('click', async () => {
            populate_categories_select(
                document.getElementById('budgetCategory')
            )
            open_modal('createBudgetModal')
        })
}

function populate_categories_select(select, selectedId = ''){
    if (!select) return
    select.innerHTML = `<option value="">Select category</option>`

    categories.forEach(category => {
        const option = document.createElement('option')
        option.value = category.id
        option.textContent =`
            ${category.icon} ${category.name}
        `

        if (String(category.id) === String(selectedId)){
            option.selected = true
        }

        select.appendChild(option)
    })
}

async function create_budget_submit(e){
    e.preventDefault()
    const form = e.target
    const formData = new FormData(form)

    try{
        await create_budget({
            budgetName: formData.get('budgetName'),
            limit: formData.get('budgetLimit'),
            categoryId: formData.get('budgetCategory')
        })

        close_modal('createBudgetModal')
        form.reset()
        await refresh_budgets()
        render_budgets()
    }catch(err){
        alert(
            err.message || 'Error creating budget'
        )
    }
}

function bind_budget_forms(){
    document.getElementById('createBudgetForm')?.addEventListener('submit', create_budget_submit)
    document.getElementById('editBudgetForm')?.addEventListener('submit', update_budget_submit)
}

function bind_delete_budget_button(){
    document.getElementById('confirmDeleteBudgetBtn')?.addEventListener('click', delete_budget_submit)
}

async function delete_budget_submit(){
    if (!currentDeletingBudget) return

    try{
        await delete_budget(currentDeletingBudget.id)
        close_modal('deleteBudgetModal')
        currentDeletingBudget = null
        await refresh_budgets()
        render_budgets()
    }catch(err){
        alert(err.message || 'Error deleting budget')
    }
}

function bind_budget_actions(){
    const container = document.getElementById('budgetsContainer')

    if (!container) return

    container.addEventListener('click', async (e) => {
        const actionBtn = e.target.closest('[data-budget-action]')

        if (!actionBtn) return

        const budgetId = actionBtn.dataset.budgetId

        const action = actionBtn.dataset.budgetAction

        const budget = budgets.find(b => String(b.id || b._id) === String(budgetId))
        if (!budget) return

        if (action === 'edit'){
            open_edit_budget_modal(budget)
        }

        if (action === 'delete'){
            open_delete_budget_modal(budget)
        }
    })
}

function open_edit_budget_modal(budget){

    currentEditingBudget = budget

    document.getElementById('editBudgetName').value = budget.name

    document.getElementById('editBudgetLimit').value = budget.limit

    populate_categories_select(document.getElementById('editBudgetCategory'), budget.category._id)

    open_modal('editBudgetModal')
}

function open_delete_budget_modal(budget){
    currentDeletingBudget = budget
    document.getElementById('deleteBudgetName').textContent = budget.name
    open_modal('deleteBudgetModal')
}

async function update_budget_submit(e){

    e.preventDefault()
    if (!currentEditingBudget) return

    const formData = new FormData(e.target)

    try{
        await update_budget(
            currentEditingBudget.id,
            {
                budgetName: formData.get('editBudgetName'),
                budgetLimit: formData.get('editBudgetLimit'),
                budgetCategoryId: formData.get('editBudgetCategory')
            }
        )

        close_modal('editBudgetModal')
        currentEditingBudget = null
        await refresh_budgets()
        render_budgets()
    }catch(err){
        alert(err.message || 'Error updating budget')
    }
}

// ===== RENDER =============
function render_budgets(){
    const container = document.getElementById('budgetsContainer')
    if (!container) return
    container.innerHTML = ''

    if (budgets.length === 0){
        container.innerHTML = `
            <div class="empty-budgets-state">
                <h3> No budgets yet </h3>
                <p>Create your first budget to start tracking spending.</p>
            </div>
        `
        return
    }

    const fragment = document.createDocumentFragment()
    budgets.forEach(budget => {
        fragment.appendChild(
            create_budget_card(budget)
        )
    })

    container.appendChild(fragment)
}

function create_budget_card(budget) {

    const {
        id,
        _id,
        name,
        limit,
        category
    } = budget

    const budgetId = id || _id

    const categoryId = category.id || category._id
    const spent = calculate_budget_spent(categoryId)

    const numericLimit = Number(limit)
    const remaining = Math.max(numericLimit- spent, 0)

    const rawPercentage = (spent / numericLimit) * 100
    const percentage = Math.min(rawPercentage, 100)

    const card = document.createElement('div')
    card.classList.add('budget-card')

    card.innerHTML = `
    <div class="budget-header">
        <div>
            <h3 class="budget-name">
                ${name}
            </h3>

            <span class="transaction-category">
                ${category.icon} ${category.name}
            </span>
        </div>

        <div class="budget-actions">
            <button 
                class="mini-btn edit-mini"
                data-budget-action="edit"
                data-budget-id="${budgetId}"
            >
                Edit
            </button>

            <button
                class="mini-btn delete-mini"
                data-budget-action="delete"
                data-budget-id="${budgetId}"
            >
                Delete
            </button>
        </div>

        <div class="budget-limit-section">
            <p class="budget-limit">
              $${format_currency(limit)}
            </p>

            <p class="budget-limit-label">
                limit
            </p>
        </div>
    </div>

    <div class="budget-progress-section">

        <div class="progress-bar">
            <div
                class="progress-fill ${get_progress_class(percentage)}"
                style="width: ${percentage}%"
            ></div>
        </div>

        <div class="budget-stats">
            <div>
                <p class="budget-stat">
                    $${format_currency(spent)}
                    <span class="text-muted">used</span>
                </p>
            </div>

            <div class="budget-stat-right">
                <p class="text-muted">
                   $${format_currency(remaining)} left
                </p>
            </div>
        </div>

        <div class="budget-footer">
            <span class="text-muted">Progress</span>

            <span class="progress-percentage ${get_progress_class(percentage)}">
                ${rawPercentage.toFixed(0)}%
            </span>
        </div>

    </div>
    `
    return card
}

function calculate_budget_spent(categoryId){

    const normalizedBudgetCategoryId = String(categoryId).trim()

    return transactions.reduce((acc, tx) => {

        const transactionCategoryId = String(tx.categoryId || '').trim()

        const sameCategory = transactionCategoryId === normalizedBudgetCategoryId

        const isExpense = Number(tx.amount) < 0

        if (sameCategory && isExpense){
            acc += Math.abs(Number(tx.amount))
        }

        console.log({
            budgetCategoryId: normalizedBudgetCategoryId,
            transactionCategoryId,
            sameCategory,
            amount: tx.amount
        })


        return acc
    }, 0)
}

function format_currency(amount){

    return Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

function get_progress_class(percentage){

    if (percentage >= 100){
        return 'danger'
    }

    if (percentage >= 70){
        return 'warning'
    }

    return ''
}












