// ================= FORMAT =================
function format_transaction_amount(amount) {
    const normalizedAmount = Number(amount) || 0;

    const absoluteAmount = Math.abs(normalizedAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `${normalizedAmount >= 0 ? '+' : '-'}$${absoluteAmount}`;
}


// ================= MAIN RENDER =================
function render_transaction_list(transactions, containerOrId, options = {}) {
    const container = typeof containerOrId === 'string'
        ? document.getElementById(containerOrId)
        : containerOrId;

    if (!container) return;

    container.innerHTML = '';

    const fragment = document.createDocumentFragment();

    transactions.forEach((tx) => {
        fragment.appendChild(create_transaction_item(tx, options));
    });

    container.appendChild(fragment);
}


// ================= ITEM =================
function create_transaction_item(transaction, options = {}) {
    const {
        itemClass = 'transaction-item',
        showActions = true,
        useDataActions = false,
    } = options;

    const item = document.createElement('div');
    item.classList.add(itemClass);

    item.dataset.id = transaction.id || '';
    item.dataset.accountId = transaction.accountId || '';

    item.appendChild(create_transaction_info(transaction));
    item.appendChild(create_transaction_amount(transaction.amount));

    if (showActions) {
        item.appendChild(create_transaction_actions({ useDataActions }));
    }

    return item;
}


// ================= INFO =================
function create_transaction_info(transaction) {
    const { title, date, category, accountName } = transaction;

    const info = document.createElement('div');
    info.classList.add('transaction-info');

    const titleEl = document.createElement('p');
    titleEl.classList.add('transaction-title');
    titleEl.textContent = title || '';

    const meta = document.createElement('div');
    meta.classList.add('transaction-meta');

    const dateEl = document.createElement('span');
    dateEl.classList.add('transaction-date');
    dateEl.textContent = date || '';

    const categoryEl = document.createElement('span');
    categoryEl.classList.add('transaction-category');
    categoryEl.textContent = category || '';

    const accountEl = document.createElement('span');
    accountEl.classList.add('transaction-account');
    accountEl.textContent = accountName || '';

    meta.appendChild(dateEl);
    meta.appendChild(categoryEl);
    meta.appendChild(accountEl);

    info.appendChild(titleEl);
    info.appendChild(meta);

    return info;
}


// ================= AMOUNT =================
function create_transaction_amount(amount) {
    const el = document.createElement('p');
    el.classList.add('transaction-amount');

    const numericAmount = Number(amount) || 0;

    if (numericAmount > 0) {
        el.classList.add('positive');
    }

    el.textContent = format_transaction_amount(numericAmount);

    return el;
}


// ================= ACTIONS =================
function create_transaction_actions({ useDataActions = false } = {}) {
    const actions = document.createElement('div');
    actions.classList.add('transaction-actions');

    actions.appendChild(create_button_edit(useDataActions));
    actions.appendChild(create_button_delete(useDataActions));

    return actions;
}


// ================= BUTTONS =================
function create_button_edit(useDataActions=false) {
    const button = document.createElement('button')
    button.type = 'button'
    button.classList.add('action-btn', 'edit-btn')
    if (useDataActions) {
        button.dataset.transactionAction = 'edit'
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('viewBox', '0 0 24 24')

    const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path1.setAttribute('d', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7')
    path1.setAttribute('stroke-width', '2')

    const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path2.setAttribute('d', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z')
    path2.setAttribute('stroke-width', '2')

    svg.appendChild(path1)
    svg.appendChild(path2)

    button.appendChild(svg)

    return button
}

function create_button_delete(useDataActions) {
    const button = document.createElement('button')

    button.type = 'button'

    button.classList.add('action-btn', 'delete-btn')

    if (useDataActions) {
        button.dataset.transactionAction = 'delete'
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('viewBox', '0 0 24 24')

    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline')
    polyline.setAttribute('points', '3 6 5 6 21 6')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')
    path.setAttribute('stroke-width', '2')

    const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line1.setAttribute('x1', '10')
    line1.setAttribute('y1', '11')
    line1.setAttribute('x2', '10')
    line1.setAttribute('y2', '17')
    line1.setAttribute('stroke-width', '2')

    const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line')
    line2.setAttribute('x1', '14')
    line2.setAttribute('y1', '11')
    line2.setAttribute('x2', '14')
    line2.setAttribute('y2', '17')
    line2.setAttribute('stroke-width', '2')

    svg.appendChild(polyline)
    svg.appendChild(path)
    svg.appendChild(line1)
    svg.appendChild(line2)
    button.appendChild(svg)

    return button
}