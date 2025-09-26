const bcrypt = require('bcryptjs');
const Database = require('../../../shared/infrastructure/database/Database');

class MySqlUserRepository {
    async findByEmail(email) {
        try {
            const [rows] = await Database.run('SELECT * FROM users WHERE email = ?', [email]);
            const user = rows[0];
            if (user) {
                return {
                    ...user,
                    name: user.username  // Map username to name for compatibility
                };
            }
            return null;
        } catch (error) {
            throw new Error('Error buscando usuario por email');
        }
    }

    async findById(id) {
        try {
            const [rows] = await Database.run('SELECT * FROM users WHERE id = ?', [id]);
            const user = rows[0];
            if (user) {
                return {
                    ...user,
                    name: user.username  // Map username to name for compatibility
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
            const [result] = await Database.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [user.name, user.email, hashedPassword]
            );
            
            return {
                id: result.insertId,
                name: user.name,
                email: user.email,
                created_at: new Date()
            };
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('El email ya está registrado');
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
            await Database.run(
                'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [hashedPassword, userId]
            );
            return true;
        } catch (error) {
            throw new Error('Error actualizando contraseña');
        }
    }
}

module.exports = MySqlUserRepository;