const ProductRepository = require('../../domain/repositories/ProductRepository');
const Product = require('../../domain/entities/Product');
const Database = require('../../../shared/infrastructure/database/Database');

class SqliteProductRepository extends ProductRepository {
    constructor() {
        super();
    }

    async save(product) {
        try {
            const result = await Database.run(`
                INSERT INTO products (name, description, price, category, version, compatibility, image_url, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                product.name,
                product.description,
                product.price,
                product.category,
                product.version,
                product.compatibility,
                product.imageUrl,
                product.createdAt.toISOString(),
                product.updatedAt.toISOString()
            ]);

            return new Product(
                result.id,
                product.name,
                product.description,
                product.price,
                product.category,
                product.version,
                product.compatibility,
                product.imageUrl,
                product.createdAt,
                product.updatedAt
            );
        } catch (error) {
            throw error;
        }
    }

    async findById(id) {
        try {
            const row = await Database.get(`
                SELECT * FROM products WHERE id = ?
            `, [id]);

            if (!row) {
                return null;
            }

            return this.mapRowToProduct(row);
        } catch (error) {
            throw error;
        }
    }

    async findAll(page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const rows = await Database.all(`
                SELECT * FROM products
                LIMIT ? OFFSET ?
            `, [limit, offset]);

            const total = await Database.get(`
                SELECT COUNT(*) as count FROM products
            `);

            return {
                products: rows.map(row => this.mapRowToProduct(row)),
                total: total.count,
                totalPages: Math.ceil(total.count / limit),
                currentPage: page
            };
        } catch (error) {
            throw error;
        }
    }

    async search(searchTerm, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            const searchPattern = `%${searchTerm}%`;
            
            // Buscar productos
            const rows = await Database.all(`
                SELECT * FROM products 
                WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR version LIKE ? OR compatibility LIKE ?
                ORDER BY 
                    CASE 
                        WHEN name LIKE ? THEN 1
                        WHEN category LIKE ? THEN 2
                        ELSE 3
                    END,
                    created_at DESC
                LIMIT ? OFFSET ?
            `, [
                searchPattern, searchPattern, searchPattern, searchPattern, searchPattern,
                searchPattern, searchPattern,
                limit, offset
            ]);

            // Obtener total de resultados
            const countRow = await Database.get(`
                SELECT COUNT(*) as total FROM products 
                WHERE name LIKE ? OR description LIKE ? OR category LIKE ? OR version LIKE ? OR compatibility LIKE ?
            `, [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]);

            const products = rows.map(row => this.mapRowToProduct(row));
            const total = countRow.total;
            const totalPages = Math.ceil(total / limit);

            return {
                products,
                total,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                searchTerm
            };
        } catch (error) {
            throw error;
        }
    }

    async filter(filters, page = 1, limit = 20) {
        try {
            const offset = (page - 1) * limit;
            let whereConditions = [];
            let params = [];

            // Construir condiciones WHERE dinámicamente
            if (filters.category) {
                whereConditions.push('category = ?');
                params.push(filters.category);
            }

            if (filters.minPrice !== undefined) {
                whereConditions.push('price >= ?');
                params.push(filters.minPrice);
            }

            if (filters.maxPrice !== undefined) {
                whereConditions.push('price <= ?');
                params.push(filters.maxPrice);
            }

            if (filters.version) {
                whereConditions.push('version LIKE ?');
                params.push(`%${filters.version}%`);
            }

            if (filters.compatibility) {
                whereConditions.push('compatibility LIKE ?');
                params.push(`%${filters.compatibility}%`);
            }

            if (filters.isFree !== undefined) {
                if (filters.isFree) {
                    whereConditions.push('price = 0');
                } else {
                    whereConditions.push('price > 0');
                }
            }

            const whereClause = whereConditions.length > 0 
                ? `WHERE ${whereConditions.join(' AND ')}` 
                : '';

            // Obtener productos filtrados
            const rows = await Database.all(`
                SELECT * FROM products 
                ${whereClause}
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `, [...params, limit, offset]);

            // Obtener total de resultados
            const countRow = await Database.get(`
                SELECT COUNT(*) as total FROM products 
                ${whereClause}
            `, params);

            const products = rows.map(row => this.mapRowToProduct(row));
            const total = countRow.total;
            const totalPages = Math.ceil(total / limit);

            return {
                products,
                total,
                totalPages,
                currentPage: page,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
                filters
            };
        } catch (error) {
            throw error;
        }
    }

    async findByCategory(category, page = 1, limit = 20) {
        return this.filter({ category }, page, limit);
    }

    async getCategories() {
        try {
            const rows = await Database.all(`
                SELECT DISTINCT category FROM products 
                ORDER BY category ASC
            `);

            return rows.map(row => row.category);
        } catch (error) {
            throw error;
        }
    }

    async update(product) {
        try {
            await Database.run(`
                UPDATE products 
                SET name = ?, description = ?, price = ?, category = ?, version = ?, compatibility = ?, image_url = ?, updated_at = ?
                WHERE id = ?
            `, [
                product.name,
                product.description,
                product.price,
                product.category,
                product.version,
                product.compatibility,
                product.imageUrl,
                product.updatedAt.toISOString(),
                product.id
            ]);

            return product;
        } catch (error) {
            throw error;
        }
    }

    async delete(id) {
        try {
            const result = await Database.run(`
                DELETE FROM products WHERE id = ?
            `, [id]);

            return result.changes > 0;
        } catch (error) {
            throw error;
        }
    }

    async getPriceRange() {
        try {
            const row = await Database.get(`
                SELECT MIN(price) as min, MAX(price) as max FROM products
            `);

            return {
                min: row.min || 0,
                max: row.max || 0
            };
        } catch (error) {
            throw error;
        }
    }

    mapRowToProduct(row) {
        return new Product(
            row.id,
            row.name,
            row.description,
            row.price,
            row.category,
            row.version,
            row.compatibility,
            row.image_url,
            new Date(row.created_at),
            new Date(row.updated_at)
        );
    }
}

module.exports = SqliteProductRepository;

