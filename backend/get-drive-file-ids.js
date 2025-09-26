const { google } = require('googleapis');

// Script para obtener IDs de archivos de Google Drive
async function getDriveFileIds() {
    try {
        console.log('🔍 Obteniendo IDs de archivos de Google Drive...');

        // Configurar autenticación con las credenciales
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: 'cisnetsociedadanonima@gmail.com',
                private_key: process.env.GOOGLE_PRIVATE_KEY || 'Tu_clave_privada_aquí'
            },
            scopes: ['https://www.googleapis.com/auth/drive']
        });

        const drive = google.drive({ version: 'v3', auth });

        // ID de la carpeta principal
        const folderId = '1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';

        console.log(`📁 Buscando archivos en carpeta: ${folderId}`);

        // Listar archivos en la carpeta
        const response = await drive.files.list({
            q: `'${folderId}' in parents`,
            fields: 'files(id, name, mimeType, size)',
            pageSize: 100
        });

        const files = response.data.files;

        if (files.length === 0) {
            console.log('❌ No se encontraron archivos en la carpeta');
            return;
        }

        console.log(`📋 Encontrados ${files.length} archivos:`);
        console.log('');

        // Mapeo de archivos por producto
        const productFileMapping = {
            7: 'office365_v2024.zip',
            8: 'photoshop_2024.zip',
            9: 'vscode_latest.zip',
            10: 'windows11_pro.zip',
            11: 'autocad_2024.zip',
            12: 'minecraft_java.zip',
            13: 'norton360_deluxe.zip',
            14: 'zoom_pro.zip',
            15: 'adobe_creative_suite.zip',
            16: 'intellij_ultimate.zip',
            17: 'spotify_premium.zip',
            18: 'vmware_workstation.zip'
        };

        // Buscar coincidencias
        const foundFiles = {};

        files.forEach(file => {
            console.log(`📄 ${file.name} (${file.id})`);

            // Buscar qué producto corresponde a este archivo
            for (const [productId, expectedFileName] of Object.entries(productFileMapping)) {
                if (file.name.toLowerCase().includes(expectedFileName.toLowerCase().replace('.zip', '')) ||
                    expectedFileName.toLowerCase().includes(file.name.toLowerCase().replace('.zip', ''))) {
                    foundFiles[productId] = {
                        id: file.id,
                        name: file.name,
                        expectedName: expectedFileName
                    };
                    console.log(`   ✅ Coincide con producto ${productId}: ${expectedFileName}`);
                }
            }
        });

        console.log('');
        console.log('🎯 Mapeo final de productos a archivos:');
        console.log('');

        for (const [productId, fileInfo] of Object.entries(foundFiles)) {
            console.log(`Producto ${productId}: ${fileInfo.name}`);
            console.log(`   File ID: ${fileInfo.id}`);
            console.log(`   URL directa: https://drive.google.com/file/d/${fileInfo.id}/view`);
            console.log(`   URL descarga: https://drive.google.com/uc?export=download&id=${fileInfo.id}`);
            console.log('');
        }

        // Generar SQL para actualizar la base de datos
        console.log('📝 SQL para actualizar base de datos:');
        console.log('');

        for (const [productId, fileInfo] of Object.entries(foundFiles)) {
            console.log(`UPDATE google_drive_files SET file_id = '${fileInfo.id}' WHERE product_id = ${productId};`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('💡 Para usar este script necesitas:');
        console.log('1. Instalar googleapis: npm install googleapis');
        console.log('2. Configurar las credenciales de Google Service Account');
        console.log('3. Tener acceso a la carpeta de Google Drive');
        console.log('');
        console.log('📋 Alternativamente, puedes obtener los IDs manualmente:');
        console.log('1. Ve a https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi');
        console.log('2. Haz clic en cada archivo ZIP');
        console.log('3. Copia el ID de la URL (la parte después de /file/d/ y antes de /view)');
    }
}

getDriveFileIds();