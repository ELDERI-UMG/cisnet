const mysql = require('./backend/node_modules/mysql2/promise');

async function checkPermissions() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cisnetpos'
        });

        console.log('🔍 Verificando permisos en la base de datos...');

        // Verificar permisos recientes para el usuario demo (id 7)
        const [perms] = await conn.execute(`
            SELECT * FROM user_drive_permissions
            WHERE user_id = 7
            ORDER BY granted_at DESC
            LIMIT 10
        `);

        console.log(`📋 Encontrados ${perms.length} permisos para user_id 7:`);

        if (perms.length === 0) {
            console.log('❌ No hay permisos en la base de datos');
        } else {
            perms.forEach((p, index) => {
                console.log(`${index + 1}. Producto ${p.product_id}: ${p.google_file_id} (${p.status}) - ${p.granted_at}`);
            });
        }

        // Verificar órdenes recientes
        const [orders] = await conn.execute(`
            SELECT * FROM orders
            WHERE user_id = 7
            ORDER BY created_at DESC
            LIMIT 5
        `);

        console.log(`\n📦 Órdenes recientes para user_id 7: ${orders.length}`);
        orders.forEach((o, index) => {
            console.log(`${index + 1}. Order ${o.id}: productos ${o.product_ids} - $${o.total_amount} (${o.payment_status}) - ${o.created_at}`);
        });

        // Verificar archivos en la tabla google_drive_files
        console.log('\n📁 Archivos registrados en google_drive_files:');
        const [files] = await conn.execute(`
            SELECT product_id, file_name, file_id FROM google_drive_files
            WHERE product_id IN (7, 10, 11, 12)
            ORDER BY product_id
        `);

        files.forEach(f => {
            console.log(`Producto ${f.product_id}: ${f.file_name} -> ${f.file_id}`);
        });

        await conn.end();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkPermissions();