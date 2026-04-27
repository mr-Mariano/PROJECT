function format_dashboard_currency(amount) {
    const normalizedAmount = Number(amount) || 0;
    const absoluteAmount = Math.abs(normalizedAmount).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `${normalizedAmount >= 0 ? '+' : '-'}$${absoluteAmount}`;
}

function parse_dashboard_amount(value) {
    if (typeof value === 'number') {
        return value;
    }

    const normalized = String(value || '')
        .replace(/[^0-9.-]/g, '')
        .trim();

    if (!normalized) {
        return 0;
    }

    return Number(normalized);
}

function create_dashboard_transaction_item(transaction) {
    const transactionItem = document.createElement('div');
    transactionItem.classList.add('transaction-item');
    transactionItem.dataset.transactionId = transaction.id || '';
    transactionItem.dataset.accountId = transaction.accountId || '';

    const transactionInfo = document.createElement('div');
    transactionInfo.classList.add('transaction-info');

    const transactionTitle = document.createElement('p');
    transactionTitle.classList.add('transaction-title');
    transactionTitle.textContent = transaction.title || '';

    const transactionMeta = document.createElement('div');
    transactionMeta.classList.add('transaction-meta');

    const transactionDate = document.createElement('span');
    transactionDate.classList.add('transaction-date');
    transactionDate.textContent = transaction.date || '';

    const transactionCategory = document.createElement('span');
    transactionCategory.classList.add('transaction-category');
    transactionCategory.textContent = transaction.category || '';

    const transactionAccount = document.createElement('span');
    transactionAccount.classList.add('transaction-account');
    transactionAccount.textContent = transaction.account || '';

    transactionMeta.appendChild(transactionDate);
    transactionMeta.appendChild(transactionCategory);
    transactionMeta.appendChild(transactionAccount);
    transactionInfo.appendChild(transactionTitle);
    transactionInfo.appendChild(transactionMeta);

    const transactionAmount = document.createElement('p');
    transactionAmount.classList.add('transaction-amount');
    const normalizedAmount = parse_dashboard_amount(transaction.amount);
    if (normalizedAmount > 0) {
        transactionAmount.classList.add('positive');
    }
    transactionAmount.textContent = format_dashboard_currency(normalizedAmount);

    const transactionActions = document.createElement('div');
    transactionActions.classList.add('transaction-actions');

    const editButton = document.createElement('button');
    editButton.type = 'button';
    editButton.classList.add('action-btn', 'edit-btn');
    editButton.dataset.transactionAction = 'edit';
    editButton.setAttribute('aria-label', 'Edit transaction');
    editButton.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke-width="2"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke-width="2"></path>
        </svg>
    `;

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('action-btn', 'delete-btn');
    deleteButton.dataset.transactionAction = 'delete';
    deleteButton.setAttribute('aria-label', 'Delete transaction');
    deleteButton.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke-width="2"></path>
            <line x1="10" y1="11" x2="10" y2="17" stroke-width="2"></line>
            <line x1="14" y1="11" x2="14" y2="17" stroke-width="2"></line>
        </svg>
    `;

    transactionActions.appendChild(editButton);
    transactionActions.appendChild(deleteButton);
    transactionItem.appendChild(transactionInfo);
    transactionItem.appendChild(transactionAmount);
    transactionItem.appendChild(transactionActions);

    return transactionItem;
}

function render_dashboard_transactions(transactions, containerId = 'recent-transactions-list') {
    const container = document.getElementById(containerId);
    if (!container) {
        return;
    }

    container.innerHTML = '';

    const fragment = document.createDocumentFragment();
    transactions.forEach((transaction) => {
        fragment.appendChild(create_dashboard_transaction_item(transaction));
    });

    container.appendChild(fragment);
}

