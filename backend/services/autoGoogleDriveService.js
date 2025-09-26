const { google } = require('googleapis');

class AutoGoogleDriveService {
    constructor() {
        this.drive = null;
        this.auth = null;
        this.initialized = false;

        // Configuración de la cuenta principal
        this.accountEmail = 'cisnetsociedadanonima@gmail.com';
        this.accountPassword = '123$876@';
        this.mainFolderId = '1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';

        // Mapeo de productos a archivos específicos
        this.productFileMapping = {
            7: { fileName: 'office365_v2024.zip', fileId: null },
            8: { fileName: 'photoshop_2024.zip', fileId: null },
            9: { fileName: 'vscode_latest.zip', fileId: null },
            10: { fileName: 'windows11_pro.zip', fileId: null },
            11: { fileName: 'autocad_2024.zip', fileId: null },
            12: { fileName: 'minecraft_java.zip', fileId: null },
            13: { fileName: 'norton360_deluxe.zip', fileId: null },
            14: { fileName: 'zoom_pro.zip', fileId: null },
            15: { fileName: 'adobe_creative_suite.zip', fileId: null },
            16: { fileName: 'intellij_ultimate.zip', fileId: null },
            17: { fileName: 'spotify_premium.zip', fileId: null },
            18: { fileName: 'vmware_workstation.zip', fileId: null }
        };

        // Cache de archivos encontrados
        this.fileCache = new Map();
    }

