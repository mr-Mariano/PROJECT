document.addEventListener('DOMContentLoaded', async () => {
    initialize_sidebar_navigation()

    await load_user_profile()

    bind_profile_form()
    bind_password_modal()
    bind_delete_account()
    bind_logout()
})

async function load_user_profile() {
    try {
        const data = await get_me()
        const user = data.user

        document.getElementById('profileName').value = user.name || ''
        document.getElementById('profileEmail').value = user.email || ''

    } catch (err) {
        alert('Error loading profile')
    }
}

function bind_profile_form() {
    const form = document.getElementById('profileForm')

    form?.addEventListener('submit', async (e) => {
        e.preventDefault()

        const name = document.getElementById('profileName').value.trim()
        const email = document.getElementById('profileEmail').value.trim()

        try {
            await update_user({ name, email })
            alert('Profile updated successfully')
        } catch (err) {
            alert(err.message || 'Error updating profile')
        }
    })
}

function bind_password_modal() {
    document.getElementById('openUpdatePasswordBtn')
        ?.addEventListener('click', () => {
            document.getElementById('updatePasswordForm').reset()
            open_modal('updatePasswordModal')
        })

    document.getElementById('updatePasswordForm')
        ?.addEventListener('submit', async (e) => {
            e.preventDefault()

            const formData = new FormData(e.target)
            const password = formData.get('newPassword')
            const confirmPassword = formData.get('confirmPassword')

            if (!password || !confirmPassword) {
                alert('Please fill in all fields')
                return
            }

            if (password !== confirmPassword) {
                alert('Passwords do not match')
                return
            }

            try {
                await update_user({ password })
                close_modal('updatePasswordModal')
                e.target.reset()
                alert('Password updated successfully')
            } catch (err) {
                alert(err.message || 'Error updating password')
            }
        })
}

function bind_delete_account() {
    document.getElementById('openDeleteAccountBtn')
        ?.addEventListener('click', () => {
            open_modal('deleteAccountModal')
        })

    document.getElementById('confirmDeleteAccountBtn')
        ?.addEventListener('click', async () => {
            try {
                await delete_user()

                sessionStorage.removeItem('token')
                window.location.href = 'index.html'
            } catch (err) {
                alert(err.message || 'Error deleting account')
            }
        })
}

function bind_logout() {
    document.getElementById('logoutBtn')
        ?.addEventListener('click', () => {
            sessionStorage.removeItem('token')
            window.location.href = 'index.html'
        })
}