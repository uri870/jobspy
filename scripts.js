// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net'
};

let isLoginMode = true;

function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    return `${baseUrl}/${endpoint}`;
}

async function handleAuth(event) {
    if (event) {
        event.preventDefault();
    }
    
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');

    if (!email || !password) {
        errorMessage.textContent = 'Please enter both email and password';
        return;
    }
    
    const endpoint = isLoginMode ? 'login.py' : 'register.py';
    
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = isLoginMode ? 'Logging in...' : 'Creating Account...';
    
    try {
        const url = getApiUrl(endpoint);
        console.log('Sending request to:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                email: email.trim(),
                password: password
            })
        });
        
        console.log('Response status:', response.status);
        
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('Response parsing error:', parseError);
            throw new Error('Server response was not in the expected format');
        }
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Authentication failed');
        }
        
        if (data.token) {
            localStorage.setItem('jobspyToken', data.token);
            window.location.href = '/dashboard.html';
        } else {
            throw new Error('No authentication token received');
        }
        
    } catch (error) {
        console.error(`${isLoginMode ? 'Login' : 'Registration'} error:`, error);
        errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again.';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
    }
}

function toggleAuthMode(e) {
    if (e) {
        e.preventDefault();
    }
    
    isLoginMode = !isLoginMode;
    const submitButton = document.getElementById('submitButton');
    const toggleButton = document.getElementById('toggleAuth');
    
    if (submitButton && toggleButton) {
        submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
        toggleButton.textContent = isLoginMode ? 'Create Account' : 'Back to Login';
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = '';
        }
        const authForm = document.getElementById('authForm');
        if (authForm) {
            authForm.reset();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    
    if (authForm && toggleAuth) {
        authForm.addEventListener('submit', handleAuth);
        toggleAuth.addEventListener('click', toggleAuthMode);
    } else {
        console.error('Required DOM elements not found');
    }
});