    async initialize() {
        try {
            console.log('🔧 Inicializando AutoGoogleDriveService...');

            // Configurar OAuth2 client con credenciales de aplicación
            // Nota: Para uso automatizado, necesitaremos configurar Service Account
            this.auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                'http://localhost:3000/auth/google/callback'
            );

            // Para desarrollo/testing sin credenciales completas
            // usaremos un modo simulado que funciona con la URL de la carpeta
            this.drive = google.drive({ version: 'v3', auth: this.auth });
            this.initialized = true;

            console.log('✅ AutoGoogleDriveService inicializado en modo simulado');
            return true;

        } catch (error) {
            console.error('❌ Error inicializando AutoGoogleDriveService:', error);
            this.initialized = false;
            return false;
        }
    }

    async findFileInFolder(folderId, fileName) {
        try {
            // Verificar en cache primero
            const cacheKey = `${folderId}_${fileName}`;
            if (this.fileCache.has(cacheKey)) {
                return this.fileCache.get(cacheKey);
            }

            // En modo simulado, generar fileId basado en el nombre
            // En producción, esto haría una búsqueda real en Google Drive
            const simulatedFileId = this.generateSimulatedFileId(fileName);

            // Guardar en cache
            this.fileCache.set(cacheKey, simulatedFileId);

            console.log(`📁 Archivo simulado encontrado: ${fileName} -> ${simulatedFileId}`);
            return simulatedFileId;

        } catch (error) {
            console.error(`❌ Error buscando archivo ${fileName}:`, error);
            return null;
        }
    }

    generateSimulatedFileId(fileName) {
        // Generar ID simulado basado en el nombre del archivo
        // En producción, esto sería el ID real de Google Drive
        const hash = fileName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return `simulated_${hash}_${Date.now().toString(36)}`;
    }

    async grantFilePermission(userEmail, productId) {
        try {
            console.log(`🔐 Otorgando permisos automáticos para ${userEmail} en producto ${productId}`);

            const productFile = this.productFileMapping[productId];
            if (!productFile) {
                throw new Error(`No se encontró mapeo para producto ${productId}`);
            }

            // Buscar archivo en la carpeta
            let fileId = productFile.fileId;
            if (!fileId) {
                fileId = await this.findFileInFolder(this.mainFolderId, productFile.fileName);
                if (fileId) {
                    // Actualizar cache del producto
                    this.productFileMapping[productId].fileId = fileId;
                }
            }

            if (!fileId) {
                throw new Error(`Archivo ${productFile.fileName} no encontrado en Google Drive`);
            }

            // En modo simulado, simular el otorgamiento de permisos
            const permissionResult = await this.simulatePermissionGrant(userEmail, fileId, productFile.fileName);

            return {
                success: true,
                fileId: fileId,
                fileName: productFile.fileName,
                downloadUrl: this.generateDownloadUrl(fileId),
                viewUrl: this.generateViewUrl(fileId),
                permissionId: permissionResult.permissionId,
                message: `Permisos otorgados automáticamente para ${productFile.fileName}`
            };

        } catch (error) {
            console.error(`❌ Error otorgando permisos automáticos:`, error);
            throw error;
        }
    }

    async simulatePermissionGrant(userEmail, fileId, fileName) {
        // En producción, esto sería:
        /*
        const permission = {
            role: 'reader',
            type: 'user',
            emailAddress: userEmail
        };

        const result = await this.drive.permissions.create({
            fileId: fileId,
            resource: permission,
            sendNotificationEmail: true,
            emailMessage: `Se te ha otorgado acceso al archivo ${fileName} que compraste en CISNET.`
        });

        return result.data;
        */

        // Simulación para desarrollo
        const simulatedPermissionId = `perm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        console.log(`✅ Permisos simulados otorgados:`);
        console.log(`   - Usuario: ${userEmail}`);
        console.log(`   - Archivo: ${fileName} (${fileId})`);
        console.log(`   - Permission ID: ${simulatedPermissionId}`);

        return {
            id: simulatedPermissionId,
            role: 'reader',
            type: 'user',
            emailAddress: userEmail
        };
    }

    generateDownloadUrl(fileId) {
        // URL de descarga directa para Google Drive
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    generateViewUrl(fileId) {
        // URL de vista para Google Drive
        return `https://drive.google.com/file/d/${fileId}/view`;
    }

    getFolderUrl() {
        // URL de la carpeta principal para fallback
        return `https://drive.google.com/drive/u/1/folders/${this.mainFolderId}`;
    }

    async getDownloadUrlForUser(productId, userEmail) {
        try {
            const productFile = this.productFileMapping[productId];
            if (!productFile) {
                throw new Error(`Producto ${productId} no encontrado`);
            }

            // Si ya tenemos el fileId, generar URL directamente
            if (productFile.fileId) {
                return {
                    success: true,
                    downloadUrl: this.generateDownloadUrl(productFile.fileId),
                    viewUrl: this.generateViewUrl(productFile.fileId),
                    fileName: productFile.fileName,
                    fileId: productFile.fileId
                };
            }

            // Si no tenemos fileId, buscarlo
            const fileId = await this.findFileInFolder(this.mainFolderId, productFile.fileName);
            if (fileId) {
                this.productFileMapping[productId].fileId = fileId;

                return {
                    success: true,
                    downloadUrl: this.generateDownloadUrl(fileId),
                    viewUrl: this.generateViewUrl(fileId),
                    fileName: productFile.fileName,
                    fileId: fileId
                };
            }

            // Fallback a la carpeta principal
            return {
                success: true,
                downloadUrl: this.getFolderUrl(),
                fileName: productFile.fileName,
                message: `Busca el archivo ${productFile.fileName} en la carpeta compartida`,
                fallback: true
            };

        } catch (error) {
            console.error(`❌ Error obteniendo URL de descarga:`, error);
            throw error;
        }
    }

    async revokePermission(fileId, userEmail) {
        try {
            console.log(`🚫 Revocando permisos para ${userEmail} en archivo ${fileId}`);

            // En modo simulado, solo log
            console.log(`✅ Permisos revocados (simulado) para ${userEmail}`);
            return true;

        } catch (error) {
            console.error(`❌ Error revocando permisos:`, error);
            throw error;
        }
    }

    // Método para listar todos los archivos en la carpeta principal
    async listFilesInMainFolder() {
        try {
            console.log(`📂 Listando archivos en carpeta ${this.mainFolderId}`);

            // En modo simulado, retornar lista basada en el mapeo
            const simulatedFiles = Object.values(this.productFileMapping).map(file => ({
                id: file.fileId || this.generateSimulatedFileId(file.fileName),
                name: file.fileName,
                size: '50MB', // Simulado
                modifiedTime: new Date().toISOString()
            }));

            return simulatedFiles;

        } catch (error) {
            console.error('❌ Error listando archivos:', error);
            throw error;
        }
    }

    // Método para verificar si un usuario tiene permisos
    async checkUserPermission(fileId, userEmail) {
        try {
            // En modo simulado, siempre retornar true
            // En producción, verificar permisos reales
            return true;

        } catch (error) {
            console.error(`❌ Error verificando permisos:`, error);
            return false;
        }
    }
}

module.exports = AutoGoogleDriveService;