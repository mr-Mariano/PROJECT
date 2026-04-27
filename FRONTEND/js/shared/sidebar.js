function initialize_sidebar_navigation() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (!hamburgerBtn || !sidebar || !sidebarOverlay) {
        return;
    }

    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        sidebar.classList.toggle('mobile-open');
        sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', () => {
        hamburgerBtn.classList.remove('active');
        sidebar.classList.remove('mobile-open');
        sidebarOverlay.classList.remove('active');
    });

    document.querySelectorAll('.nav-item').forEach((link) => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        });
    });
}
