class CartItem {
    constructor(id, userId, productId, product, quantity, createdAt = null) {
        this.id = id;
        this.userId = userId;
        this.productId = productId;
        this.product = product;
        this.quantity = quantity;
        this.createdAt = createdAt || new Date();
    }

    static create(userId, productId, product, quantity = 1) {
        if (!userId || userId < 1) {
            throw new Error('ID de usuario inválido');
        }

        if (!productId || productId < 1) {
            throw new Error('ID de producto inválido');
        }

        if (!product) {
            throw new Error('Información del producto es requerida');
        }

        if (!quantity || quantity < 1) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        if (quantity > 99) {
            throw new Error('La cantidad no puede exceder 99 unidades');
        }

        return new CartItem(null, userId, productId, product, quantity);
    }

    updateQuantity(newQuantity) {
        if (!newQuantity || newQuantity < 1) {
            throw new Error('La cantidad debe ser mayor a 0');
        }

        if (newQuantity > 99) {
            throw new Error('La cantidad no puede exceder 99 unidades');
        }

        this.quantity = newQuantity;
        return this;
    }

    getSubtotal() {
        return this.product.price * this.quantity;
    }

    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            productId: this.productId,
            product: this.product.toJSON ? this.product.toJSON() : this.product,
            quantity: this.quantity,
            subtotal: this.getSubtotal(),
            formattedSubtotal: `$${this.getSubtotal().toFixed(2)}`,
            createdAt: this.createdAt
        };
    }
}

class Cart {
    constructor(userId, items = []) {
        this.userId = userId;
        this.items = items;
    }

    static create(userId) {
        if (!userId || userId < 1) {
            throw new Error('ID de usuario inválido');
        }

        return new Cart(userId, []);
    }

    addItem(cartItem) {
        // Verificar si el producto ya existe en el carrito
        const existingItemIndex = this.items.findIndex(
            item => item.productId === cartItem.productId
        );

        if (existingItemIndex >= 0) {
            // Si existe, actualizar cantidad
            const existingItem = this.items[existingItemIndex];
            const newQuantity = existingItem.quantity + cartItem.quantity;
            
            if (newQuantity > 99) {
                throw new Error('La cantidad total no puede exceder 99 unidades');
            }
            
            existingItem.updateQuantity(newQuantity);
        } else {
            // Si no existe, agregar nuevo item
            this.items.push(cartItem);
        }

        return this;
    }

    removeItem(productId) {
        const itemIndex = this.items.findIndex(item => item.productId === productId);
        
        if (itemIndex === -1) {
            throw new Error('Producto no encontrado en el carrito');
        }

        this.items.splice(itemIndex, 1);
        return this;
    }

    updateItemQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.productId === productId);
        
        if (!item) {
            throw new Error('Producto no encontrado en el carrito');
        }

        item.updateQuantity(newQuantity);
        return this;
    }

    clear() {
        this.items = [];
        return this;
    }

    getTotal() {
        return this.items.reduce((total, item) => total + item.getSubtotal(), 0);
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    isEmpty() {
        return this.items.length === 0;
    }

    hasProduct(productId) {
        return this.items.some(item => item.productId === productId);
    }

    getProductQuantity(productId) {
        const item = this.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
    }

    toJSON() {
        return {
            userId: this.userId,
            items: this.items.map(item => item.toJSON()),
            totalItems: this.getTotalItems(),
            total: this.getTotal(),
            formattedTotal: `$${this.getTotal().toFixed(2)}`,
            isEmpty: this.isEmpty()
        };
    }
}

module.exports = { Cart, CartItem };

