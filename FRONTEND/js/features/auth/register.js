// Elements
const register_form = document.getElementById('register-form')

// Event Listeners
register_form.addEventListener('submit', register)

// Logic
async function register(e){
    e.preventDefault()

    const form_data = new FormData(e.target)
    const name = form_data.get('name')
    const email = form_data.get('email')
    const password = form_data.get('password')

    if (!email || !password || !name) {
        alert('Email,password and Name are required')
        return
    }

    try{
        const res = await fetch('/register', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({ name, email, password })
        })
        const responseData = await res.json()
        if(!res.ok){
            alert(responseData.message || 'Error creating user')
            return
        }

        sessionStorage.setItem('token', responseData.token)
        window.location.href = BASE_URI + 'dashboard.html'

    }catch(err){
        console.error(err)
    }
}


