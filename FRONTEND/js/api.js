async function fetch_with_auth(url, options = {}) {
    const token = sessionStorage.getItem('token')
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            ...(token && { Authorization: `Bearer ${token}` })
        }
    })

    if (res.status === 401) {
        sessionStorage.removeItem('token')
        window.location.href = '/login.html'
    }

    return res
}


// ===== HELPER =====
async function handle_response(res, defaultMessage = 'Request failed') {
    const text = await res.text()
    const data = text ? JSON.parse(text) : {}

    if (!res.ok) {
        throw new Error(data.message || defaultMessage)
    }

    return data
}


// ================= TRANSACTIONS =================
async function get_transactions({limit = 5, page = 1, category, account, search, from, to} = {}) {
    const params = new URLSearchParams({
        limit,
        page,
        ...(category && { category }),
        ...(account && { account }),
        ...(search && { search }),
        ...(from && { from }),
        ...(to && { to }),
    })

    const res = await fetch_with_auth(`/api/transactions?${params}`)
    return handle_response(res, 'Error getting the transactions')
}

async function create_transaction(data) {
    const { title, amount, categoryId, accountId } = data

    if (!title) throw new Error('Title is required')
    if (amount === null || amount === undefined || amount === '') throw new Error('Amount is required')

    const res = await fetch_with_auth('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    return handle_response(res, 'Error creating transaction')
}

async function update_transaction(id, data) {
    const res = await fetch_with_auth(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    return handle_response(res, 'Error updating transaction')
}

async function delete_transaction_api(id) {
    const res = await fetch_with_auth(`/api/transactions/${id}`, {
        method: 'DELETE',
    })


    return handle_response(res, 'Error deleting transaction')
}


// ================= ACCOUNTS =================
async function get_accounts() {
    const res = await fetch_with_auth('/api/accounts')
    const data = await handle_response(res, 'Error getting accounts')
    return data.accounts
}

async function create_account(data) {
    const res = await fetch_with_auth('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    return handle_response(res, 'Error creating account')
}

async function update_account(id, data) {
    const res = await fetch_with_auth(`/api/accounts/${id}`, {
        method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    return handle_response(res, 'Error updating account')
}

async function delete_account(id) {
    const res = await fetch_with_auth(`/api/accounts/${id}`, {
        method: 'DELETE',
    })

    return handle_response(res, 'Error deleting account')
}


// ================= CATEGORIES =================
async function get_categories() {
    const res = await fetch_with_auth('/api/categories')
    const data = await handle_response(res, 'Error getting categories')
    return data.categories
}

async function create_category(data) {
    const res = await fetch_with_auth('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    const data_response = await handle_response(res, 'Error creating category')
    return data_response.category
}

async function update_category(id, data) {
    const res = await fetch_with_auth(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    })

    const data_response = await handle_response(res, 'Error updating category')
    return data_response.category
}

async function delete_category(id) {
    const res = await fetch_with_auth(`/api/categories/${id}`, {
        method: 'DELETE',
    })

    const data = await res.json()
    if (res.status === 409) {
        return data
    }

    if (!res.ok) {
        throw new Error(data.message || 'Error deleting category')
    }

    return data
}

async function delete_category_keep_transactions(id){
    const res = await fetch_with_auth(
        `/api/categories/${id}/keep-transactions`,
        {
            method: 'DELETE'
        }
    )

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || 'Error deleting category')
    }

    return data
}

async function delete_category_with_transactions(id){
    const res = await fetch_with_auth(
        `/api/categories/${id}/delete-transactions`,
        {
            method: 'DELETE'
        }
    )

    const data = await res.json()

    if (!res.ok) {
        throw new Error(data.message || 'Error deleting category')
    }

    return data
}


// ================= BUDGETS =================
async function get_budgets(){
    const res = await fetch_with_auth('/api/budgets')
    const data = await handle_response(res, 'Error getting budgets')
    return data.budgets
}


async function create_budget(data){
    const {
        budgetName,
        limit,
        categoryId
    } = data

    if (!budgetName?.trim()){
        throw new Error('Budget name is required')
    }

    if (limit === undefined || limit === null || limit === ''){
        throw new Error('Budget limit is required')
    }

    if (!categoryId){
        throw new Error('Category is required')
    }

    const res = await fetch_with_auth(
        '/api/budgets',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }
    )

    return handle_response(res, 'Error creating budget')
}


async function update_budget(id, data){
    const res = await fetch_with_auth(`/api/budgets/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })

    return handle_response(res, 'Error updating budget')
}


async function delete_budget(id){

    const res = await fetch_with_auth(`/api/budgets/${id}`, {
        method: 'DELETE'
    })

    return handle_response(res, 'Error deleting budget')
}

// ======== user ========
async function update_user(data) {
    const res = await fetch_with_auth('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })

    return handle_response(res, 'Error updating user')
}

async function delete_user() {
    const res = await fetch_with_auth('/api/users', {
        method: 'DELETE'
    })

    return handle_response(res, 'Error deleting user')
}

async function get_me() {
    const res = await fetch_with_auth('/api/users/me')
    return handle_response(res, 'Error getting user')
}