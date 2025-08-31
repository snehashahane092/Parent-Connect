document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            showError('Please fill in all required fields');
            return;
        }

        if (!isValidEmail(email)) {
            showError('Please enter a valid email address');
            return;
        }

        const originalBtnContent = loginBtn.innerHTML;

        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        loginBtn.disabled = true;

        // Make AJAX request to backend
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.error || 'Login failed');
                });
            }
            return response.json();
        })
        .then(data => {
            // Successful login
            const user = data.user;
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                dashboard: data.redirectUrl,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem('user', JSON.stringify(userData));
            window.location.href = data.redirectUrl;
        })
        .catch(error => {
            console.error('Login error:', error);
            showError(error.message || 'Something went wrong. Please try again.');
            resetButton(loginBtn, originalBtnContent);
        });
    });

    // Handle enter key press
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    function showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function resetButton(button, originalContent) {
        button.innerHTML = originalContent;
        button.disabled = false;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});
