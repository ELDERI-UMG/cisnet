class Cart {
    constructor(user) {
        this.user = user;
        this.items = [];
        this.total = 0;
    }

    async getCart() {
        try {
            // Use localStorage for all users (authenticated and guest)
            const cartKey = this.user && this.user.isAuthenticated() ? `cart_${this.user.id}` : 'guest_cart';
            const localCart = JSON.parse(localStorage.getItem(cartKey) || '{"items": [], "total": 0}');

            this.items = localCart.items || [];
            this.total = parseFloat(localCart.total) || 0;

            console.log(`📦 Cart loaded: ${this.items.length} items, total: $${this.total}`);
            return { success: true, data: { items: this.items, total: this.total } };
        } catch (error) {
            console.error('Error loading cart:', error);
            this.items = [];
            this.total = 0;
            return { success: true, data: { items: [], total: 0 } };
        }
    }

    async addItem(productId, quantity = 1) {
        try {
            // First, get product info from API
            const productResponse = await fetch(`${window.API_CONFIG.baseUrl}/api/products/${productId}`);
            if (!productResponse.ok) {
                return { success: false, error: 'Producto no encontrado' };
            }
            const productData = await productResponse.json();
            const product = productData.data;

            // Use localStorage for all users (authenticated and guest)
            const cartKey = this.user && this.user.isAuthenticated() ? `cart_${this.user.id}` : 'guest_cart';
            const localCart = JSON.parse(localStorage.getItem(cartKey) || '{"items": [], "total": 0}');

            // Find if product already exists
            const existingItem = localCart.items.find(item => item.product_id == productId);

            if (existingItem) {
                // Prevent adding duplicate products - only allow one instance of each product
                return {
                    success: false,
                    error: 'Este producto ya está en el carrito. Solo se puede agregar una vez cada producto.'
                };
            } else {
                // Add new item with real product info
                const newItem = {
                    id: Date.now(), // temporary ID
                    product_id: String(productId),
                    quantity: quantity,
                    price: product.price,
                    name: product.name
                };
                localCart.items.push(newItem);
            }

            // Recalculate total
            localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            // Save to localStorage
            localStorage.setItem(cartKey, JSON.stringify(localCart));

            // Update instance
            this.items = localCart.items;
            this.total = localCart.total;

            console.log(`✅ Added product ${productId} to cart. Total items: ${this.items.length}`);
            return { success: true, data: { items: this.items, total: this.total } };

        } catch (error) {
            console.error('Error adding item to cart:', error);
            return { success: false, error: 'Error al agregar producto al carrito' };
        }
    }

    async updateItem(itemId, quantity) {
        try {
            // Use localStorage for all users
            const cartKey = this.user && this.user.isAuthenticated() ? `cart_${this.user.id}` : 'guest_cart';
            const localCart = JSON.parse(localStorage.getItem(cartKey) || '{"items": [], "total": 0}');
            const item = localCart.items.find(item => item.id == itemId);

            if (item) {
                item.quantity = quantity;
                localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                localStorage.setItem(cartKey, JSON.stringify(localCart));

                this.items = localCart.items;
                this.total = localCart.total;

                console.log(`📝 Updated item ${itemId} quantity to ${quantity}`);
                return { success: true, data: { items: this.items, total: this.total } };
            } else {
                return { success: false, error: 'Item no encontrado' };
            }
        } catch (error) {
            console.error('Error updating item in cart:', error);
            return { success: false, error: 'Error al actualizar item' };
        }
    }

    async removeItem(itemId) {
        try {
            // Use localStorage for all users
            const cartKey = this.user && this.user.isAuthenticated() ? `cart_${this.user.id}` : 'guest_cart';
            const localCart = JSON.parse(localStorage.getItem(cartKey) || '{"items": [], "total": 0}');

            localCart.items = localCart.items.filter(item => item.id != itemId);
            localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            localStorage.setItem(cartKey, JSON.stringify(localCart));

            this.items = localCart.items;
            this.total = localCart.total;

            console.log(`🗑️ Removed item ${itemId} from cart. Remaining items: ${this.items.length}`);
            return { success: true, data: { items: this.items, total: this.total } };
        } catch (error) {
            console.error('Error removing item from cart:', error);
            return { success: false, error: 'Error al remover item' };
        }
    }

    async clearCart() {
        try {
            // Use localStorage for all users
            const cartKey = this.user && this.user.isAuthenticated() ? `cart_${this.user.id}` : 'guest_cart';
            localStorage.setItem(cartKey, '{"items": [], "total": 0}');

            this.items = [];
            this.total = 0;

            console.log('🧹 Cart cleared successfully');
            return { success: true, data: { items: [], total: 0 } };
        } catch (error) {
            console.error('Error clearing cart:', error);
            return { success: false, error: 'Error al limpiar carrito' };
        }
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
}