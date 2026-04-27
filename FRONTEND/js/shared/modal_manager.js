function open_modal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
}

function close_modal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
}

function close_all_modals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
}

function bind_modal_backdrop_close() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                close_modal(modal.id);
            }
        });
    });
}

function bind_modal_close_buttons() {
    document.querySelectorAll('[data-modal-close]').forEach((button) => {
        button.addEventListener('click', () => {
            close_modal(button.dataset.modalClose);
        });
    });
}

function bind_modal_esc_close() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            close_all_modals();
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bind_modal_backdrop_close();
    bind_modal_close_buttons();
    bind_modal_esc_close();
});