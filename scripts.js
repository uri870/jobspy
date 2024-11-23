// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net',
    basePath: '/api'  // Added /api basePath
};

let isLoginMode = true;

function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}${API_CONFIG.basePath}`;
    return `${baseUrl}${endpoint}`;
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');
    // Updated endpoints to match server structure
    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    
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
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({
                email: email.trim(),
                password: password
            })
        });
        
        console.log('Response status:', response.status);
        
        let data;
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        if (!textResponse) {
            throw new Error('Server returned an empty response');
        }

        try {
            // Only try to parse as JSON if the response has content
            data = textResponse.trim() ? JSON.parse(textResponse) : {};
        } catch (parseError) {
            console.error('Response parsing error:', parseError);
            console.error('Raw response:', textResponse);
            throw new Error('The server returned an invalid response format. Please try again later.');
        }
        
        if (!response.ok) {
            // Handle specific HTTP status codes
            switch (response.status) {
                case 404:
                    throw new Error('The authentication service is currently unavailable. Please try again later.');
                case 401:
                    throw new Error('Invalid email or password');
                case 403:
                    throw new Error('Access denied. Please check your credentials.');
                default:
                    throw new Error(data.message || data.error || `${isLoginMode ? 'Login' : 'Registration'} failed. Please try again.`);
            }
        }
        
        // Check if we have a valid token in the response
        if (!data.token) {
            throw new Error('Authentication failed: No valid token received');
        }

        // Store the token and redirect
        localStorage.setItem('jobspyToken', data.token);
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error(`${isLoginMode ? 'Login' : 'Registration'} error:`, error);
        errorMessage.textContent = error.message || 'An unexpected error occurred. Please try again.';
        submitButton.disabled = false;
        submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
    }
}

function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    const submitButton = document.getElementById('submitButton');
    const toggleButton = document.getElementById('toggleAuth');
    
    submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
    toggleButton.textContent = isLoginMode ? 'Create Account' : 'Back to Login';
    document.getElementById('errorMessage').textContent = '';
    document.getElementById('authForm').reset(); // Clear form when switching modes
}

// Add event listeners once DOM is loaded
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
