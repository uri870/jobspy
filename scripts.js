// Configuration settings
const API_CONFIG = {
    protocol: 'http',
    host: 'snowboard.sytes.net',
    port: 5050,  // Default port, can be changed
    basePath: '/auth'
};

// Function to build the API URL
function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    const portString = API_CONFIG.port ? `:${API_CONFIG.port}` : '';
    return `${baseUrl}${portString}${API_CONFIG.basePath}${endpoint}`;
}

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
        const loginUrl = getApiUrl('/login');
        const response = await fetch(loginUrl, {
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
        
        // Log the error for debugging
        console.error('Login error:', error);
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

// Function to update API configuration
function updateApiConfig(config) {
    Object.assign(API_CONFIG, config);
}

// Example usage:
// updateApiConfig({
//     host: 'api.example.com',
//     port: 8080,
//     protocol: 'https'
// });
