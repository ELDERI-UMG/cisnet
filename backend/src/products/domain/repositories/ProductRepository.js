/**
 * Interfaz del repositorio de productos (Puerto)
 * Define los contratos que deben implementar los adaptadores de persistencia
 */
class ProductRepository {
    /**
     * Guarda un producto en el sistema de persistencia
     * @param {Product} product - Entidad de producto a guardar
     * @returns {Promise<Product>} Producto guardado con ID asignado
     */
    async save(product) {
        throw new Error('Método save debe ser implementado');
    }

    /**
     * Busca un producto por su ID
     * @param {number} id - ID del producto a buscar
     * @returns {Promise<Product|null>} Producto encontrado o null
     */
    async findById(id) {
        throw new Error('Método findById debe ser implementado');
    }

    /**
     * Obtiene todos los productos con paginación
     * @param {number} page - Número de página (empezando en 1)
     * @param {number} limit - Cantidad de productos por página
     * @returns {Promise<{products: Product[], total: number, totalPages: number}>}
     */
    async findAll(page = 1, limit = 20) {
        throw new Error('Método findAll debe ser implementado');
    }

    /**
     * Busca productos por término de búsqueda
     * @param {string} searchTerm - Término a buscar
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de productos por página
     * @returns {Promise<{products: Product[], total: number, totalPages: number}>}
     */
    async search(searchTerm, page = 1, limit = 20) {
        throw new Error('Método search debe ser implementado');
    }

    /**
     * Filtra productos por criterios específicos
     * @param {Object} filters - Filtros a aplicar
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de productos por página
     * @returns {Promise<{products: Product[], total: number, totalPages: number}>}
     */
    async filter(filters, page = 1, limit = 20) {
        throw new Error('Método filter debe ser implementado');
    }

    /**
     * Obtiene productos por categoría
     * @param {string} category - Categoría de productos
     * @param {number} page - Número de página
     * @param {number} limit - Cantidad de productos por página
     * @returns {Promise<{products: Product[], total: number, totalPages: number}>}
     */
    async findByCategory(category, page = 1, limit = 20) {
        throw new Error('Método findByCategory debe ser implementado');
    }

    /**
     * Obtiene todas las categorías disponibles
     * @returns {Promise<string[]>} Lista de categorías
     */
    async getCategories() {
        throw new Error('Método getCategories debe ser implementado');
    }

    /**
     * Actualiza un producto existente
     * @param {Product} product - Producto con datos actualizados
     * @returns {Promise<Product>} Producto actualizado
     */
    async update(product) {
        throw new Error('Método update debe ser implementado');
    }

    /**
     * Elimina un producto por su ID
     * @param {number} id - ID del producto a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(id) {
        throw new Error('Método delete debe ser implementado');
    }

    /**
     * Obtiene el rango de precios (mínimo y máximo)
     * @returns {Promise<{min: number, max: number}>} Rango de precios
     */
    async getPriceRange() {
        throw new Error('Método getPriceRange debe ser implementado');
    }
}

module.exports = ProductRepository;

