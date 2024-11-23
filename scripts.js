// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net',
    basePath: ''  // The script will be in the root directory
};

// Function to build the API URL
function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    return `${baseUrl}${endpoint}`;
}

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.querySelector('button[type="submit"]');
    
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    
    try {
        const loginUrl = getApiUrl('/login.py');  // Make sure this matches your file name
        
        const response = await fetch(loginUrl, {
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
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }
        
        localStorage.setItem('jobspyToken', data.token);
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = `Login failed: ${error.message}`;
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}
