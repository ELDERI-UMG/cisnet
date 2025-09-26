const mysql = require('./backend/node_modules/mysql2/promise');

async function fixMissingPermissions() {
    try {
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cisnetpos'
        });

        console.log('🔧 Corrigiendo permisos faltantes...');

        // Buscar órdenes sin permisos correspondientes
        const [orders] = await conn.execute(`
            SELECT o.id as order_id, o.user_id, o.product_ids, u.email
            FROM orders o
            JOIN users u ON o.user_id = u.id
            WHERE o.payment_status = 'completed'
            ORDER BY o.created_at DESC
        `);

        console.log(`📦 Encontradas ${orders.length} órdenes completadas`);

        for (const order of orders) {
            const productIds = JSON.parse(order.product_ids);
            console.log(`\n🔍 Verificando orden ${order.order_id} - Usuario: ${order.email}`);
            console.log(`   Productos: ${productIds.join(', ')}`);

            for (const productId of productIds) {
                // Verificar si ya existe el permiso
                const [existingPerm] = await conn.execute(`
                    SELECT id FROM user_drive_permissions
                    WHERE user_id = ? AND product_id = ?
                `, [order.user_id, productId]);

                if (existingPerm.length === 0) {
                    // No existe permiso, buscar file_id
                    const [fileInfo] = await conn.execute(`
                        SELECT file_id, file_name FROM google_drive_files
                        WHERE product_id = ?
                    `, [productId]);

                    if (fileInfo.length > 0 && fileInfo[0].file_id) {
                        const fileId = fileInfo[0].file_id;
                        const fileName = fileInfo[0].file_name;

                        // Insertar permiso faltante
                        await conn.execute(`
                            INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                            VALUES (?, ?, ?, ?, 'granted', NOW())
                        `, [order.user_id, order.email, productId, fileId]);

                        console.log(`   ✅ CORREGIDO: Permiso insertado para producto ${productId}`);
                        console.log(`      Archivo: ${fileName}`);
                        console.log(`      File ID: ${fileId}`);
                        console.log(`      URL: https://drive.google.com/file/d/${fileId}/view`);
                    } else {
                        console.log(`   ❌ ERROR: No se encontró file_id para producto ${productId}`);
                    }
                } else {
                    console.log(`   ℹ️  Ya existe permiso para producto ${productId}`);
                }
            }
        }

        // Verificar resultados finales
        console.log('\n📋 RESUMEN FINAL:');
        const [finalPerms] = await conn.execute(`
            SELECT user_email, product_id, google_file_id, status, granted_at
            FROM user_drive_permissions
            WHERE user_id = 7
            ORDER BY granted_at DESC
        `);

        console.log(`✅ Total de permisos para demo@example.com: ${finalPerms.length}`);
        finalPerms.forEach((perm, index) => {
            console.log(`${index + 1}. Producto ${perm.product_id}: ${perm.google_file_id} (${perm.status})`);
        });

        await conn.end();
        console.log('\n🎉 Corrección de permisos completada!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

fixMissingPermissions();