const supabaseClient = require('../../../shared/infrastructure/database/SupabaseClient');

class SupabaseCartRepository {
    async findByUserId(userId) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .select(`
                    *,
                    products (
                        id,
                        name,
                        description,
                        price,
                        category,
                        image_url,
                        download_url
                    )
                `)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error obteniendo carrito: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            throw new Error('Error obteniendo carrito del usuario');
        }
    }

    async addItem(userId, productId, quantity = 1) {
        try {
            // Verificar si el item ya existe
            const { data: existingItem, error: searchError } = await supabaseClient.select(
                'cart_items',
                '*',
                { user_id: userId, product_id: productId }
            );

            if (searchError) {
                throw new Error(`Error verificando item: ${searchError.message}`);
            }

            if (existingItem && existingItem.length > 0) {
                // Actualizar cantidad
                const newQuantity = existingItem[0].quantity + quantity;
                const { data, error } = await supabaseClient.update(
                    'cart_items',
                    existingItem[0].id,
                    {
                        quantity: newQuantity,
                        updated_at: new Date().toISOString()
                    }
                );

                if (error) {
                    throw new Error(`Error actualizando cantidad: ${error.message}`);
                }

                return data[0];
            } else {
                // Crear nuevo item
                const cartData = {
                    user_id: userId,
                    product_id: productId,
                    quantity: quantity,
                    created_at: new Date().toISOString()
                };

                const { data, error } = await supabaseClient.insert('cart_items', cartData);

                if (error) {
                    throw new Error(`Error agregando al carrito: ${error.message}`);
                }

                return data[0];
            }
        } catch (error) {
            throw new Error('Error agregando producto al carrito');
        }
    }

    async updateQuantity(userId, productId, quantity) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .update({
                    quantity: quantity,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .eq('product_id', productId)
                .select();

            if (error) {
                throw new Error(`Error actualizando cantidad: ${error.message}`);
            }

            return data[0];
        } catch (error) {
            throw new Error('Error actualizando cantidad en carrito');
        }
    }

    async removeItem(userId, productId) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .delete()
                .eq('user_id', userId)
                .eq('product_id', productId);

            if (error) {
                throw new Error(`Error eliminando del carrito: ${error.message}`);
            }

            return true;
        } catch (error) {
            throw new Error('Error eliminando producto del carrito');
        }
    }

    async clearCart(userId) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .delete()
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error limpiando carrito: ${error.message}`);
            }

            return true;
        } catch (error) {
            throw new Error('Error limpiando carrito');
        }
    }

    async getCartTotal(userId) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .select(`
                    quantity,
                    products!inner (
                        price
                    )
                `)
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error calculando total: ${error.message}`);
            }

            const total = data.reduce((sum, item) => {
                return sum + (item.quantity * item.products.price);
            }, 0);

            return total;
        } catch (error) {
            throw new Error('Error calculando total del carrito');
        }
    }

    async getCartItemCount(userId) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('cart_items')
                .select('quantity')
                .eq('user_id', userId);

            if (error) {
                throw new Error(`Error contando items: ${error.message}`);
            }

            const count = data.reduce((sum, item) => sum + item.quantity, 0);
            return count;
        } catch (error) {
            throw new Error('Error contando items del carrito');
        }
    }
}

module.exports = SupabaseCartRepository;