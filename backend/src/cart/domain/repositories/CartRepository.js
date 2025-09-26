/**
 * Interfaz del repositorio de carrito (Puerto)
 * Define los contratos que deben implementar los adaptadores de persistencia
 */
class CartRepository {
    /**
     * Obtiene el carrito de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<Cart>} Carrito del usuario
     */
    async getByUserId(userId) {
        throw new Error('Método getByUserId debe ser implementado');
    }

    /**
     * Agrega un item al carrito
     * @param {CartItem} cartItem - Item a agregar
     * @returns {Promise<CartItem>} Item agregado con ID asignado
     */
    async addItem(cartItem) {
        throw new Error('Método addItem debe ser implementado');
    }

    /**
     * Actualiza la cantidad de un item en el carrito
     * @param {number} itemId - ID del item
     * @param {number} newQuantity - Nueva cantidad
     * @returns {Promise<CartItem>} Item actualizado
     */
    async updateItemQuantity(itemId, newQuantity) {
        throw new Error('Método updateItemQuantity debe ser implementado');
    }

    /**
     * Elimina un item del carrito
     * @param {number} itemId - ID del item a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async removeItem(itemId) {
        throw new Error('Método removeItem debe ser implementado');
    }

    /**
     * Elimina un item del carrito por usuario y producto
     * @param {number} userId - ID del usuario
     * @param {number} productId - ID del producto
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async removeItemByUserAndProduct(userId, productId) {
        throw new Error('Método removeItemByUserAndProduct debe ser implementado');
    }

    /**
     * Limpia todo el carrito de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<boolean>} True si se limpió correctamente
     */
    async clearCart(userId) {
        throw new Error('Método clearCart debe ser implementado');
    }

    /**
     * Busca un item específico en el carrito
     * @param {number} userId - ID del usuario
     * @param {number} productId - ID del producto
     * @returns {Promise<CartItem|null>} Item encontrado o null
     */
    async findItem(userId, productId) {
        throw new Error('Método findItem debe ser implementado');
    }

    /**
     * Busca un item por su ID
     * @param {number} itemId - ID del item
     * @returns {Promise<CartItem|null>} Item encontrado o null
     */
    async findItemById(itemId) {
        throw new Error('Método findItemById debe ser implementado');
    }

    /**
     * Obtiene el total de items en el carrito de un usuario
     * @param {number} userId - ID del usuario
     * @returns {Promise<number>} Cantidad total de items
     */
    async getTotalItems(userId) {
        throw new Error('Método getTotalItems debe ser implementado');
    }
}

module.exports = CartRepository;

