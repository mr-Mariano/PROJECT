// Elements
const login_form = document.getElementById('login-form')

// Event Listeners
login_form.addEventListener('submit', login)

// Logic
async function login(e){

    e.preventDefault()

    const form_data = new FormData(e.target)
    const email = form_data.get('email')
    const password = form_data.get('password')

    try{
        const res = await fetch('/api/users/login', {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({email, password})
        })

        if(!res.ok) { alert('Password and/or Email Incorrect') }

        const data = await res.json()
        sessionStorage.setItem('user', JSON.stringify(data.user))
        window.location.href = BASE_URI + 'dashboard.html'

    }catch(err){
        console.error(err)
        alert('Something Went Wrong')
    }
}



