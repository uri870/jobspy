// Place this code at the beginning of dashboard.js
function verifyAuth() {
    const token = localStorage.getItem('jobspyToken');
    
    if (!token) {
        // No token found, redirect to login
        window.location.href = 'index.html';
        return;
    }

    // Verify token validity with the server
    async function validateToken() {
        try {
            const response = await fetch(`${API_CONFIG.protocol}://${API_CONFIG.host}/verify-token.py`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });

            const data = await response.json();
            
            if (!response.ok || data.status === 'error') {
                // Token is invalid or expired
                localStorage.removeItem('jobspyToken');
                window.location.href = 'index.html';
                return;
            }
            
            // Token is valid, continue loading dashboard
            return true;
            
        } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('jobspyToken');
            window.location.href = 'index.html';
            return;
        }
    }

    // Initialize dashboard only after token verification
    validateToken().then(isValid => {
        if (isValid) {
            initializeDashboard(); // Your existing dashboard initialization function
        }
    });
}

// Add event listener to run verification when dashboard loads
document.addEventListener('DOMContentLoaded', verifyAuth);

// Add this to handle logout
function logout() {
    localStorage.removeItem('jobspyToken');
    window.location.href = 'index.html';
}
