const BASE_URI = 'https://fintrack.gabocota.net/'

function validate_login() {
    const token = sessionStorage.getItem('token')
    const isAuth = !!token

    const path = window.location.pathname.split('/').pop()

    const publicRoutes = ['index.html', '', 'register.html']

    if (!isAuth && !publicRoutes.includes(path)) {
        window.location.href = BASE_URI + 'index.html'
        return
    }

    if (isAuth && publicRoutes.includes(path)) {
        window.location.href = BASE_URI + 'dashboard.html'
    }
}

validate_login()