function collect_dashboard_transactions_from_dom(containerId = 'recent-transactions-list') {
    const container = document.getElementById(containerId);
    if (!container) {
        return [];
    }

    return Array.from(container.querySelectorAll('.transaction-item')).map((item) => {
        const amountText = item.querySelector('.transaction-amount')?.textContent?.trim() || '0';
        return {
            id: item.dataset.transactionId || '',
            title: item.querySelector('.transaction-title')?.textContent?.trim() || '',
            date: item.querySelector('.transaction-date')?.textContent?.trim() || '',
            category: item.querySelector('.transaction-category')?.textContent?.trim() || '',
            accountId: item.dataset.accountId || '',
            account: item.querySelector('.transaction-account')?.textContent?.trim() || '',
            amount: parse_dashboard_amount(amountText),
        };
    });
}

function update_dashboard_balances(transactions) {
    const totalBalanceElement = document.getElementById('dashboardTotalBalance');
    const incomeElement = document.getElementById('dashboardIncomeTotal');
    const expensesElement = document.getElementById('dashboardExpensesTotal');

    const income = transactions
        .map((transaction) => parse_dashboard_amount(transaction.amount))
        .filter((amount) => amount > 0)
        .reduce((sum, amount) => sum + amount, 0);

    const expenses = transactions
        .map((transaction) => parse_dashboard_amount(transaction.amount))
        .filter((amount) => amount < 0)
        .reduce((sum, amount) => sum + Math.abs(amount), 0);

    const totalBalance = income - expenses;

    if (totalBalanceElement) {
        totalBalanceElement.textContent = `$${Math.abs(totalBalance).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    }

    if (incomeElement) {
        incomeElement.textContent = `$${income.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }

    if (expensesElement) {
        expensesElement.textContent = `$${expenses.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    }
}

function get_last_six_months() {
    const months = [];
    const referenceDate = new Date();

    for (let offset = 5; offset >= 0; offset -= 1) {
        const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - offset, 1);
        months.push({
            key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
            label: date.toLocaleString('en-US', { month: 'short' }),
        });
    }

    return months;
}

function get_month_key_from_date_label(dateLabel) {
    const parsedDate = new Date(dateLabel);
    if (Number.isNaN(parsedDate.getTime())) {
        return null;
    }

    return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
}

function update_dashboard_chart(transactions) {
    const canvas = document.getElementById('spendingTrendChart');
    if (!canvas || typeof Chart === 'undefined') {
        return;
    }

    const months = get_last_six_months();
    const monthTotals = months.reduce((accumulator, month) => {
        accumulator[month.key] = 0;
        return accumulator;
    }, {});

    transactions.forEach((transaction) => {
        const amount = parse_dashboard_amount(transaction.amount);
        if (amount >= 0) {
            return;
        }

        const monthKey = get_month_key_from_date_label(transaction.date);
        if (!monthKey || !(monthKey in monthTotals)) {
            return;
        }

        monthTotals[monthKey] += Math.abs(amount);
    });

    const labels = months.map((month) => month.label);
    const values = months.map((month) => monthTotals[month.key]);

    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(167, 139, 250, 0.35)');
    gradient.addColorStop(1, 'rgba(167, 139, 250, 0)');

    if (window.dashboardSpendingChart) {
        window.dashboardSpendingChart.destroy();
    }

    window.dashboardSpendingChart = new Chart(context, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Spending',
                data: values,
                borderColor: 'hsl(270, 60%, 65%)',
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'hsl(270, 60%, 65%)',
                pointBorderColor: '#1e1e1e',
                pointBorderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label(context) {
                            return `$${context.parsed.y.toLocaleString()}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(153, 153, 153, 0.12)',
                    },
                    ticks: {
                        color: 'hsl(0, 0%, 60%)',
                    },
                },
                y: {
                    grid: {
                        color: 'rgba(153, 153, 153, 0.12)',
                    },
                    ticks: {
                        color: 'hsl(0, 0%, 60%)',
                        callback(value) {
                            return `$${value}`;
                        },
                    },
                },
            },
        },
    });
}

function render_dashboard_overview(transactions) {
    update_dashboard_balances(transactions);
    update_dashboard_chart(transactions);
}

function render_dashboard_page(transactions = get_dashboard_seed_transactions()) {
    render_dashboard_transactions(transactions);
    render_dashboard_overview(transactions);
}

function refresh_dashboard_from_dom(containerId = 'recent-transactions-list') {
    const transactions = collect_dashboard_transactions_from_dom(containerId);
    render_dashboard_overview(transactions);
}
