// Configuration settings
const API_CONFIG = {
    protocol: 'https',
    host: 'snowboard.sytes.net',
    basePath: ''
};

function getApiUrl(endpoint) {
    const baseUrl = `${API_CONFIG.protocol}://${API_CONFIG.host}`;
    return `${baseUrl}${endpoint}`;
}

async function handleAuth(endpoint) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = document.querySelector('button[type="submit"]');
    const isRegistration = endpoint === 'register.py';
    
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.textContent = isRegistration ? 'Creating Account...' : 'Logging in...';
    
    try {
        const url = getApiUrl(`/${endpoint}`);
        console.log('Sending request to:', url); // Debug log
        
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
        
        // Debug log
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries([...response.headers]));
        
        let data;
        const textResponse = await response.text(); // Get raw response text
        console.log('Raw response:', textResponse); // Debug log
        
        try {
            data = JSON.parse(textResponse);
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid server response format');
        }
        
        if (!response.ok) {
            throw new Error(data.message || `${isRegistration ? 'Registration' : 'Login'} failed`);
        }
        
        localStorage.setItem('jobspyToken', data.token);
        window.location.href = '/dashboard.html';
        
    } catch (error) {
        console.error(`${isRegistration ? 'Registration' : 'Login'} error:`, error);
        errorMessage.textContent = error.message;
        submitButton.disabled = false;
        submitButton.textContent = isRegistration ? 'Create Account' : 'Login';
    }
}
