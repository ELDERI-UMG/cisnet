const mysql = require('mysql2/promise');

async function fixDatabaseConstraints() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cisnetpos'
    });

    console.log('🔧 Arreglando constraints de la base de datos...');

    try {
        // 1. Primero, eliminar el constraint problemático
        console.log('🗑️ Eliminando constraint problemático...');
        await connection.execute('ALTER TABLE user_drive_permissions DROP INDEX unique_user_file');
        console.log('✅ Constraint eliminado');

        // 2. Crear nuevo constraint que incluya product_id
        console.log('📝 Creando nuevo constraint con product_id...');
        await connection.execute(`
            ALTER TABLE user_drive_permissions
            ADD UNIQUE KEY unique_user_product_file (user_id, product_id, google_file_id)
        `);
        console.log('✅ Nuevo constraint creado: unique_user_product_file');

        // 3. Limpiar datos existentes y recrearlos
        console.log('🗑️ Limpiando permisos existentes...');
        await connection.execute('DELETE FROM user_drive_permissions');
        console.log('✅ Permisos limpiados');

        // 4. Recrear permisos para todas las órdenes
        console.log('🔄 Recreando permisos para todas las órdenes...');
        const [orders] = await connection.execute(`
            SELECT o.id, o.user_id, o.product_ids, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `);

        const driveUrl = 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';
        let totalPermissions = 0;

        for (const order of orders) {
            const productIds = JSON.parse(order.product_ids);
            console.log(`📦 Procesando orden ${order.id} para usuario ${order.email} con productos:`, productIds);

            for (const productId of productIds) {
                try {
                    await connection.execute(`
                        INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                        VALUES (?, ?, ?, ?, 'granted', NOW())
                    `, [order.user_id, order.email, productId, driveUrl]);

                    console.log(`✅ Permiso creado para usuario ${order.email} producto ${productId}`);
                    totalPermissions++;
                } catch (error) {
                    console.error(`❌ Error creando permiso para usuario ${order.email} producto ${productId}:`, error.message);
                }
            }
        }

        // 5. Verificar resultados
        const [newPerms] = await connection.execute('SELECT COUNT(*) as count FROM user_drive_permissions WHERE status = "granted"');
        console.log(`🎉 Total permisos creados: ${newPerms[0].count}`);
        console.log(`📊 Esperados: ${totalPermissions}, Creados: ${newPerms[0].count}`);

        // 6. Mostrar algunos ejemplos
        console.log('📋 Ejemplos de permisos creados:');
        const [examples] = await connection.execute(`
            SELECT udp.user_email, udp.product_id, udp.status, udp.granted_at
            FROM user_drive_permissions udp
            ORDER BY udp.granted_at DESC
            LIMIT 5
        `);
        examples.forEach(perm => {
            console.log(`  - ${perm.user_email}: Producto ${perm.product_id} (${perm.status})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
        console.log('✅ Proceso completado');
    }
}

fixDatabaseConstraints().catch(console.error);