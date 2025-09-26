const mysql = require('mysql2/promise');

// Script para actualizar la base de datos con IDs de archivos reales
async function updateFileIds() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cisnetpos'
    });

    console.log('🔧 Actualizando IDs de archivos en la base de datos...');

    // IDs reales de archivos de Google Drive - Actualizar con todos los IDs
    const realFileIds = {
        7: '1m3aB_q6ksXho6amul4a5Oy65Ju16EBsr',  // office365_v2024.zip (EJEMPLO)
        8: '1SYu0SUyB6tjewT9tCaU7A7JyjtN8s9pc',  // photoshop_2024.zip
        9: '1D965qsRBXQr7GzIZtkQvtjUISzbliCpr',     // vscode_latest.zip
        10: '1DQg743jbtuNYErgPAjSVHqJxOjLF_YvH',   // windows11_pro.zip
        11: '1ZRYbmbbY2Ne_GhoHbV4VTUdcSMrgId_b',   // autocad_2024.zip
        12: '1Pjwh2MxMzLmp0N7DatNegPO3Y3GsXBik', // minecraft_java.zip
        13: '105ex1OkSehJTPZulzVb9Q9PANFpkCJLv',    // norton360_deluxe.zip
        14: '1gN-9rwvJgT2OJ76XrSHi9hoPEiOojFpF',      // zoom_pro.zip
        15: '1jtXX8HdJR6tdbFoaeWmtAtDYdfha_OaE',     // adobe_creative_suite.zip
        16: '1yvONbmTRTQVgbi6nl2yeWqAnXW3katEf',  // intellij_ultimate.zip
        17: '12_aeDM0Foh3dBS5vc8gg5Zl9Fsp1qgGD',   // spotify_premium.zip
        18: '1umpJtOWQ-WH059IcqvQLPtulFzS01hOV'     // vmware_workstation.zip
    };

    try {
        for (const [productId, fileId] of Object.entries(realFileIds)) {
            await connection.execute(`
                UPDATE google_drive_files
                SET file_id = ?
                WHERE product_id = ?
            `, [fileId, productId]);

            console.log(`✅ Actualizado producto ${productId} con file_id: ${fileId}`);
        }

        // Verificar resultados
        console.log('\n📋 Archivos actualizados:');
        const [files] = await connection.execute(`
            SELECT product_id, file_name, file_id
            FROM google_drive_files
            WHERE product_id IN (${Object.keys(realFileIds).join(',')})
            ORDER BY product_id
        `);

        files.forEach(file => {
            console.log(`Producto ${file.product_id}: ${file.file_name}`);
            console.log(`   File ID: ${file.file_id}`);
            console.log(`   URL directa: https://drive.google.com/file/d/${file.file_id}/view`);
            console.log('');
        });

        // Ahora actualizar los permisos existentes para usar file IDs específicos
        console.log('🔄 Actualizando permisos existentes...');

        const [permissions] = await connection.execute(`
            SELECT id, user_id, user_email, product_id
            FROM user_drive_permissions
        `);

        for (const perm of permissions) {
            const fileId = realFileIds[perm.product_id];
            if (fileId) {
                await connection.execute(`
                    UPDATE user_drive_permissions
                    SET google_file_id = ?
                    WHERE id = ?
                `, [fileId, perm.id]);

                console.log(`✅ Actualizado permiso ${perm.id} (usuario: ${perm.user_email}, producto: ${perm.product_id})`);
            }
        }

        console.log('\n🎉 Base de datos actualizada exitosamente!');
        console.log('\n⚠️  IMPORTANTE: Debes reemplazar los IDs de ejemplo con los IDs reales de tus archivos de Google Drive');
        console.log('   Para obtener los IDs reales, ejecuta: node get-drive-file-ids.js');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await connection.end();
    }
}

updateFileIds().catch(console.error);