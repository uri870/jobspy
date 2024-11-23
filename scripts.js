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
    
    const endpoint = isLoginMode ? 'login.php' : 'register.py';  // Note: Using .php for login
    
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = isLoginMode ? 'Logging in...' : 'Creating Account...';
    
    try {
        const url = getApiUrl(endpoint);
        
        // Create form data instead of JSON
        const formData = new FormData();
        formData.append('email', email.trim());
        formData.append('password', password);

        const response = await fetch(url, {
            method: 'POST',
            // Don't set Content-Type header - let browser set it with boundary for FormData
            credentials: 'include',
            body: formData
        });
        
        // If the response is a redirect, follow it
        if (response.redirected) {
            window.location.href = response.url;
            return;
        }

        const textResponse = await response.text();
        let data;
        
        try {
            // Only try to parse if it looks like JSON
            if (textResponse.trim().startsWith('{') || textResponse.trim().startsWith('[')) {
                data = JSON.parse(textResponse);
            } else {
                // Handle non-JSON responses
                if (textResponse.includes('success') || textResponse.includes('logged in')) {
                    // Successful login/register with non-JSON response
                    window.location.href = '/dashboard.html';
                    return;
                }
                throw new Error('Invalid response format');
            }
        } catch (parseError) {
            console.error('Response parsing error:', parseError);
            console.error('Raw response:', textResponse);
            
            // If the response contains HTML, it might be a redirect or error page
            if (textResponse.includes('<!DOCTYPE html>') || textResponse.includes('<html>')) {
                if (textResponse.toLowerCase().includes('success') || textResponse.toLowerCase().includes('welcome')) {
                    window.location.href = '/dashboard.html';
                    return;
                }
            }
            
            throw new Error('Server response was not in the expected format');
        }
        
        if (!response.ok) {
            throw new Error(data?.message || data?.error || `${isLoginMode ? 'Login' : 'Registration'} failed`);
        }
        
        // Handle successful JSON response
        if (data.success || data.token) {
            if (data.token) {
                localStorage.setItem('jobspyToken', data.token);
            }
            window.location.href = '/dashboard.html';
        } else {
            throw new Error(data.message || 'Authentication failed');
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

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const toggleAuth = document.getElementById('toggleAuth');
    
    if (authForm && toggleAuth) {
        authForm.addEventListener('submit', handleAuth);
        toggleAuth.addEventListener('click', toggleAuthMode);
    } else {
        console.error('Required DOM elements not found. Please check your HTML structure.');
    }
});
