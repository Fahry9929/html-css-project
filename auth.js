// Authentication handling
const auth = {
    token: null,
    user: null,

    init() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    },

    async checkAuth() {
        this.init();
        const token = localStorage.getItem('token');
        
        if (!token) {
            this.updateUI();
            return false;
        }

        try {
            const response = await api.get('/api/auth/verify', token);
            this.user = response.user;
            localStorage.setItem('user', JSON.stringify(this.user));
            this.updateUI();
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.token = null;
            this.user = null;
            this.updateUI();
            return false;
        }
    },

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            const response = await api.post('/api/auth/login', { email, password });
            this.token = response.token;
            this.user = response.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            errorMessage.textContent = '';
            window.location.href = '/';
        } catch (error) {
            errorMessage.textContent = error.message || 'Login failed';
        }
    },

    async handleRegister(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('errorMessage');

        try {
            const response = await api.post('/api/auth/register', { name, email, password });
            this.token = response.token;
            this.user = response.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
            errorMessage.textContent = '';
            window.location.href = '/';
        } catch (error) {
            errorMessage.textContent = error.message || 'Registration failed';
        }
    },

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        this.updateUI();
        window.location.href = '/';
    },

    updateUI() {
        const loginLink = document.getElementById('loginLink');
        const registerLink = document.getElementById('registerLink');
        const logoutLink = document.getElementById('logoutLink');
        const userName = document.getElementById('userName');

        if (this.user) {
            if (loginLink) loginLink.style.display = 'none';
            if (registerLink) registerLink.style.display = 'none';
            if (logoutLink) logoutLink.style.display = 'inline';
            if (userName) {
                userName.textContent = `Hello, ${this.user.name}`;
                userName.style.display = 'inline';
            }
        } else {
            if (loginLink) loginLink.style.display = 'inline';
            if (registerLink) registerLink.style.display = 'inline';
            if (logoutLink) logoutLink.style.display = 'none';
            if (userName) userName.style.display = 'none';
        }
    },

    getToken() {
        return localStorage.getItem('token');
    }
};

// Initialize auth on load
auth.init();

