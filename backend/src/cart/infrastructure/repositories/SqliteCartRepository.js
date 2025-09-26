const CartRepository = require('../../domain/repositories/CartRepository');
const { Cart, CartItem } = require('../../domain/entities/Cart');
const Product = require('../../../products/domain/entities/Product');
const Database = require('../../../shared/infrastructure/database/Database');

class SqliteCartRepository extends CartRepository {
    constructor() {
        super();
    }

    async getByUserId(userId) {
        try {
            const rows = await Database.all(`
                SELECT 
                    ci.*,
                    p.name as product_name,
                    p.description as product_description,
                    p.price as product_price,
                    p.category as product_category,
                    p.version as product_version,
                    p.compatibility as product_compatibility,
                    p.image_url as product_image_url,
                    p.created_at as product_created_at,
                    p.updated_at as product_updated_at
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ?
                ORDER BY ci.created_at DESC
            `, [userId]);

            const cart = Cart.create(userId);
            
            for (const row of rows) {
                const product = new Product(
                    row.product_id,
                    row.product_name,
                    row.product_description,
                    row.product_price,
                    row.product_category,
                    row.product_version,
                    row.product_compatibility,
                    row.product_image_url,
                    new Date(row.product_created_at),
                    new Date(row.product_updated_at)
                );

                const cartItem = new CartItem(
                    row.id,
                    row.user_id,
                    row.product_id,
                    product,
                    row.quantity,
                    new Date(row.created_at)
                );

                cart.items.push(cartItem);
            }

            return cart;
        } catch (error) {
            throw error;
        }
    }

    async addItem(cartItem) {
        try {
            // Verificar si el item ya existe
            const existingItem = await this.findItem(cartItem.userId, cartItem.productId);
            
            if (existingItem) {
                // Si existe, actualizar cantidad
                const newQuantity = existingItem.quantity + cartItem.quantity;
                return await this.updateItemQuantity(existingItem.id, newQuantity);
            } else {
                // Si no existe, crear nuevo item
                const result = await Database.run(`
                    INSERT INTO cart_items (user_id, product_id, quantity, created_at)
                    VALUES (?, ?, ?, ?)
                `, [
                    cartItem.userId,
                    cartItem.productId,
                    cartItem.quantity,
                    cartItem.createdAt.toISOString()
                ]);

                return new CartItem(
                    result.id,
                    cartItem.userId,
                    cartItem.productId,
                    cartItem.product,
                    cartItem.quantity,
                    cartItem.createdAt
                );
            }
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('El producto ya está en el carrito');
            }
            throw error;
        }
    }

    async updateItemQuantity(itemId, newQuantity) {
        try {
            // Validar nueva cantidad
            if (newQuantity < 1) {
                throw new Error('La cantidad debe ser mayor a 0');
            }

            if (newQuantity > 99) {
                throw new Error('La cantidad no puede exceder 99 unidades');
            }

            await Database.run(`
                UPDATE cart_items 
                SET quantity = ?
                WHERE id = ?
            `, [newQuantity, itemId]);

            // Obtener el item actualizado
            const updatedItem = await this.findItemById(itemId);
            if (!updatedItem) {
                throw new Error('Item no encontrado después de la actualización');
            }

            return updatedItem;
        } catch (error) {
            throw error;
        }
    }

    async removeItem(itemId) {
        try {
            const result = await Database.run(`
                DELETE FROM cart_items WHERE id = ?
            `, [itemId]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    async removeItemByUserAndProduct(userId, productId) {
        try {
            const result = await Database.run(`
                DELETE FROM cart_items 
                WHERE user_id = ? AND product_id = ?
            `, [userId, productId]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    async clearCart(userId) {
        try {
            const result = await Database.run(`
                DELETE FROM cart_items WHERE user_id = ?
            `, [userId]);

            return result.changes >= 0; // Puede ser 0 si el carrito ya estaba vacío
        } catch (error) {
            throw error;
        }
    }

    async findItem(userId, productId) {
        try {
            const row = await Database.get(`
                SELECT 
                    ci.*,
                    p.name as product_name,
                    p.description as product_description,
                    p.price as product_price,
                    p.category as product_category,
                    p.version as product_version,
                    p.compatibility as product_compatibility,
                    p.image_url as product_image_url,
                    p.created_at as product_created_at,
                    p.updated_at as product_updated_at
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.user_id = ? AND ci.product_id = ?
            `, [userId, productId]);

            if (!row) {
                return null;
            }

            return this.mapRowToCartItem(row);
        } catch (error) {
            throw error;
        }
    }

    async findItemById(itemId) {
        try {
            const row = await Database.get(`
                SELECT 
                    ci.*,
                    p.name as product_name,
                    p.description as product_description,
                    p.price as product_price,
                    p.category as product_category,
                    p.version as product_version,
                    p.compatibility as product_compatibility,
                    p.image_url as product_image_url,
                    p.created_at as product_created_at,
                    p.updated_at as product_updated_at
                FROM cart_items ci
                JOIN products p ON ci.product_id = p.id
                WHERE ci.id = ?
            `, [itemId]);

            if (!row) {
                return null;
            }

            return this.mapRowToCartItem(row);
        } catch (error) {
            throw error;
        }
    }

    async getTotalItems(userId) {
        try {
            const row = await Database.get(`
                SELECT SUM(quantity) as total FROM cart_items WHERE user_id = ?
            `, [userId]);

            return row.total || 0;
        } catch (error) {
            throw error;
        }
    }

    mapRowToCartItem(row) {
        const product = new Product(
            row.product_id,
            row.product_name,
            row.product_description,
            row.product_price,
            row.product_category,
            row.product_version,
            row.product_compatibility,
            row.product_image_url,
            new Date(row.product_created_at),
            new Date(row.product_updated_at)
        );

        return new CartItem(
            row.id,
            row.user_id,
            row.product_id,
            product,
            row.quantity,
            new Date(row.created_at)
        );
    }
}

module.exports = SqliteCartRepository;

