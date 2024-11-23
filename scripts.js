async function handleRegister(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.querySelector('button[type="submit"]');
    
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';
    
    try {
        const response = await fetch('https://snowboard.sytes.net/register.py', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        // Log response for debugging
        console.log('Response status:', response.status);
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            throw new Error('Invalid server response');
        }
        
        if (data.status === 'error') {
            throw new Error(data.message);
        }
        
        // Store token and redirect
        localStorage.setItem('jobspyToken', data.token);
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = 'Create Account';
    }
}
