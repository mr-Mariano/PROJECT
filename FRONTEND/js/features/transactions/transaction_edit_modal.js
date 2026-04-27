let edit_modal_accounts_cache = null;

async function get_edit_modal_accounts({ forceReload = false } = {}) {
    if (!forceReload && Array.isArray(edit_modal_accounts_cache)) {
        return edit_modal_accounts_cache;
    }

    if (typeof get_accounts !== 'function') {
        edit_modal_accounts_cache = [];
        return edit_modal_accounts_cache;
    }

    try {
        const accounts = await get_accounts();
        edit_modal_accounts_cache = Array.isArray(accounts) ? accounts : [];
    } catch (error) {
        console.error('Unable to fetch accounts for edit modal.', error);
        edit_modal_accounts_cache = [];
    }

    return edit_modal_accounts_cache;
}

function set_edit_modal_account_options(selectElement, accounts, preferredAccountId = '') {
    if (!selectElement) {
        return;
    }

    selectElement.innerHTML = '';

    accounts.forEach((account) => {
        selectElement.add(new Option(account.name || account.id || 'Account', account.id || ''));
    });

    if (accounts.length === 0) {
        return;
    }

    const selectedId = accounts.some((account) => account.id === preferredAccountId)
        ? preferredAccountId
        : accounts[0].id;

    selectElement.value = selectedId;
}

function parse_amount_from_transaction_text(amountText) {
    const normalized = String(amountText || '').replace(/[^0-9.-]/g, '').trim();
    if (!normalized) {
        return '';
    }

    return Math.abs(Number(normalized)).toString();
}

function find_account_id_from_transaction_item(transactionItem, accounts, accountSelector) {
    const accountIdFromData = transactionItem?.dataset?.accountId || '';
    if (accountIdFromData && accounts.some((account) => account.id === accountIdFromData)) {
        return accountIdFromData;
    }

    const accountName = transactionItem
        ?.querySelector(accountSelector)
        ?.textContent
        ?.trim()
        ?.toLowerCase() || '';

    const matchByName = accounts.find((account) =>
        String(account.name || '').trim().toLowerCase() === accountName,
    );

    return matchByName?.id || '';
}

async function prepare_edit_modal_from_transaction_item(transactionItem, config = {}) {
    const {
        titleSelector = '.transaction-title',
        amountSelector = '.transaction-amount',
        categorySelector = '.transaction-category',
        accountSelector = '.transaction-account',
        titleInputId = 'editTitle',
        amountInputId = 'editAmount',
        categoryInputId = 'editCategory',
        accountSelectId = 'editTransactionAccount',
    } = config;

    if (!transactionItem) {
        return [];
    }

    const titleInput = document.getElementById(titleInputId);
    const amountInput = document.getElementById(amountInputId);
    const categoryInput = document.getElementById(categoryInputId);
    const accountSelect = document.getElementById(accountSelectId);

    const titleText = transactionItem.querySelector(titleSelector)?.textContent?.trim() || '';
    const amountText = transactionItem.querySelector(amountSelector)?.textContent?.trim() || '';
    const categoryText = transactionItem.querySelector(categorySelector)?.textContent?.trim() || '';

    const accounts = await get_edit_modal_accounts();
    const accountId = find_account_id_from_transaction_item(transactionItem, accounts, accountSelector);

    if (titleInput) {
        titleInput.value = titleText;
    }

    if (amountInput) {
        amountInput.value = parse_amount_from_transaction_text(amountText);
    }

    if (categoryInput && categoryText) {
        categoryInput.value = categoryText;
    }

    if (accountSelect) {
        set_edit_modal_account_options(accountSelect, accounts, accountId);
    }

    return accounts;
}

function get_selected_account_from_edit_modal(accountSelectId = 'editTransactionAccount') {
    const accountSelect = document.getElementById(accountSelectId);
    if (!accountSelect) {
        return null;
    }

    const selectedOption = accountSelect.options[accountSelect.selectedIndex];
    if (!selectedOption) {
        return null;
    }

    return {
        id: accountSelect.value,
        name: selectedOption.textContent,
    };
}
