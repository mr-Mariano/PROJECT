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


function render_category_filter_buttons_list(categories, container){
    if (!container) return;
    container.innerHTML = '';

    const fragment = document.createDocumentFragment()
    fragment.appendChild(create_all_filter_btn_group())

    categories.forEach(cat => {
        fragment.appendChild(create_category_item(cat))
    })

    container.appendChild(fragment)
}


// ================= ITEM =================
function create_category_item(category){
    return create_filter_btn_group(category)
}



function create_transaction_item(transaction, options = {}) {
    const {
        itemClass = 'transaction-item',
        showActions = true,
        useDataActions = false,
    } = options;

    const item = document.createElement('div');
    item.classList.add(itemClass);

    item.dataset.id = transaction.id
    item.dataset.title = transaction.title
    item.dataset.amount = transaction.amount
    item.dataset.categoryId = transaction.categoryId
    item.dataset.accountId = transaction.accountId
    item.dataset.date = transaction.date

    item.appendChild(create_transaction_info(transaction));
    item.appendChild(create_transaction_amount(transaction.amount));

    if (showActions) {
        item.appendChild(create_transaction_actions({ useDataActions }));
    }

    return item;
}

// ============ CREATE ALL FILTER CATEGORY BTN ======
function create_all_filter_btn_group(){
    const div = document.createElement('div')
    div.classList.add('filter-btn-group')

    const button = document.createElement('button')
    button.classList.add('filter-btn')
    button.dataset.category = 'all'
    button.type = 'button'

    button.textContent = 'All'
    button.classList.add('active')
    div.appendChild(button)

    return div

}


