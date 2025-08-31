// Demo user credentials with auto role detection
const DEMO_USERS = {
    // Admin user
    'admin@parentconnect.com': {
        password: 'admin123',
        role: 'admin',
        name: 'System Administrator',
        dashboard: 'admin-dashboard.html'
    },
    // Teacher user
    'teacher@parentconnect.com': {
        password: 'teacher123',
        role: 'teacher',
        name: 'John Smith',
        dashboard: 'teacher-dashboard.html'
    },
    // Parent user
    'parent@parentconnect.com': {
        password: 'parent123',
        role: 'parent',
        name: 'Sarah Johnson',
        dashboard: 'parent-dashboard.html'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        const userData = JSON.parse(currentUser);
        redirectToDashboard(userData.role);
    }

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    // Handle enter key press
    loginForm.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLogin();
        }
    });
});

function handleLogin() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    const loginBtn = document.getElementById('loginBtn');
    const originalBtnContent = loginBtn.innerHTML;

    // Clear previous errors
    hideError();

    // Validate inputs
    if (!email || !password) {
        showError('Please fill in all required fields');
        return;
    }

    // Email validation
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }

    // Show loading state
    loginBtn.innerHTML = '<i class="fas fa-spinner spinner"></i> Signing In...';
    loginBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        try {
            // Auto-detect user role based on email
            const user = DEMO_USERS[email];
            
            if (!user) {
                showError('Invalid email or password');
                resetButton(loginBtn, originalBtnContent);
                return;
            }

            if (user.password !== password) {
                showError('Invalid email or password');
                resetButton(loginBtn, originalBtnContent);
                return;
            }

            // Successful login with auto-detected role
            const userData = {
                email: email,
                name: user.name,
                role: user.role,
                dashboard: user.dashboard,
                loginTime: new Date().toISOString()
            };

            // Store user data
            if (remember) {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(userData));
            }

            // Show success message with detected role
            showSuccess(`Login successful as ${user.role}! Redirecting...`);

            // Redirect to dashboard
            setTimeout(() => {
                redirectToDashboard(user.role);
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            showError('Something went wrong. Please try again.');
            resetButton(loginBtn, originalBtnContent);
        }
    }, 1500); // Simulate network delay
}

function redirectToDashboard(role) {
    const dashboards = {
        'admin': 'admin-dashboard.html',
        'teacher': 'teacher-dashboard.html',
        'parent': 'parent-dashboard.html'
    };

    const dashboardUrl = dashboards[role];
    if (dashboardUrl) {
        window.location.href = dashboardUrl;
    } else {
        showError('Invalid user role');
    }
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showSuccess(message) {
    const errorMessage = document.getElementById('errorMessage');
    
    errorMessage.className = 'alert alert-success';
    errorMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    errorMessage.style.display = 'flex';
    
    // Add success styles
    errorMessage.style.cssText += `
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: #6ee7b7;
        display: flex;
    `;
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.style.display = 'none';
    errorMessage.className = 'alert alert-error'; // Reset to error class
}

function resetButton(button, originalContent) {
    button.innerHTML = originalContent;
    button.disabled = false;
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}