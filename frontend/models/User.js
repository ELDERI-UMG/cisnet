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
        // Clear user purchases before clearing user data
        this.clearUserPurchases();

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
            const response = await fetch(`${window.API_CONFIG.baseUrl}/api/auth/login`, {
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
            const response = await fetch(`${window.API_CONFIG.baseUrl}/api/auth/register`, {
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
            const checkResponse = await fetch(`${window.API_CONFIG.baseUrl}/api/google-auth/user-by-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: googleUser.email })
            });

            const existingUser = await checkResponse.json();
            let endpoint = existingUser.success ? 'google-login' : 'google-register';

            // Login or register
            const authResponse = await fetch(`${window.API_CONFIG.baseUrl}/api/google-auth/${endpoint}`, {
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

        // Check user-specific purchased products
        const purchasedProducts = this.getPurchasedProducts();
        if (purchasedProducts.includes(String(productId))) {
            return true;
        }

        // Fallback: check with server (if API is available)
        try {
            const response = await fetch(`${window.API_CONFIG.baseUrl}/api/purchases/check-access`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();
            if (data.success === true && data.hasAccess === true) {
                // Update localStorage with this purchase
                this.addPurchase(productId);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking purchase status with server:', error);
            return false;
        }
    }

    // Get purchased products for current user
    getPurchasedProducts() {
        if (!this.isAuthenticated()) {
            return [];
        }

        try {
            const userPurchases = localStorage.getItem(`purchasedProducts_${this.id}`) || '[]';
            return JSON.parse(userPurchases);
        } catch (error) {
            console.error('Error reading purchased products from localStorage:', error);
            return [];
        }
    }

    // Add a purchase for current user
    addPurchase(productId) {
        if (!this.isAuthenticated()) {
            console.error('Cannot add purchase: user not authenticated');
            return false;
        }

        try {
            const purchasedProducts = this.getPurchasedProducts();
            const productIdStr = String(productId);

            if (!purchasedProducts.includes(productIdStr)) {
                purchasedProducts.push(productIdStr);
                localStorage.setItem(`purchasedProducts_${this.id}`, JSON.stringify(purchasedProducts));
                console.log(`✅ Added purchase for user ${this.id}, product ${productIdStr}`);

                // Also save purchase details for receipts
                this.savePurchaseDetails(productIdStr);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error adding purchase to localStorage:', error);
            return false;
        }
    }

    // Add multiple purchases (for bulk purchases)
    addPurchases(productIds) {
        if (!this.isAuthenticated()) {
            console.error('Cannot add purchases: user not authenticated');
            return false;
        }

        try {
            const purchasedProducts = this.getPurchasedProducts();
            let added = 0;

            productIds.forEach(productId => {
                const productIdStr = String(productId);
                if (!purchasedProducts.includes(productIdStr)) {
                    purchasedProducts.push(productIdStr);
                    this.savePurchaseDetails(productIdStr);
                    added++;
                }
            });

            if (added > 0) {
                localStorage.setItem(`purchasedProducts_${this.id}`, JSON.stringify(purchasedProducts));
                console.log(`✅ Added ${added} purchases for user ${this.id}`);
            }

            return added;
        } catch (error) {
            console.error('Error adding purchases to localStorage:', error);
            return 0;
        }
    }

    // Save purchase details for receipts and history
    savePurchaseDetails(productId) {
        try {
            const purchaseKey = `purchaseDetails_${this.id}`;
            const existingDetails = JSON.parse(localStorage.getItem(purchaseKey) || '{}');

            if (!existingDetails[productId]) {
                existingDetails[productId] = {
                    productId: productId,
                    purchaseDate: new Date().toISOString(),
                    userId: this.id,
                    userEmail: this.email,
                    userName: this.name
                };

                localStorage.setItem(purchaseKey, JSON.stringify(existingDetails));
                console.log(`💾 Saved purchase details for product ${productId}`);
            }
        } catch (error) {
            console.error('Error saving purchase details:', error);
        }
    }

    // Get purchase details for a specific product
    getPurchaseDetails(productId) {
        if (!this.isAuthenticated()) {
            return null;
        }

        try {
            const purchaseKey = `purchaseDetails_${this.id}`;
            const details = JSON.parse(localStorage.getItem(purchaseKey) || '{}');
            return details[String(productId)] || null;
        } catch (error) {
            console.error('Error getting purchase details:', error);
            return null;
        }
    }

    // Get all purchase history for current user
    getPurchaseHistory() {
        if (!this.isAuthenticated()) {
            return [];
        }

        try {
            const purchaseKey = `purchaseDetails_${this.id}`;
            const details = JSON.parse(localStorage.getItem(purchaseKey) || '{}');
            return Object.values(details);
        } catch (error) {
            console.error('Error getting purchase history:', error);
            return [];
        }
    }

    // Clear all user data when logging out
    clearUserPurchases() {
        if (this.id) {
            localStorage.removeItem(`purchasedProducts_${this.id}`);
            localStorage.removeItem(`purchaseDetails_${this.id}`);
            console.log(`🧹 Cleared purchase data for user ${this.id}`);
        }
    }

    // Logout
    async logout() {
        try {
            if (this.token) {
                await fetch(`${window.API_CONFIG.baseUrl}/api/auth/logout`, {
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