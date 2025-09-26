const bcrypt = require('bcryptjs');
const supabaseClient = require('../../../shared/infrastructure/database/SupabaseClient');

class SupabaseUserRepository {
    async findByEmail(email) {
        try {
            const { data, error } = await supabaseClient.select('users', '*', { email });

            if (error) {
                throw new Error(`Error buscando usuario: ${error.message}`);
            }

            const user = data && data[0];
            if (user) {
                return {
                    ...user,
                    name: user.username || user.name  // Compatibility
                };
            }
            return null;
        } catch (error) {
            throw new Error('Error buscando usuario por email');
        }
    }

    async findById(id) {
        try {
            const { data, error } = await supabaseClient.select('users', '*', { id });

            if (error) {
                throw new Error(`Error buscando usuario: ${error.message}`);
            }

            const user = data && data[0];
            if (user) {
                return {
                    ...user,
                    name: user.username || user.name  // Compatibility
                };
            }
            return null;
        } catch (error) {
            throw new Error('Error buscando usuario por ID');
        }
    }

    async save(user) {
        try {
            const hashedPassword = await bcrypt.hash(user.password, 10);

            const userData = {
                username: user.name,
                email: user.email,
                password: hashedPassword,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.insert('users', userData);

            if (error) {
                if (error.code === '23505') { // Unique constraint violation
                    throw new Error('El email ya está registrado');
                }
                throw new Error(`Error guardando usuario: ${error.message}`);
            }

            const savedUser = data[0];
            return {
                id: savedUser.id,
                name: savedUser.username,
                email: savedUser.email,
                created_at: savedUser.created_at
            };
        } catch (error) {
            if (error.message.includes('ya está registrado')) {
                throw error;
            }
            throw new Error('Error guardando usuario');
        }
    }

    async verifyPassword(plainPassword, hashedPassword) {
        console.log("DEBUG verifyPassword - plainPassword:", typeof plainPassword, plainPassword);
        console.log("DEBUG verifyPassword - hashedPassword:", typeof hashedPassword, hashedPassword);
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const updateData = {
                password: hashedPassword,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.update('users', userId, updateData);

            if (error) {
                throw new Error(`Error actualizando contraseña: ${error.message}`);
            }

            return true;
        } catch (error) {
            throw new Error('Error actualizando contraseña');
        }
    }

    // Método para crear usuario con Google OAuth
    async saveGoogleUser(googleUser) {
        try {
            const userData = {
                username: googleUser.name,
                email: googleUser.email,
                google_id: googleUser.id,
                profile_picture: googleUser.picture,
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabaseClient.insert('users', userData);

            if (error) {
                if (error.code === '23505') {
                    // Usuario ya existe, obtenerlo
                    return await this.findByEmail(googleUser.email);
                }
                throw new Error(`Error guardando usuario de Google: ${error.message}`);
            }

            const savedUser = data[0];
            return {
                id: savedUser.id,
                name: savedUser.username,
                email: savedUser.email,
                google_id: savedUser.google_id,
                profile_picture: savedUser.profile_picture,
                created_at: savedUser.created_at
            };
        } catch (error) {
            throw new Error('Error guardando usuario de Google');
        }
    }
}

module.exports = SupabaseUserRepository;