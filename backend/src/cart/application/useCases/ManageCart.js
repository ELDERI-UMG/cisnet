const { CartItem } = require('../../domain/entities/Cart');

class ManageCart {
    constructor(cartRepository, productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    async getCart(userId) {
        try {
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            const cart = await this.cartRepository.getByUserId(userId);
            
            return {
                cart: cart.toJSON(),
                message: cart.isEmpty() 
                    ? 'El carrito está vacío' 
                    : `Carrito con ${cart.getTotalItems()} productos`
            };
        } catch (error) {
            throw error;
        }
    }

    async addItem(userId, productId, quantity = 1) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            if (!productId || productId < 1) {
                throw new Error('ID de producto inválido');
            }

            if (!quantity || quantity < 1) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            if (quantity > 99) {
                throw new Error('La cantidad no puede exceder 99 unidades');
            }

            // Verificar que el producto existe
            const product = await this.productRepository.findById(productId);
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            // Crear item del carrito
            const cartItem = CartItem.create(userId, productId, product, quantity);

            // Agregar al carrito
            const addedItem = await this.cartRepository.addItem(cartItem);

            return {
                item: addedItem.toJSON(),
                message: 'Producto agregado al carrito exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async updateItemQuantity(userId, itemId, newQuantity) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            if (!itemId || itemId < 1) {
                throw new Error('ID de item inválido');
            }

            if (!newQuantity || newQuantity < 1) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            if (newQuantity > 99) {
                throw new Error('La cantidad no puede exceder 99 unidades');
            }

            // Verificar que el item existe y pertenece al usuario
            const existingItem = await this.cartRepository.findItemById(itemId);
            if (!existingItem) {
                throw new Error('Item no encontrado en el carrito');
            }

            if (existingItem.userId !== userId) {
                throw new Error('No tienes permisos para modificar este item');
            }

            // Actualizar cantidad
            const updatedItem = await this.cartRepository.updateItemQuantity(itemId, newQuantity);

            return {
                item: updatedItem.toJSON(),
                message: 'Cantidad actualizada exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async removeItem(userId, itemId) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            if (!itemId || itemId < 1) {
                throw new Error('ID de item inválido');
            }

            // Verificar que el item existe y pertenece al usuario
            const existingItem = await this.cartRepository.findItemById(itemId);
            if (!existingItem) {
                throw new Error('Item no encontrado en el carrito');
            }

            if (existingItem.userId !== userId) {
                throw new Error('No tienes permisos para eliminar este item');
            }

            // Eliminar item
            const removed = await this.cartRepository.removeItem(itemId);

            if (!removed) {
                throw new Error('No se pudo eliminar el item del carrito');
            }

            return {
                message: 'Producto eliminado del carrito exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async removeItemByProduct(userId, productId) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            if (!productId || productId < 1) {
                throw new Error('ID de producto inválido');
            }

            // Eliminar item por producto
            const removed = await this.cartRepository.removeItemByUserAndProduct(userId, productId);

            if (!removed) {
                throw new Error('Producto no encontrado en el carrito');
            }

            return {
                message: 'Producto eliminado del carrito exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async clearCart(userId) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            // Limpiar carrito
            await this.cartRepository.clearCart(userId);

            return {
                message: 'Carrito vaciado exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async getTotalItems(userId) {
        try {
            // Validar parámetros
            if (!userId || userId < 1) {
                throw new Error('ID de usuario inválido');
            }

            const totalItems = await this.cartRepository.getTotalItems(userId);

            return {
                totalItems,
                message: `Total de productos en el carrito: ${totalItems}`
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ManageCart;

