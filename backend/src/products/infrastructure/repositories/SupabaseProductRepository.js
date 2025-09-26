const supabaseClient = require('../../../shared/infrastructure/database/SupabaseClient');

class SupabaseProductRepository {
    async findAll() {
        try {
            const { data, error } = await supabaseClient.select('products', '*');

            if (error) {
                throw new Error(`Error obteniendo productos: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            throw new Error('Error obteniendo productos');
        }
    }

    async findById(id) {
        try {
            const { data, error } = await supabaseClient.select('products', '*', { id });

            if (error) {
                throw new Error(`Error obteniendo producto: ${error.message}`);
            }

            return data && data[0] ? data[0] : null;
        } catch (error) {
            throw new Error('Error obteniendo producto por ID');
        }
    }

    async findByCategory(category) {
        try {
            const { data, error } = await supabaseClient.select('products', '*', { category });

            if (error) {
                throw new Error(`Error obteniendo productos por categoría: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            throw new Error('Error obteniendo productos por categoría');
        }
    }

    async search(searchTerm) {
        try {
            const client = supabaseClient.getClient();
            const { data, error } = await client
                .from('products')
                .select('*')
                .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);

            if (error) {
                throw new Error(`Error buscando productos: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            throw new Error('Error buscando productos');
        }
    }

    async save(product) {
        try {
            const productData = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image_url: product.image_url,
                download_url: product.download_url,
                file_size: product.file_size,
                version: product.version,
                requirements: product.requirements,
                featured: product.featured || false,
                active: product.active !== false,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.insert('products', productData);

            if (error) {
                throw new Error(`Error guardando producto: ${error.message}`);
            }

            return data[0];
        } catch (error) {
            throw new Error('Error guardando producto');
        }
    }

    async update(id, product) {
        try {
            const updateData = {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image_url: product.image_url,
                download_url: product.download_url,
                file_size: product.file_size,
                version: product.version,
                requirements: product.requirements,
                featured: product.featured,
                active: product.active,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.update('products', id, updateData);

            if (error) {
                throw new Error(`Error actualizando producto: ${error.message}`);
            }

            return data[0];
        } catch (error) {
            throw new Error('Error actualizando producto');
        }
    }

    async delete(id) {
        try {
            const { data, error } = await supabaseClient.delete('products', id);

            if (error) {
                throw new Error(`Error eliminando producto: ${error.message}`);
            }

            return true;
        } catch (error) {
            throw new Error('Error eliminando producto');
        }
    }

    async getFeatured() {
        try {
            const { data, error } = await supabaseClient.select('products', '*', {
                featured: true,
                active: true
            });

            if (error) {
                throw new Error(`Error obteniendo productos destacados: ${error.message}`);
            }

            return data || [];
        } catch (error) {
            throw new Error('Error obteniendo productos destacados');
        }
    }
}

module.exports = SupabaseProductRepository;