// Script para probar una nueva compra y verificar si se insertan permisos

async function testNewPurchase() {
    try {
        console.log('🧪 Iniciando prueba de nueva compra...');

        // 1. Login
        console.log('🔐 1. Haciendo login...');
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'demo@example.com',
                password: '123456'
            })
        });

        const loginData = await loginResponse.json();
        if (!loginData.success) {
            throw new Error('Login failed: ' + loginData.error);
        }

        const token = loginData.data.token;
        console.log('✅ Login exitoso, token obtenido');

        // 2. Verificar permisos actuales
        console.log('📋 2. Verificando permisos actuales...');
        const mysql = require('./backend/node_modules/mysql2/promise');
        const conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'cisnetpos'
        });

        const [currentPerms] = await conn.execute(`
            SELECT product_id, google_file_id FROM user_drive_permissions
            WHERE user_id = 7
            ORDER BY granted_at DESC
        `);

        console.log(`📦 Permisos actuales: ${currentPerms.length}`);
        currentPerms.forEach(p => {
            console.log(`   - Producto ${p.product_id}: ${p.google_file_id}`);
        });

        // 3. Hacer nueva compra (producto 12 - Minecraft)
        console.log('🛒 3. Haciendo nueva compra (Producto 12 - Minecraft)...');
        const orderResponse = await fetch('http://localhost:3000/api/purchases/create-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                productIds: [12],
                totalAmount: 29.99,
                paymentMethod: 'test',
                paymentId: `test_${Date.now()}`
            })
        });

        const orderData = await orderResponse.json();
        console.log('📝 Respuesta de create-order:', orderData);

        // 4. Verificar permisos después de la compra
        console.log('🔍 4. Verificando permisos después de la compra...');
        const [newPerms] = await conn.execute(`
            SELECT product_id, google_file_id, granted_at FROM user_drive_permissions
            WHERE user_id = 7
            ORDER BY granted_at DESC
        `);

        console.log(`📦 Permisos después: ${newPerms.length}`);
        newPerms.forEach(p => {
            console.log(`   - Producto ${p.product_id}: ${p.google_file_id} (${p.granted_at})`);
        });

        // 5. Verificar si se insertó permiso para producto 12
        const hasMinecraftPermission = newPerms.some(p => p.product_id == 12);
        console.log(`\n🎯 RESULTADO: ${hasMinecraftPermission ? '✅ PERMISO INSERTADO' : '❌ PERMISO NO INSERTADO'} para producto 12`);

        if (hasMinecraftPermission) {
            const minecraftPerm = newPerms.find(p => p.product_id == 12);
            console.log(`   URL: https://drive.google.com/file/d/${minecraftPerm.google_file_id}/view`);
        }

        await conn.end();

    } catch (error) {
        console.error('❌ Error en prueba:', error);
    }
}

testNewPurchase();