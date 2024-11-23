async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.querySelector('button[type="submit"]');
    
    // Reset error message
    errorMessage.textContent = '';
    
    // Disable submit button and show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
        const response = await fetch('https://api.jobspy.com/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        // Store the token in localStorage
        localStorage.setItem('jobspyToken', data.token);
        
        // Redirect to dashboard
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        // Display error message
        errorMessage.textContent = error.message || 'An error occurred during login';
        
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
    
    return false;
}

// Add input validation
document.getElementById('email').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
        e.target.setCustomValidity('Please enter a valid email address');
    } else {
        e.target.setCustomValidity('');
    }
});

document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    
    if (password.length < 6) {
        e.target.setCustomValidity('Password must be at least 6 characters long');
    } else {
        e.target.setCustomValidity('');
    }
});
