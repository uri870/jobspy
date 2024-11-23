// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net',
    basePath: ''
};

// Track whether we're in login or registration mode
let isLoginMode = true;

function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    return `${baseUrl}${endpoint}`;
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.getElementById('submitButton');
    const endpoint = isLoginMode ? '/login' : '/register';
    
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
                email,
                password
            })
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        const textResponse = await response.text();
        console.log('Raw response:', textResponse);
        
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid server response format');
        }
        
        if (!response.ok) {
            throw new Error(data.message || `${isLoginMode ? 'Login' : 'Registration'} failed`);
        }
        
        localStorage.setItem('jobspyToken', data.token);
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error(`${isLoginMode ? 'Login' : 'Registration'} error:`, error);
        errorMessage.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
    }
}

// Handle toggling between login and registration modes
function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    const submitButton = document.getElementById('submitButton');
    const toggleButton = document.getElementById('toggleAuth');
    
    submitButton.textContent = isLoginMode ? 'Login' : 'Create Account';
    toggleButton.textContent = isLoginMode ? 'Create Account' : 'Back to Login';
    document.getElementById('errorMessage').textContent = '';
}

// Add event listeners once DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('toggleAuth').addEventListener('click', toggleAuthMode);
});