// ================= INFO =================
function create_transaction_info(transaction) {
    const { id, title, amount, categoryId, categoryName, date, accountId, accountName } = transaction;

    const info = document.createElement('div');
    info.classList.add('transaction-info');

    const titleEl = document.createElement('p');
    titleEl.classList.add('transaction-title');
    titleEl.textContent = title || '';

    const meta = document.createElement('div');
    meta.classList.add('transaction-meta');

    const dateEl = document.createElement('span');
    dateEl.classList.add('transaction-date');
    dateEl.textContent = format_date(date)

    const categoryEl = document.createElement('span')
    categoryEl.classList.add('transaction-category')

    categoryEl.innerHTML = `
    <span class="transaction-category-icon">
        ${transaction.categoryIcon || '📁'}
    </span>

    <span class="transaction-category-name">
        ${categoryName || 'General'}
    </span>
`

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

// ======== FORMAT DATE =======
function format_date(dateString){

    if (!dateString) return ''

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
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


// ============ BUTTON GROUP CATEGORY ===========
function create_filter_btn_group(category){
    const div_filter_btn_group = document.createElement('div')
    div_filter_btn_group.classList.add('filter-btn-group')

    div_filter_btn_group.appendChild(create_filter_btn(category))
    div_filter_btn_group.appendChild(create_setting_filter_btn(category))
    div_filter_btn_group.appendChild(create_category_setting_menu(category))
    return div_filter_btn_group
}

// ===== SETTINGS IN FILTERS ==========
function create_category_setting_menu(category){
    const category_setting_menu = document.createElement('div')
    category_setting_menu.classList.add('category-settings-menu')

    category_setting_menu.appendChild(create_category_edit_btn(category))
    category_setting_menu.appendChild(create_category_delete_btn(category))

    return category_setting_menu
}


// ====== EDIT CATEGORY BTN =======
function create_category_edit_btn(category){
    const button = document.createElement('button')
    button.classList.add('mini-btn', 'edit-mini')
    button.dataset.categoryId = category.id


    const svg = document.createElement('svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('viewBox', '0 0 24 24')

    const path_1 = document.createElement('path')
    path_1.setAttribute('stroke-width', '2')
    path_1.setAttribute('d', 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7')

    const path_2 = document.createElement('path')
    path_2.setAttribute('stroke-width', '2')
    path_2.setAttribute('d', 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z')

    svg.appendChild(path_1)
    svg.appendChild(path_2)
    button.appendChild(svg)
    button.textContent = 'Edit'
    return button
}


// ======= DELETE CATEGORY BTN ======
function create_category_delete_btn(category){
    const button = document.createElement('button')
    button.classList.add('mini-btn', 'delete-mini')
    button.dataset.categoryId = category.id

    const svg = document.createElement('svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('viewBox', '0 0 24 24')

    const polyline = document.createElement('polyline')
    polyline.setAttribute('points', '3 6 5 6 21 6')

    const path = document.createElement('path')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('d', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2')

    const line1 = document.createElement('line')
    line1.setAttribute('x1', '10')
    line1.setAttribute('y1', '11')
    line1.setAttribute('x2', '10')
    line1.setAttribute('y2', '17')
    line1.setAttribute('stroke-width', '2')

    const line2 = document.createElement('line')
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
    button.textContent = 'Delete'
    return button
}


// =========== FILTER BTN ===========
function create_filter_btn(category) {
    const button = document.createElement('button')
    button.classList.add('filter-btn')
    button.type = 'button'
    button.dataset.category = category.id

    // ICON
    const iconSpan = document.createElement('span')
    iconSpan.classList.add('category-icon')
    iconSpan.dataset.role = 'category-icon'
    iconSpan.dataset.icon = category.icon
    iconSpan.setAttribute('role', 'img')
    iconSpan.setAttribute('aria-label', `${category.name} icon`)
    iconSpan.textContent = category.icon
    iconSpan.style.display = 'inline-flex'
    iconSpan.style.alignItems = 'center'
    iconSpan.style.justifyContent = 'center'
    iconSpan.style.width = '1.6em'
    iconSpan.style.height = '1.6em'
    iconSpan.style.borderRadius = '999px'
    iconSpan.style.background = 'rgba(255,255,255,0.12)'

    // LABEL
    const labelSpan = document.createElement('span')
    labelSpan.classList.add('category-label')
    labelSpan.dataset.role = 'category-label'
    labelSpan.textContent = category.name

    button.appendChild(iconSpan)
    button.appendChild(labelSpan)

    return button
}


// =========== SETTINGS FILTER BTN =========
function create_setting_filter_btn(category){
    // BUTTON
    const button = document.createElement('button')
    button.classList.add('filter-settings-btn')
    button.type = 'button'
    button.setAttribute('title', 'Edit category')

    button.dataset.categoryId = category.id

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('fill', 'none')
    svg.setAttribute('stroke', 'currentColor')
    svg.setAttribute('viewBox', '0 0 24 24')

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('d', "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94-1.543-.826-3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z")

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', '12')
    circle.setAttribute('cy', '12')
    circle.setAttribute('r', '3')
    circle.setAttribute('stroke-width', '2')

    svg.appendChild(path)
    svg.appendChild(circle)
    button.appendChild(svg)

    return button
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

function bind_transaction_actions(){
    const container = document.getElementById('transactions-container')

    if (!container) return

    container.addEventListener('click', (e) => {
        const editBtn = e.target.closest('.edit-btn')
        const deleteBtn = e.target.closest('.delete-btn')
        if (!editBtn && !deleteBtn) return

        const item = e.target.closest('.transaction-item-full')
        if (!item) return

        const tx = {
            id: item.dataset.id,
            title: item.dataset.title,
            amount: item.dataset.amount,
            categoryId: item.dataset.categoryId,
            accountId: item.dataset.accountId,
            date: item.dataset.date
        }

        if (editBtn){
            openEditTransactionModal(tx)
        }

        if (deleteBtn){
            openDeleteTransactionModal(tx)
        }
    })
}

function openEditTransactionModal(tx){
    document.getElementById('editTitle').value = tx.title
    document.getElementById('editAmount').value = tx.amount
    document.getElementById('editCategory').value = tx.categoryId
    document.getElementById('editTransactionAccount').value = tx.accountId

    open_modal('editModalTransaction')
}


function openDeleteTransactionModal(tx){
    document.getElementById('deleteTitle').textContent = tx.title
    open_modal('deleteModalTransaction')
}
