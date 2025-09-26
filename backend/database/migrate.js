const connection = require('./mysql-connection');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
    try {
        // Crear tabla de usuarios
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de productos
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(50) NOT NULL,
                version VARCHAR(20),
                compatibility VARCHAR(100),
                image_url VARCHAR(255),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // Crear tabla de items del carrito
        await connection.promise().query(`
            CREATE TABLE IF NOT EXISTS cart_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        `);

        // Crear índices para mejorar rendimiento
        await connection.promise().query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        await connection.promise().query(`CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`);
        await connection.promise().query(`CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)`);
        await connection.promise().query(`CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id)`);

        console.log('✅ Migraciones ejecutadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error ejecutando migraciones:', error);
        process.exit(1);
    } finally {
        connection.end();
    }
}

// Ejecutar migraciones si se llama directamente
if (require.main === module) {
    runMigrations();
}

module.exports = { runMigrations };

