class GetProducts {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async getAll(page = 1, limit = 20) {
        try {
            if (page < 1) {
                throw new Error('El número de página debe ser mayor a 0');
            }

            if (limit < 1 || limit > 100) {
                throw new Error('El límite debe estar entre 1 y 100');
            }

            const result = await this.productRepository.findAll(page, limit);

            return {
                products: result.products,
                total: result.total,
                totalPages: result.totalPages,
                currentPage: result.currentPage,
                message: `Se encontraron ${result.total} productos en total`
            };
        } catch (error) {
            throw error;
        }
    }

    async getById(id) {
        try {
            // Validar ID
            if (!id || isNaN(id) || id < 1) {
                throw new Error('ID de producto inválido');
            }

            const product = await this.productRepository.findById(parseInt(id));

            if (!product) {
                throw new Error('Producto no encontrado');
            }

            return {
                product: product.toJSON(),
                message: 'Producto encontrado exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async getByCategory(category, page = 1, limit = 20) {
        try {
            // Validar parámetros
            if (!category || category.trim().length === 0) {
                throw new Error('La categoría es requerida');
            }

            if (page < 1) {
                throw new Error('El número de página debe ser mayor a 0');
            }

            if (limit < 1 || limit > 100) {
                throw new Error('El límite debe estar entre 1 y 100');
            }

            const result = await this.productRepository.findByCategory(category.trim(), page, limit);

            return {
                ...result,
                message: result.total > 0 
                    ? `Se encontraron ${result.total} productos en la categoría "${category}"` 
                    : `No se encontraron productos en la categoría "${category}"`
            };
        } catch (error) {
            throw error;
        }
    }

    async getCategories() {
        try {
            const categories = await this.productRepository.getCategories();
            
            return {
                categories,
                total: categories.length,
                message: `Se encontraron ${categories.length} categorías disponibles`
            };
        } catch (error) {
            throw error;
        }
    }

    async getPriceRange() {
        try {
            const priceRange = await this.productRepository.getPriceRange();
            
            return {
                priceRange,
                message: 'Rango de precios obtenido exitosamente'
            };
        } catch (error) {
            throw error;
        }
    }

    async getFeatured(limit = 6) {
        try {
            // Obtener productos destacados (los más recientes por ahora)
            const result = await this.productRepository.findAll(1, limit);
            
            return {
                products: result.products.map(p => p.toJSON()),
                total: result.products.length,
                message: `Se encontraron ${result.products.length} productos destacados`
            };
        } catch (error) {
            throw error;
        }
    }

    async getRecommended(userId = null, limit = 6) {
        try {
            // Por ahora, retornar productos aleatorios como recomendaciones
            // En un sistema real, esto sería basado en el historial del usuario
            const result = await this.productRepository.findAll(1, limit);
            
            return {
                products: result.products.map(p => p.toJSON()),
                total: result.products.length,
                message: `Se encontraron ${result.products.length} productos recomendados`
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = GetProducts;

