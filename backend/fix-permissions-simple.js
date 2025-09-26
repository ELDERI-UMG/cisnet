const mysql = require('mysql2/promise');

async function fixPermissionsSimple() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cisnetpos'
    });

    console.log('🔧 Arreglando permisos de forma simple...');

    try {
        // 1. Limpiar permisos existentes
        console.log('🗑️ Limpiando permisos existentes...');
        await connection.execute('DELETE FROM user_drive_permissions');
        console.log('✅ Permisos limpiados');

        // 2. Recrear permisos para todas las órdenes usando un google_file_id único por producto
        console.log('🔄 Recreando permisos para todas las órdenes...');
        const [orders] = await connection.execute(`
            SELECT o.id, o.user_id, o.product_ids, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
        `);

        const baseDriveUrl = 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';
        let totalPermissions = 0;

        for (const order of orders) {
            const productIds = JSON.parse(order.product_ids);
            console.log(`📦 Procesando orden ${order.id} para usuario ${order.email} con productos:`, productIds);

            for (const productId of productIds) {
                try {
                    // Usar un google_file_id único por producto para evitar el constraint
                    const uniqueFileId = `${baseDriveUrl}?product=${productId}`;

                    await connection.execute(`
                        INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                        VALUES (?, ?, ?, ?, 'granted', NOW())
                    `, [order.user_id, order.email, productId, uniqueFileId]);

                    console.log(`✅ Permiso creado para usuario ${order.email} producto ${productId}`);
                    totalPermissions++;
                } catch (error) {
                    console.error(`❌ Error creando permiso para usuario ${order.email} producto ${productId}:`, error.message);
                }
            }
        }

        // 3. Verificar resultados
        const [newPerms] = await connection.execute('SELECT COUNT(*) as count FROM user_drive_permissions WHERE status = "granted"');
        console.log(`🎉 Total permisos creados: ${newPerms[0].count}`);
        console.log(`📊 Esperados: ${totalPermissions}, Creados: ${newPerms[0].count}`);

        // 4. Mostrar todos los permisos creados
        console.log('📋 Permisos creados:');
        const [allPerms] = await connection.execute(`
            SELECT udp.user_email, udp.product_id, udp.status, udp.granted_at
            FROM user_drive_permissions udp
            ORDER BY udp.user_email, udp.product_id
        `);
        allPerms.forEach(perm => {
            console.log(`  - ${perm.user_email}: Producto ${perm.product_id} (${perm.status})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
        console.log('✅ Proceso completado');
    }
}

fixPermissionsSimple().catch(console.error);