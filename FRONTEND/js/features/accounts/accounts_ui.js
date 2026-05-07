let accounts = []
let current_editing_account = null
let current_deleting_account = null

document.addEventListener('DOMContentLoaded', () => {
    bind_account_actions()
    bind_create_account_form()
    bind_edit_account_form()
    bind_delete_account_confirm()
    bind_linked_account_modal_actions()
    refresh_accounts()
})

async function refresh_accounts() {
    accounts = await get_accounts()
    render_accounts_list(accounts)
}

function render_accounts_list(items) {
    const container = document.getElementById('accounts-container')
    if (!container) return

    container.innerHTML = ''

    if (!items.length) {
        container.innerHTML = '<p class="empty-state">No accounts found. Create one to get started.</p>'
        return
    }

    const fragment = document.createDocumentFragment()

    items.forEach((account) => {
        const item = document.createElement('div')
        item.classList.add('account-item-full')
        item.dataset.id = account.id
        item.dataset.name = account.name

        const info = document.createElement('div')
        info.classList.add('account-info')
        info.innerHTML = `
            <p class="account-title">${account.name}</p>
            <span class="account-meta">Account</span>
        `

        const actions = document.createElement('div')
        actions.classList.add('transaction-actions')
        actions.innerHTML = `
            <button type="button" class="action-btn edit-btn" data-account-action="edit" aria-label="Edit account">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"></path>
                </svg>
            </button>
            <button type="button" class="action-btn delete-btn" data-account-action="delete" aria-label="Delete account">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"></path>
                    <line x1="10" y1="11" x2="10" y2="17" stroke-width="2"></line>
                    <line x1="14" y1="11" x2="14" y2="17" stroke-width="2"></line>
                </svg>
            </button>
        `

        item.appendChild(info)
        item.appendChild(actions)
        fragment.appendChild(item)
    })

    container.appendChild(fragment)
}

function bind_account_actions() {
    const container = document.getElementById('accounts-container')
    if (!container) return

    container.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-account-action="edit"]')
        const deleteBtn = e.target.closest('[data-account-action="delete"]')
        if (!editBtn && !deleteBtn) return

        const item = e.target.closest('.account-item-full')
        if (!item) return

        const account = {
            id: item.dataset.id,
            name: item.dataset.name
        }

        if (editBtn) open_edit_account_modal(account)
        if (deleteBtn) open_delete_account_modal(account)
    })
}

function open_edit_account_modal(account) {
    current_editing_account = account.id
    document.getElementById('editAccountName').value = account.name
    open_modal('editModalAccount')
}

function open_delete_account_modal(account) {
    current_deleting_account = account.id
    document.getElementById('accountNameToDelete').textContent = account.name
    open_modal('deleteModalAccount')
}

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

function bind_edit_account_form() {
    document.getElementById('editAccountForm')
        .addEventListener('submit', async (e) => {
            e.preventDefault()
            const form = e.target

            try {
                await update_account(current_editing_account, {
                    name: form.name.value.trim()
                })

                close_modal('editModalAccount')
                current_editing_account = null
                await refresh_accounts()
            } catch (err) {
                alert(err.message)
            }
        })
}

function bind_delete_account_confirm() {
    document.getElementById('confirmDeleteAccountBtn')
        .addEventListener('click', async () => {
            if (!current_deleting_account) return
            const deletedId = current_deleting_account
            const btn = document.getElementById('confirmDeleteAccountBtn')
            btn.disabled = true

            try {
                const response = await delete_account(deletedId)

                if (response.message === 'ACCOUNT_HAS_TRANSACTIONS') {
                    close_modal('deleteModalAccount')
                    open_modal('linkedAccountModal')
                    return
                }

                close_modal('deleteModalAccount')
                current_deleting_account = null
                await refresh_accounts()
            } catch (err) {
                alert(err.message || 'Error deleting account')
            } finally {
                btn.disabled = false
            }
        })
}

function bind_linked_account_modal_actions() {
    document.getElementById('confirmKeepAccountTransactionsBtn')
        ?.addEventListener('click', handle_keep_transactions_delete)

    document.getElementById('confirmDeleteAccountTransactionsBtn')
        ?.addEventListener('click', handle_delete_transactions_delete)
}

async function handle_keep_transactions_delete() {
    if (!current_deleting_account) return

    try {
        await delete_account_keep_transactions(current_deleting_account)
        close_modal('linkedAccountModal')
        current_deleting_account = null
        await refresh_accounts()
    } catch (err) {
        alert(err.message)
    }
}

async function handle_delete_transactions_delete() {
    if (!current_deleting_account) return

    try {
        await delete_account_with_transactions(current_deleting_account)
        close_modal('linkedAccountModal')
        current_deleting_account = null
        await refresh_accounts()
    } catch (err) {
        alert(err.message)
    }
}
