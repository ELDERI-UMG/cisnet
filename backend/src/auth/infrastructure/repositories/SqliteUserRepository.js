const UserRepository = require('../../domain/repositories/UserRepository');
const User = require('../../domain/entities/User');
const Database = require('../../../shared/infrastructure/database/Database');
const bcrypt = require('bcryptjs');

class SqliteUserRepository extends UserRepository {
    constructor() {
        super();
    }

    async save(user) {
        try {
            // Hash de la contraseña si es un nuevo usuario
            let passwordHash = user.passwordHash;
            if (!passwordHash) {
                // Si no tiene hash, significa que es una contraseña en texto plano
                passwordHash = await bcrypt.hash(user.password || '123456', 10);
            }

            const result = await Database.run(`
                INSERT INTO users (name, email, password_hash, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?)
            `, [
                user.name,
                user.getEmailValue(),
                passwordHash,
                user.createdAt.toISOString(),
                user.updatedAt.toISOString()
            ]);

            // Retornar el usuario con el ID asignado
            return new User(
                result.id,
                user.name,
                user.getEmailValue(),
                passwordHash,
                user.createdAt,
                user.updatedAt
            );
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Ya existe un usuario con este email');
            }
            throw error;
        }
    }

    async findByEmail(email) {
        try {
            const row = await Database.get(`
                SELECT * FROM users WHERE email = ?
            `, [email.toLowerCase()]);

            if (!row) {
                return null;
            }

            return new User(
                row.id,
                row.name,
                row.email,
                row.password_hash,
                new Date(row.created_at),
                new Date(row.updated_at)
            );
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const row = await Database.get(`
                SELECT * FROM users WHERE id = ?
            `, [id]);

            if (!row) {
                return null;
            }

            return new User(
                row.id,
                row.name,
                row.email,
                row.password_hash,
                new Date(row.created_at),
                new Date(row.updated_at)
            );
        } catch (error) {
            throw error;
        }
    }

    async update(user) {
        try {
            await Database.run(`
                UPDATE users 
                SET name = ?, email = ?, updated_at = ?
                WHERE id = ?
            `, [
                user.name,
                user.getEmailValue(),
                user.updatedAt.toISOString(),
                user.id
            ]);

            return user;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('Ya existe un usuario con este email');
            }
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Database.run(`
                DELETE FROM users WHERE id = ?
            `, [id]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    async existsByEmail(email) {
        try {
            const row = await Database.get(`
                SELECT COUNT(*) as count FROM users WHERE email = ?
            `, [email.toLowerCase()]);

            return row.count > 0;
        } catch (error) {
            throw error;
        }
    }

    async verifyPassword(user, plainPassword) {
        try {
            return await bcrypt.compare(plainPassword, user.passwordHash);
        } catch (error) {
            throw error;
        }
    }

    async updatePassword(userId, newPassword) {
        try {
            const passwordHash = await bcrypt.hash(newPassword, 10);
            
            await Database.run(`
                UPDATE users 
                SET password_hash = ?, updated_at = ?
                WHERE id = ?
            `, [
                passwordHash,
                new Date().toISOString(),
                userId
            ]);

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = SqliteUserRepository;

