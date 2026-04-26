// Elements
const register_form = document.getElementById('register-form')

// Event Listeners
register_form.addEventListener('submit', register)

// Logic
async function register(e){
    e.preventDefault()

    const data = new FormData(e.target)
    const name = data.get('name')
    const email = data.get('email')
    const password = data.get('password')

    try{
        const res = await fetch('/users/register', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({ name, email, password })
        })

        if(!res.ok){ alert('Something in Name, Email or Password is incorrect') }

        const data = await res.json()
        sessionStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = BASE_URI + 'dashboard.html'

    }catch(err){
        console.error(err)
    }
}


