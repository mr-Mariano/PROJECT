// ==== GLOBAL STATE ====
let selectedAccount  = 'all'
let selectedCategory = 'all'

let accounts     = []
let categories   = []
let transactions = []

let current_editing_transaction  = null
let current_deleting_transaction = null
let current_editing_category     = null
let current_deleting_category    = null

const LIMIT = 10
let   CURRENT_PAGE = 1


//  BOOTSTRAP
document.addEventListener('DOMContentLoaded', () => {
    bind_account_filter()
    bind_category_filter_events()
    bind_transaction_actions()
    bind_create_transaction_form()
    bind_edit_transaction_form()
    bind_delete_transaction_confirm()
    bind_create_category_form()
    bind_edit_category_form()
    bind_delete_category_confirm()
    bind_create_account_form()

    init()
})

async function init() {
    await Promise.all([
        refresh_accounts(),
        refresh_categories(),
    ])
    await refresh_transactions()
}


//  REFRESH HELPERS
async function refresh_transactions() {
    const params = { limit: LIMIT, page: CURRENT_PAGE }
    if (selectedCategory !== 'all') params.category = selectedCategory
    if (selectedAccount  !== 'all') params.account  = selectedAccount

    const response = await get_transactions(params)
    transactions = response.transactions
    const { total, page, limit } = response

    const container = document.getElementById('transactions-container')
    render_transaction_list(transactions, container, { itemClass: 'transaction-item-full' })
    render_pagination({ total, page, limit })
}

async function refresh_accounts() {
    accounts = await get_accounts()

    const filter_dropdown = document.getElementById('accountFilterSelect')
    filter_dropdown.innerHTML = '<option value="all">All Accounts</option>'
    accounts.forEach(acc => {
        const opt = document.createElement('option')
        opt.value       = acc.id
        opt.textContent = acc.name
        filter_dropdown.appendChild(opt)
    })
    filter_dropdown.value = selectedAccount

    _populate_select('createTransactionAccount', accounts)
    _populate_select('editTransactionAccount',   accounts)
}

async function refresh_categories() {
    categories = await get_categories()

    const list = document.getElementById('filter-categories-container')
    render_category_filter_buttons_list(categories, list)

    // FIX: render_category_filter_buttons_list siempre pone 'active' en "All".
    // Restaurar el estado real de selectedCategory después de re-renderizar.
    _sync_active_category_btn(list)

    _populate_select('createCategory', categories)
    _populate_select('editCategory',   categories)
}

/** Marca como active el botón que coincide con selectedCategory */
function _sync_active_category_btn(container) {
    container.querySelectorAll('.filter-btn').forEach(btn => {
        const matches = String(btn.dataset.category) === String(selectedCategory)
        btn.classList.toggle('active', matches)
    })
}


// ============================================================
//  PAGINATION
// ============================================================
function render_pagination({ total, page, limit }) {
    const container = document.getElementById('pagination')
    if (!container) return
    container.innerHTML = ''

    if (CURRENT_PAGE > 1) {
        const prev = document.createElement('button')
        prev.textContent = 'Prev'
        prev.type        = 'button'
        prev.onclick     = () => { CURRENT_PAGE--; refresh_transactions() }
        container.appendChild(prev)
    }

    const label = document.createElement('span')
    label.textContent = ` Page ${CURRENT_PAGE} `
    container.appendChild(label)

    if (page * limit < total) {
        const next = document.createElement('button')
        next.textContent = 'Next'
        next.type        = 'button'
        next.onclick     = () => { CURRENT_PAGE++; refresh_transactions() }
        container.appendChild(next)
    }
}


// ============================================================
//  SELECT HELPER
// ============================================================
function _populate_select(select_id, items, selected_id = null) {
    const select = document.getElementById(select_id)
    if (!select) return
    select.innerHTML = ''
    const fragment = document.createDocumentFragment()
    items.forEach(item => {
        const opt = document.createElement('option')
        opt.value       = item.id
        opt.textContent = item.name ?? item.title
        fragment.appendChild(opt)
    })
    select.appendChild(fragment)
    if (selected_id !== null) select.value = selected_id
}



function openEditTransactionModal(tx) {
    current_editing_transaction = tx.id

    document.getElementById('editTitle').value  = tx.title
    document.getElementById('editAmount').value = tx.amount

    _populate_select('editCategory',           categories, tx.categoryId)
    _populate_select('editTransactionAccount', accounts,   tx.accountId)

    open_modal('editModalTransaction')
}

function openDeleteTransactionModal(tx) {
    current_deleting_transaction = tx.id
    document.getElementById('deleteTitle').textContent = tx.title
    open_modal('deleteModalTransaction')
}


//  TRANSACTION FORM BINDINGS
function bind_create_transaction_form() {
    document.getElementById('createTransactionForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const form = e.target
            const formData = new FormData(form)

            const categoryId = formData.get('category')
            const accountId  = formData.get('account')

            try {
                console.log({
                    title: formData.get('title'),
                    amount: formData.get('amount'),
                    categoryId: formData.get('category'),
                    accountId: formData.get('account')
                })
                await create_transaction({
                    title:      formData.get('title').trim(),
                    amount:     parseFloat(formData.get('amount')),
                    categoryId,
                    accountId
                })
                close_modal('createModalTransaction')
                form.reset()
                CURRENT_PAGE = 1
                await refresh_transactions()
            } catch (err) {
                alert(err.message)
            }
        })
}

