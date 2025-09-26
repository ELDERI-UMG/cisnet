const mysql = require('mysql2/promise');

async function createMissingPermissions() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cisnetpos'
    });

    console.log('🔧 Creando permisos para órdenes existentes...');

    // Limpiar permisos existentes
    await connection.execute('DELETE FROM user_drive_permissions');
    console.log('🗑️ Permisos existentes eliminados');

    // Get all orders
    const [orders] = await connection.execute(`
        SELECT o.id, o.user_id, o.product_ids, u.email
        FROM orders o
        JOIN users u ON o.user_id = u.id
    `);

    const driveUrl = 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';

    for (const order of orders) {
        const productIds = JSON.parse(order.product_ids);
        console.log(`Procesando orden ${order.id} para usuario ${order.email} productos:`, productIds);

        for (const productId of productIds) {
            try {
                await connection.execute(`
                    INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                    VALUES (?, ?, ?, ?, 'granted', NOW())
                `, [order.user_id, order.email, productId, driveUrl]);

                console.log(`✅ Permiso creado para usuario ${order.email} producto ${productId}`);
            } catch (error) {
                console.error('❌ Error creando permiso:', error);
            }
        }
    }

    // Verificar resultados
    const [newPerms] = await connection.execute('SELECT COUNT(*) as count FROM user_drive_permissions WHERE status = "granted"');
    console.log('🎉 Total permisos otorgados:', newPerms[0].count);

    await connection.end();
    console.log('✅ Proceso completado');
}

createMissingPermissions().catch(console.error);