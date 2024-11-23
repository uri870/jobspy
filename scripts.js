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

async function handleLogin(event) {
    event.preventDefault();
    await handleAuth('login.py');
}

async function handleRegister(event) {
    event.preventDefault();
    await handleAuth('register.py');
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
        
        const data = await response.json();
        
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

// Add input validation
document.getElementById('email').addEventListener('input', function(e) {
    const email = e.target.value;
    const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    
    if (!emailRegex.test(email)) {
        e.target.setCustomValidity('Please enter a valid email address');
    } else {
        e.target.setCustomValidity('');
    }
});

document.getElementById('password').addEventListener('input', function(e) {
    const password = e.target.value;
    let message = '';
    
    if (password.length < 8) {
        message += 'Password must be at least 8 characters long\n';
    }
    if (!/[A-Z]/.test(password)) {
        message += 'Password must contain at least one uppercase letter\n';
    }
    if (!/[a-z]/.test(password)) {
        message += 'Password must contain at least one lowercase letter\n';
    }
    if (!/\d/.test(password)) {
        message += 'Password must contain at least one number';
    }
    
    e.target.setCustomValidity(message);
});

// Update the create account button click handler
document.querySelector('.create-account').addEventListener('click', function(e) {
    e.preventDefault();
    const form = document.getElementById('loginForm');
    const submitButton = form.querySelector('button[type="submit"]');
    const title = document.querySelector('.logo h1');
    
    if (form.getAttribute('data-mode') === 'register') {
        // Switch to login mode
        form.setAttribute('data-mode', 'login');
        submitButton.textContent = 'Login';
        title.textContent = 'JobSpy - Login';
        this.textContent = 'Create Account';
        form.onsubmit = handleLogin;
    } else {
        // Switch to register mode
        form.setAttribute('data-mode', 'register');
        submitButton.textContent = 'Create Account';
        title.textContent = 'JobSpy - Register';
        this.textContent = 'Back to Login';
        form.onsubmit = handleRegister;
    }
});