function bind_edit_transaction_form() {
    document.getElementById('editTransactionForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            const title = formData.get('editTitle')
            const amount = formData.get('editAmount')
            const category = formData.get('editCategory')
            const account = formData.get('editTransactionAccount')

            const parsedAmount = Number(amount)

            if (isNaN(parsedAmount)) {
                alert('Invalid amount')
                return
            }

            try {
                await update_transaction(current_editing_transaction, {
                    title,
                    amount: parsedAmount,
                    categoryId: category,
                    accountId: account
                })

                close_modal('editModalTransaction')
                current_editing_transaction = null
                await refresh_transactions()

            } catch (err) {
                alert(err.message)
            }
        })
}

function bind_delete_transaction_confirm() {
    document.getElementById('confirmDeleteTransactionBtn')
        .addEventListener('click', async () => {
            try {
                await delete_transaction_api(current_deleting_transaction)
                close_modal('deleteModalTransaction')
                current_deleting_transaction = null
                if (transactions.length === 1 && CURRENT_PAGE > 1) CURRENT_PAGE--
                await refresh_transactions()
            } catch (err) {
                alert(err.message)
            }
        })
}


//  CATEGORY MODALS
function open_edit_category_modal(id) {
    current_editing_category = id
    const category = categories.find(cat => String(cat.id) === String(id))
    if (!category) return
    document.getElementById('editCategoryName').value = category.name
    document.getElementById('editCategoryIcon').value = category.icon
    open_modal('editModalCategory')
}

function open_delete_category_modal(id) {
    current_deleting_category = id
    const category = categories.find(cat => String(cat.id) === String(id))
    if (!category) return
    document.getElementById('categoryNameToDelete').textContent = category.name
    open_modal('deleteModalCategory')
}


//  CATEGORY FORM BINDINGS
function bind_create_category_form() {
    document.getElementById('createCategoryForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const formData = new FormData(e.target)
            try {
                await create_category({
                    name: formData.get('name').trim(),
                    icon: formData.get('icon'),
                })

                close_modal('createModalCategory')
                await refresh_categories()

            } catch (err) {
                alert(err.message)
            }
        })
}

function bind_edit_category_form() {
    document.getElementById('editCategoryForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const form = e.target
            try {
                await update_category(current_editing_category, {
                    name: form.editName.value.trim(),
                    icon: form.editIcon.value,
                })

                close_modal('editModalCategory')
                current_editing_category = null

                await Promise.all([
                    refresh_categories(),
                    refresh_transactions()
                ])

            } catch (err) {
                alert(err.message)
            }
        })
}

function bind_delete_category_confirm() {
    document.getElementById('confirmDeleteCategoryBtn')
        .addEventListener('click', async () => {
            if (!current_deleting_category) return
            const deletedId = current_deleting_category
            const btn = document.getElementById('confirmDeleteCategoryBtn')
            btn.disabled = true
            try {
                await delete_category(deletedId)
                close_modal('deleteModalCategory')
                current_deleting_category = null

                CURRENT_PAGE = 1

                if (String(selectedCategory) === String(deletedId)) {
                    selectedCategory = 'all'
                }

                await Promise.all([
                    refresh_categories(),
                    refresh_transactions()
                ])

            } catch (err) {
                alert(err.message || 'Error deleting category')
            }finally {
                btn.disabled = false
            }
        })
}


//  FILTER BINDINGS
function bind_account_filter() {
    document.getElementById('accountFilterSelect')
        .addEventListener('change', (e) => {
            if (e.target.value === selectedAccount) return
            selectedAccount = e.target.value
            CURRENT_PAGE = 1
            refresh_transactions()
        })
}

function bind_category_filter_events() {
    const container = document.getElementById('filter-categories-container')

    container.addEventListener('click', (e) => {
        const settingsBtn = e.target.closest('.filter-settings-btn')
        if (settingsBtn) {
            const menu   = settingsBtn.closest('.filter-btn-group').querySelector('.category-settings-menu')
            const isOpen = menu.classList.contains('active')
            container.querySelectorAll('.category-settings-menu').forEach(m => m.classList.remove('active'))
            if (!isOpen) menu.classList.add('active')
            return
        }

        const editBtn = e.target.closest('.edit-mini')
        if (editBtn) {
            container.querySelectorAll('.category-settings-menu').forEach(m => m.classList.remove('active'))
            open_edit_category_modal(editBtn.dataset.categoryId)
            return
        }

        const deleteBtn = e.target.closest('.delete-mini')
        if (deleteBtn) {
            container.querySelectorAll('.category-settings-menu').forEach(m => m.classList.remove('active'))
            open_delete_category_modal(deleteBtn.dataset.categoryId)
            return
        }

        container.querySelectorAll('.category-settings-menu').forEach(m => m.classList.remove('active'))

        const filterBtn = e.target.closest('.filter-btn')
        if (!filterBtn) return

        if (e.target.closest('.category-settings-menu')) return

        const newCategory = String(filterBtn.dataset.category)
        if (newCategory === String(selectedCategory)) return

        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
        filterBtn.classList.add('active')

        selectedCategory = newCategory
        CURRENT_PAGE = 1
        refresh_transactions()
    })
}


//  ACCOUNT FORM BINDINGS
function bind_create_account_form() {
    document.getElementById('createAccountForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const form = e.target
            try {
                await create_account({ name: form.name.value.trim() })
                close_modal('createModalAccount')
                form.reset()
                await refresh_accounts()
            } catch (err) {
                alert(err.message)
            }
        })
}