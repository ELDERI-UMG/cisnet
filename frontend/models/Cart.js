class Cart {
    constructor(user) {
        this.user = user;
        this.items = [];
        this.total = 0;
    }

    async getCart() {
        // If user is authenticated, use server cart
        if (this.user && this.user.isAuthenticated && this.user.isAuthenticated()) {
            try {
                const response = await fetch('http://localhost:3000/api/cart', {
                    headers: {
                        'Authorization': `Bearer ${this.user.token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.items = data.data.items || [];
                    this.total = parseFloat(data.data.total) || 0;
                    return { success: true, data: data.data };
                } else {
                    return { success: false, error: data.error || 'Error al obtener carrito' };
                }
            } catch (error) {
                return { success: false, error: 'Error de conexión' };
            }
        } else {
            // For non-authenticated users, use localStorage
            try {
                const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items": [], "total": 0}');
                this.items = localCart.items || [];
                this.total = parseFloat(localCart.total) || 0;
                return { success: true, data: { items: this.items, total: this.total } };
            } catch (error) {
                console.error('Error loading guest cart:', error);
                this.items = [];
                this.total = 0;
                return { success: true, data: { items: [], total: 0 } };
            }
        }
    }

    async addItem(productId, quantity = 1) {
        // If user is authenticated, use server cart
        if (this.user && this.user.isAuthenticated && this.user.isAuthenticated()) {
            try {
                const response = await fetch('http://localhost:3000/api/cart/items', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.user.token}`
                    },
                    body: JSON.stringify({ productId, quantity })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await this.getCart(); // Actualizar carrito
                    return { success: true, data };
                } else {
                    return { success: false, error: data.error || 'Error al agregar item' };
                }
            } catch (error) {
                return { success: false, error: 'Error de conexión' };
            }
        } else {
            // For non-authenticated users, use localStorage
            try {
                // Get current cart
                const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items": [], "total": 0}');

                // Find if product already exists
                const existingItem = localCart.items.find(item => item.product_id == productId);

                if (existingItem) {
                    // Prevent adding duplicate products - only allow one instance of each product
                    return {
                        success: false,
                        error: 'Este producto ya está en el carrito. Solo se puede agregar una vez cada producto.'
                    };
                } else {
                    // Add new item (with basic info)
                    localCart.items.push({
                        id: Date.now(), // temporary ID
                        product_id: productId,
                        quantity: quantity,
                        price: 99.99, // Default price - could be fetched from server
                        product_name: `Producto ${productId}`
                    });
                }

                // Recalculate total
                localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                // Save to localStorage
                localStorage.setItem('guest_cart', JSON.stringify(localCart));

                // Update instance
                this.items = localCart.items;
                this.total = localCart.total;

                console.log(`✅ Added product ${productId} to guest cart. Total items: ${this.items.length}`);
                return { success: true, data: { items: this.items, total: this.total } };
            } catch (error) {
                console.error('Error adding item to guest cart:', error);
                return { success: false, error: 'Error al agregar producto al carrito' };
            }
        }
    }

    async updateItem(itemId, quantity) {
        if (this.user && this.user.isAuthenticated && this.user.isAuthenticated()) {
            try {
                const response = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.user.token}`
                    },
                    body: JSON.stringify({ quantity })
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await this.getCart(); // Actualizar carrito
                    return { success: true, data };
                } else {
                    return { success: false, error: data.error || 'Error al actualizar item' };
                }
            } catch (error) {
                return { success: false, error: 'Error de conexión' };
            }
        } else {
            // For guest users, update localStorage
            try {
                const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items": [], "total": 0}');
                const item = localCart.items.find(item => item.id == itemId);

                if (item) {
                    item.quantity = quantity;
                    localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                    localStorage.setItem('guest_cart', JSON.stringify(localCart));

                    this.items = localCart.items;
                    this.total = localCart.total;
                    return { success: true, data: { items: this.items, total: this.total } };
                } else {
                    return { success: false, error: 'Item no encontrado' };
                }
            } catch (error) {
                return { success: false, error: 'Error al actualizar item' };
            }
        }
    }

    async removeItem(itemId) {
        if (this.user && this.user.isAuthenticated && this.user.isAuthenticated()) {
            try {
                const response = await fetch(`http://localhost:3000/api/cart/items/${itemId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.user.token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    await this.getCart(); // Actualizar carrito
                    return { success: true, data };
                } else {
                    return { success: false, error: data.error || 'Error al remover item' };
                }
            } catch (error) {
                return { success: false, error: 'Error de conexión' };
            }
        } else {
            // For guest users, remove from localStorage
            try {
                const localCart = JSON.parse(localStorage.getItem('guest_cart') || '{"items": [], "total": 0}');
                localCart.items = localCart.items.filter(item => item.id != itemId);
                localCart.total = localCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
                localStorage.setItem('guest_cart', JSON.stringify(localCart));

                this.items = localCart.items;
                this.total = localCart.total;
                return { success: true, data: { items: this.items, total: this.total } };
            } catch (error) {
                return { success: false, error: 'Error al remover item' };
            }
        }
    }

    async clearCart() {
        if (this.user && this.user.isAuthenticated && this.user.isAuthenticated()) {
            try {
                const response = await fetch('http://localhost:3000/api/cart', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${this.user.token}`
                    }
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    this.items = [];
                    this.total = 0;
                    return { success: true, data };
                } else {
                    return { success: false, error: data.error || 'Error al limpiar carrito' };
                }
            } catch (error) {
                return { success: false, error: 'Error de conexión' };
            }
        } else {
            // For guest users, clear localStorage
            try {
                localStorage.setItem('guest_cart', '{"items": [], "total": 0}');
                this.items = [];
                this.total = 0;
                return { success: true, data: { items: [], total: 0 } };
            } catch (error) {
                return { success: false, error: 'Error al limpiar carrito' };
            }
        }
    }

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
}