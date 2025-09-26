class SearchProducts {
    constructor(productRepository) {
        this.productRepository = productRepository;
    }

    async execute(searchTerm, page = 1, limit = 20) {
        try {
            // Validar parámetros
            if (page < 1) {
                throw new Error('El número de página debe ser mayor a 0');
            }

            if (limit < 1 || limit > 100) {
                throw new Error('El límite debe estar entre 1 y 100');
            }

            // Si no hay término de búsqueda, obtener todos los productos
            if (!searchTerm || searchTerm.trim().length === 0) {
                return await this.productRepository.findAll(page, limit);
            }

            // Realizar búsqueda
            const result = await this.productRepository.search(searchTerm.trim(), page, limit);

            return {
                ...result,
                message: result.total > 0 
                    ? `Se encontraron ${result.total} productos` 
                    : 'No se encontraron productos que coincidan con la búsqueda'
            };
        } catch (error) {
            throw error;
        }
    }

    async executeAdvanced(filters) {
        try {
            // Validar filtros
            if (filters.page < 1) {
                throw new Error('El número de página debe ser mayor a 0');
            }

            if (filters.limit < 1 || filters.limit > 100) {
                throw new Error('El límite debe estar entre 1 y 100');
            }

            // Validar rango de precios
            if (filters.minPrice !== null && filters.maxPrice !== null && 
                filters.minPrice > filters.maxPrice) {
                throw new Error('El precio mínimo no puede ser mayor al precio máximo');
            }

            // Realizar búsqueda con filtros
            const result = await this.productRepository.filter(filters, filters.page, filters.limit);

            return {
                ...result,
                message: result.total > 0 
                    ? `Se encontraron ${result.total} productos con los filtros aplicados` 
                    : 'No se encontraron productos que coincidan con los filtros'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SearchProducts;

