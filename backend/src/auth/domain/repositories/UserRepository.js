/**
 * Interfaz del repositorio de usuarios (Puerto)
 * Define los contratos que deben implementar los adaptadores de persistencia
 */
class UserRepository {
    /**
     * Guarda un usuario en el sistema de persistencia
     * @param {User} user - Entidad de usuario a guardar
     * @returns {Promise<User>} Usuario guardado con ID asignado
     */
    async save(user) {
        throw new Error('Método save debe ser implementado');
    }

    /**
     * Busca un usuario por su email
     * @param {string} email - Email del usuario a buscar
     * @returns {Promise<User|null>} Usuario encontrado o null
     */
    async findByEmail(email) {
        throw new Error('Método findByEmail debe ser implementado');
    }

    /**
     * Busca un usuario por su ID
     * @param {number} id - ID del usuario a buscar
     * @returns {Promise<User|null>} Usuario encontrado o null
     */
    async findById(id) {
        throw new Error('Método findById debe ser implementado');
    }

    /**
     * Actualiza un usuario existente
     * @param {User} user - Usuario con datos actualizados
     * @returns {Promise<User>} Usuario actualizado
     */
    async update(user) {
        throw new Error('Método update debe ser implementado');
    }

    /**
     * Elimina un usuario por su ID
     * @param {number} id - ID del usuario a eliminar
     * @returns {Promise<boolean>} True si se eliminó correctamente
     */
    async delete(id) {
        throw new Error('Método delete debe ser implementado');
    }

    /**
     * Verifica si existe un usuario con el email dado
     * @param {string} email - Email a verificar
     * @returns {Promise<boolean>} True si existe el email
     */
    async existsByEmail(email) {
        throw new Error('Método existsByEmail debe ser implementado');
    }
}

module.exports = UserRepository;

