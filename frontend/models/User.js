class User {
    constructor() {
        this.id = null;
        this.name = '';
        this.email = '';
        this.picture = '';
        this.provider = '';
        this.token = null;

        // Restore user from localStorage on initialization
        this.restoreFromStorage();
    }

    // Restore user data from localStorage
    restoreFromStorage() {
        const token = localStorage.getItem('cisnet_token');
        const userData = localStorage.getItem('cisnet_user');

        if (token && userData) {
            try {
                const user = JSON.parse(userData);
                this.id = user.id;
                this.name = user.name;
                this.email = user.email;
                this.picture = user.picture || '';
                this.provider = user.provider || '';
                this.token = token;
            } catch (error) {
                this.clearStorage();
            }
        }
    }

    // Save user data to localStorage
    saveToStorage() {
        if (this.token) {
            localStorage.setItem('cisnet_token', this.token);
            localStorage.setItem('cisnet_user', JSON.stringify({
                id: this.id,
                name: this.name,
                email: this.email,
                picture: this.picture,
                provider: this.provider
            }));
        }
    }

    // Clear user data from localStorage
    clearStorage() {
        localStorage.removeItem('cisnet_token');
        localStorage.removeItem('cisnet_user');
        localStorage.removeItem('guest_cart');
        this.id = null;
        this.name = '';
        this.email = '';
        this.picture = '';
        this.provider = '';
        this.token = null;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.token !== null && this.id !== null;
    }

    // Get user data
    getUserData() {
        if (this.isAuthenticated()) {
            return {
                id: this.id,
                name: this.name,
                email: this.email,
                picture: this.picture,
                provider: this.provider
            };
        }
        return null;
    }

    // Regular login with email/password
    async login(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                this.id = data.data.user.id;
                this.name = data.data.user.name;
                this.email = data.data.user.email;
                this.picture = '';
                this.provider = 'local';
                this.token = data.data.token;
                this.saveToStorage();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    // Register with email/password
    async register(name, email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (data.success) {
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    // Google authentication
    async authenticateWithGoogle(googleUser) {
        try {
            // Check if user exists
            const checkResponse = await fetch('http://localhost:3000/api/google-auth/user-by-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleUser.email })
            });

            const existingUser = await checkResponse.json();
            let endpoint = existingUser.success ? 'google-login' : 'google-register';

            // Login or register
            const authResponse = await fetch(`http://localhost:3000/api/google-auth/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleUser)
            });

            const data = await authResponse.json();

            if (data.success) {
                this.id = data.data.user.id;
                this.name = data.data.user.name;
                this.email = data.data.user.email;
                this.picture = data.data.user.picture || googleUser.picture || '';
                this.provider = 'google';
                this.token = data.data.token;
                this.saveToStorage();
                return { success: true };
            } else {
                return { success: false, error: data.error };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión con el servidor' };
        }
    }

    // Check if user has purchased a product
    async hasPurchased(productId) {
        if (!this.isAuthenticated()) {
            return false;
        }

        try {
            const response = await fetch('http://localhost:3000/api/purchases/check-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();
            return data.success === true && data.hasAccess === true;
        } catch (error) {
            return false;
        }
    }

    // Logout
    async logout() {
        try {
            if (this.token) {
                await fetch('http://localhost:3000/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
            }
        } catch (error) {
        } finally {
            this.clearStorage();
        }
    }
}