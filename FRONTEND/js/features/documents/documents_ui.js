let extracted_transactions = []
let selected_indices = new Set()

document.addEventListener('DOMContentLoaded', async () => {
    initialize_sidebar_navigation()
    bind_upload()
})

// ===== UPLOAD =====
function bind_upload() {
    const chooseBtn = document.getElementById('chooseFilesBtn')
    const fileInput = document.getElementById('fileInput')
    const uploadArea = document.getElementById('uploadArea')

    chooseBtn?.addEventListener('click', () => fileInput.click())
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0]
        if (file) handle_file(file)
        fileInput.value = ''
    })

    uploadArea?.addEventListener('dragover', (e) => {
        e.preventDefault()
        uploadArea.classList.add('drag-active')
    })

    uploadArea?.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-active')
    })

    uploadArea?.addEventListener('drop', (e) => {
        e.preventDefault()
        uploadArea.classList.remove('drag-active')
        const file = e.dataTransfer.files[0]
        if (file) handle_file(file)
    })
}

async function handle_file(file) {
    if (file.type !== 'application/pdf') {
        alert('Only PDF files are supported.')
        return
    }

    show_loading_state(file.name)

    try {
        const result = await parse_document(file)
        extracted_transactions = result.transactions || []

        if (extracted_transactions.length === 0) {
            hide_results_section()
            alert('No transactions were found in this document.')
            return
        }

        selected_indices = new Set(extracted_transactions.map((_, i) => i))
        render_extracted_transactions(result.filename)
    } catch (err) {
        hide_results_section()
        alert(err.message || 'Failed to process document.')
    } finally {
        hide_loading_state()
    }
}

// ===== LOADING STATE =====
function show_loading_state(filename) {
    const uploadArea = document.getElementById('uploadArea')
    if (!uploadArea) return
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="upload-spinner"></div>
            <h3 class="upload-title">Analyzing <em>${filename}</em>…</h3>
            <p class="upload-description">Extracting transactions with AI. This may take a moment.</p>
        </div>
    `
}

function hide_loading_state() {
    const uploadArea = document.getElementById('uploadArea')
    if (!uploadArea) return
    uploadArea.innerHTML = `
        <div class="upload-content">
            <div class="upload-icon-wrapper">
                <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                    <polyline points="17 8 12 3 7 8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15" stroke-width="2" stroke-linecap="round"></line>
                </svg>
            </div>
            <h3 class="upload-title">Upload your financial documents</h3>
            <p class="upload-description">Drag and drop your files here or use the upload button to browse.</p>
            <p class="upload-note">Supported formats: PDF</p>
        </div>
    `
}

// ===== RENDER EXTRACTED TRANSACTIONS =====
function render_extracted_transactions(filename) {
    const section = document.getElementById('extractedSection')
    const titleEl = document.getElementById('extractedFilename')
    const countEl = document.getElementById('extractedCount')
    const listEl = document.getElementById('extractedList')

    if (!section || !listEl) return

    titleEl.textContent = filename
    countEl.textContent = `${extracted_transactions.length} transactions found`

    listEl.innerHTML = ''

    extracted_transactions.forEach((tx, i) => {
        const isPositive = tx.amount >= 0
        const amountClass = isPositive ? 'amount-positive' : 'amount-negative'
        const amountStr = (isPositive ? '+' : '') + Number(tx.amount).toFixed(2)

        const row = document.createElement('div')
        row.className = 'extracted-row'
        row.dataset.index = i
        row.innerHTML = `
            <label class="extracted-checkbox-label">
                <input type="checkbox" class="extracted-checkbox" data-index="${i}" checked />
            </label>
            <div class="extracted-info">
                <span class="extracted-title">${escape_html(tx.title)}</span>
                <span class="extracted-date">${tx.date || 'No date'}</span>
            </div>
            <span class="extracted-amount ${amountClass}">${amountStr}</span>
        `

        row.querySelector('.extracted-checkbox').addEventListener('change', (e) => {
            if (e.target.checked) {
                selected_indices.add(i)
            } else {
                selected_indices.delete(i)
            }
            update_import_btn_count()
        })

        listEl.appendChild(row)
    })

    update_import_btn_count()
    section.classList.remove('hidden')
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function hide_results_section() {
    const section = document.getElementById('extractedSection')
    if (section) section.classList.add('hidden')
}

function update_import_btn_count() {
    const btn = document.getElementById('importTransactionsBtn')
    if (btn) btn.textContent = `Import ${selected_indices.size} Transaction${selected_indices.size !== 1 ? 's' : ''}`
}

// ===== SELECT ALL / DESELECT ALL =====
document.addEventListener('click', (e) => {
    if (e.target.id === 'selectAllBtn') {
        document.querySelectorAll('.extracted-checkbox').forEach(cb => {
            cb.checked = true
            selected_indices.add(Number(cb.dataset.index))
        })
        update_import_btn_count()
    }

    if (e.target.id === 'deselectAllBtn') {
        document.querySelectorAll('.extracted-checkbox').forEach(cb => {
            cb.checked = false
            selected_indices.delete(Number(cb.dataset.index))
        })
        update_import_btn_count()
    }

    if (e.target.id === 'importTransactionsBtn') {
        open_import_modal()
    }

    if (e.target.id === 'cancelExtractedBtn') {
        hide_results_section()
        extracted_transactions = []
        selected_indices = new Set()
    }
})

// ===== IMPORT MODAL =====
async function open_import_modal() {
    if (selected_indices.size === 0) {
        alert('Select at least one transaction to import.')
        return
    }

    try {
        const accounts_data = await get_accounts()
        const categories_data = await get_categories()

        const accountSelect = document.getElementById('importAccountSelect')
        const categorySelect = document.getElementById('importCategorySelect')

        accountSelect.innerHTML = `<option value="">Select account</option>`
        accounts_data.forEach(a => {
            accountSelect.innerHTML += `<option value="${a.id}">${escape_html(a.name)}</option>`
        })

        categorySelect.innerHTML = `<option value="">Select category (optional)</option>`
        categories_data.forEach(c => {
            categorySelect.innerHTML += `<option value="${c.id}">${c.icon} ${escape_html(c.name)}</option>`
        })

        open_modal('importModal')
    } catch (err) {
        alert(err.message || 'Failed to load accounts/categories.')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('importForm')?.addEventListener('submit', async (e) => {
        e.preventDefault()
        const accountId = document.getElementById('importAccountSelect').value
        const categoryId = document.getElementById('importCategorySelect').value

        if (!accountId) {
            alert('Please select an account.')
            return
        }

        const btn = document.getElementById('confirmImportBtn')
        btn.disabled = true
        btn.textContent = 'Importing…'

        const to_import = extracted_transactions.filter((_, i) => selected_indices.has(i))

        let success = 0
        let failed = 0

        for (const tx of to_import) {
            try {
                await create_transaction({
                    title: tx.title,
                    amount: tx.amount,
                    accountId,
                    categoryId: categoryId || undefined,
                    epoch: tx.epoch
                })
                success++
            } catch {
                failed++
            }
        }

        close_modal('importModal')
        btn.disabled = false
        update_import_btn_count()

        const msg = failed > 0
            ? `Imported ${success} transaction(s). ${failed} failed.`
            : `Successfully imported ${success} transaction(s).`

        alert(msg)

        if (success > 0) {
            hide_results_section()
            extracted_transactions = []
            selected_indices = new Set()
        }
    })
})

function escape_html(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}
