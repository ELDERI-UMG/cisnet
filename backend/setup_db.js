const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
    try {
        console.log('🔧 Configurando base de datos...');
        
        // Conectar directamente a la base de datos
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cisnetpos'
        });

        // Crear base de datos si no existe (conectar sin database primero)
        const tempConnection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
        });
        await tempConnection.execute('CREATE DATABASE IF NOT EXISTS cisnetpos');
        await tempConnection.end();
        console.log('✅ Base de datos cisnetpos creada/verificada');

        // Crear tabla users
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla users creada/verificada');

        // Verificar si el usuario admin ya existe
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['eddy@cisnet.com']
        );

        if (existingUsers.length === 0) {
            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash('123456', 10);
            
            // Insertar usuario admin
            await connection.execute(
                'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
                ['Eddy Alexander', 'eddy@cisnet.com', hashedPassword]
            );
            console.log('✅ Usuario administrador creado: eddy@cisnet.com / 123456');
        } else {
            console.log('ℹ️  Usuario administrador ya existe');
        }

        // Crear tabla products
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL,
                category VARCHAR(100),
                image_url VARCHAR(255),
                stock INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla products creada/verificada');

        // Insertar productos de ejemplo
        const [existingProducts] = await connection.execute('SELECT COUNT(*) as count FROM products');
        if (existingProducts[0].count === 0) {
            await connection.execute(`
                INSERT INTO products (name, description, price, category, stock) VALUES
                ('Sistema de Facturación', 'Software completo de facturación electrónica', 299.99, 'Software', 10),
                ('Sistema POS', 'Punto de venta integrado', 199.99, 'Software', 15),
                ('Sistema de Inventarios', 'Control de stock y almacén', 149.99, 'Software', 8)
            `);
            console.log('✅ Productos de ejemplo insertados');
        }

        // Crear tabla cart
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_product (user_id, product_id)
            )
        `);
        console.log('✅ Tabla cart creada/verificada');

        await connection.end();
        console.log('🎉 Base de datos configurada correctamente!');

    } catch (error) {
        console.error('❌ Error configurando la base de datos:', error);
        process.exit(1);
    }
}

setupDatabase();