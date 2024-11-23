// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net',
    basePath: ''  // Removed /api since we're calling Python files directly
};

let isLoginMode = true;

function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    return `${baseUrl}/${endpoint}`;  // Updated to include leading slash
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');
    // Updated endpoints to match your server files
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
            throw new Error('Server response was not in the expected format. Please try again.');
        }
        
        if (!response.ok) {
            throw new Error(data.message || data.error || `${isLoginMode ? 'Login' : 'Registration'} failed. Please try again.`);
        }
        
        // Check for success flag or token in response
        if (data.success === false || (!data.token && !data.success)) {
            throw new Error(data.message || 'Authentication failed');
        }

        // If we have a token, store it
        if (data.token) {
            localStorage.setItem('jobspyToken', data.token);
        }
        
        // Redirect to dashboard on success
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
