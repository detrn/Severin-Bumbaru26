const form = document.getElementById('form')
const firstname_input = document.getElementById('firstname_input')
const email_input = document.getElementById('email_input')
const password_input = document.getElementById('password_input')
const repeat_password_input = document.getElementById('repeat_password_input')  // ✅ underscore
const error_msg = document.getElementById('error-message')                      // ✅ liniuță

form.addEventListener('submit', async (e) => {
    let errors = []

    if (firstname_input) {
        errors = getSignupFormErrors(
            firstname_input.value,
            email_input.value,
            password_input.value,
            repeat_password_input.value
        )
    } else {
        errors = getLoginFormErrors(email_input.value, password_input.value)
    }

    if (errors.length > 0) {
        e.preventDefault()
        error_msg.innerText = errors.join('. ')
        return;
    }
    try {
        const response = await fetch('/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                firstName: firstname_input.value,
                email: email_input.value,
                password: password_input.value
            })
        })
        const data = await response.json()
        error_msg.innerText = data.message
    } catch (error) {
        error_msg.innerText = 'Something went wrong.'
    }

})

function getSignupFormErrors(firstname, email, password, repeat_password) {
    let errors = []

    if (firstname === '' || firstname == null) {
        errors.push('First name is required')
        firstname_input.parentElement.classList.add('incorrect')
    }
    if (email === '' || email == null) {
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null) {
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    if(password.length < 8){
        errors.push('Password must be at least 8 characters')
        password_input.parentElement.classList.add('incorrect')

    }
    if(password!=repeat_password){
        errors.push('Password does not match')
        repeat_password_input.parentElement.classList.add('incorrect')

    }

    return errors
}
const AllInputs = [firstname_input, email_input, password_input, repeat_password_input].filter(input => input != null)
AllInputs.forEach(input => {
    input.addEventListener('change', (e) => {
        if(input.parentElement.classList.contains('incorrect')){
            input.parentElement.classList.remove('incorrect')
            error_msg.innerText = ''

        }
    })
})

function getLoginFormErrors(email, password) {
    let errors = []

    if (email === '' || email == null) {
        errors.push('Email is required')
        email_input.parentElement.classList.add('incorrect')
    }
    if (password === '' || password == null) {
        errors.push('Password is required')
        password_input.parentElement.classList.add('incorrect')
    }
    return errors

}