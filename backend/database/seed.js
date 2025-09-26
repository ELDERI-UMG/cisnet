const connection = require('./mysql-connection');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
    try {
        // Limpiar datos existentes
        await connection.promise().query('DELETE FROM cart');
        await connection.promise().query('DELETE FROM products');
        await connection.promise().query('DELETE FROM users');
        
        // Crear usuario de prueba
        const hashedPassword = await bcrypt.hash('123456', 10);
        await connection.promise().query(`
            INSERT INTO users (name, email, password) 
            VALUES (?, ?, ?)
        `, ['Usuario Demo', 'demo@example.com', hashedPassword]);

        // Insertar productos de software
        const products = [
            {
                name: 'Microsoft Office 365',
                description: 'Suite completa de productividad con Word, Excel, PowerPoint y más',
                price: 99.99,
                category: 'Productividad',
                version: '2024',
                compatibility: 'Windows, macOS',
                image_url: '/images/office365.jpg'
            },
            {
                name: 'Adobe Photoshop',
                description: 'Editor de imágenes profesional líder en la industria',
                price: 239.88,
                category: 'Diseño',
                version: '2024',
                compatibility: 'Windows, macOS',
                image_url: '/images/photoshop.jpg'
            },
            {
                name: 'Visual Studio Code',
                description: 'Editor de código fuente gratuito y potente',
                price: 0.00,
                category: 'Desarrollo',
                version: '1.85',
                compatibility: 'Windows, macOS, Linux',
                image_url: '/images/vscode.jpg'
            },
            {
                name: 'Windows 11 Pro',
                description: 'Sistema operativo Windows más reciente para profesionales',
                price: 199.99,
                category: 'Sistema Operativo',
                version: '23H2',
                compatibility: 'PC compatible',
                image_url: '/images/windows11.jpg'
            },
            {
                name: 'AutoCAD 2024',
                description: 'Software de diseño asistido por computadora para arquitectura e ingeniería',
                price: 1690.00,
                category: 'Diseño',
                version: '2024',
                compatibility: 'Windows, macOS',
                image_url: '/images/autocad.jpg'
            },
            {
                name: 'Minecraft Java Edition',
                description: 'Juego de construcción y aventura en mundo abierto',
                price: 26.95,
                category: 'Juegos',
                version: '1.20.4',
                compatibility: 'Windows, macOS, Linux',
                image_url: '/images/minecraft.jpg'
            },
            {
                name: 'Norton 360 Deluxe',
                description: 'Protección antivirus completa para múltiples dispositivos',
                price: 49.99,
                category: 'Seguridad',
                version: '2024',
                compatibility: 'Windows, macOS, Android, iOS',
                image_url: '/images/norton360.jpg'
            },
            {
                name: 'Zoom Pro',
                description: 'Plataforma de videoconferencias profesional',
                price: 149.90,
                category: 'Comunicación',
                version: '5.17',
                compatibility: 'Windows, macOS, Linux, móviles',
                image_url: '/images/zoom.jpg'
            },
            {
                name: 'Adobe Creative Suite',
                description: 'Colección completa de herramientas creativas de Adobe',
                price: 599.88,
                category: 'Diseño',
                version: '2024',
                compatibility: 'Windows, macOS',
                image_url: '/images/creative-suite.jpg'
            },
            {
                name: 'IntelliJ IDEA Ultimate',
                description: 'IDE avanzado para desarrollo Java y otros lenguajes',
                price: 499.00,
                category: 'Desarrollo',
                version: '2023.3',
                compatibility: 'Windows, macOS, Linux',
                image_url: '/images/intellij.jpg'
            },
            {
                name: 'Spotify Premium',
                description: 'Servicio de streaming de música sin anuncios',
                price: 9.99,
                category: 'Entretenimiento',
                version: 'Suscripción',
                compatibility: 'Multiplataforma',
                image_url: '/images/spotify.jpg'
            },
            {
                name: 'VMware Workstation Pro',
                description: 'Software de virtualización para ejecutar múltiples sistemas operativos',
                price: 249.99,
                category: 'Utilidades',
                version: '17.0',
                compatibility: 'Windows, Linux',
                image_url: '/images/vmware.jpg'
            }
        ];

        for (const product of products) {
            await connection.promise().query(`
                INSERT INTO products (name, description, price, category, image_url)
                VALUES (?, ?, ?, ?, ?)
            `, [
                product.name,
                product.description,
                product.price,
                product.category,
                product.image_url
            ]);
        }

        console.log('✅ Base de datos poblada exitosamente');
        console.log(`📊 Insertados ${products.length} productos de software`);
        console.log('👤 Usuario demo creado: demo@example.com / 123456');
        
    } catch (error) {
        console.error('❌ Error poblando la base de datos:', error);
        process.exit(1);
    } finally {
        connection.end();
    }
}

// Ejecutar seed si se llama directamente
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };

