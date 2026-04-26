const BASE_URI = 'http://localhost:3000/'

const validate_login = () => {

    const isAuth = !!sessionStorage.getItem('user')

    const path = window.location.pathname

    const publicRoutes = ['/', '/index.html', '/register.html']

    // Si NO está autenticado y NO está en ruta pública

    if (!isAuth && !publicRoutes.includes(path)) {

        alert('Please Log In First')

        window.location.href = '/'

        return

    }

    // Si YA está autenticado y está en login/register

    if (isAuth && publicRoutes.includes(path)) {

        window.location.href = '/dashboard.html'

    }

}

validate_login()