const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

class GoogleDriveService {
    constructor() {
        this.drive = null;
        this.auth = null;
        this.initialized = false;

        // Configuración de la carpeta principal de Google Drive
        this.mainFolderId = '1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi';

        // Mapeo de productos a archivos específicos en Google Drive
        // Nota: Los fileId serán actualizados cuando se suban los archivos a Google Drive
        this.productFileMapping = {
            7: {
                fileName: 'office365_v2024.zip',
                fileId: null, // Será actualizado cuando se suba el archivo
                downloadUrl: null
            },
            8: {
                fileName: 'photoshop_2024.zip',
                fileId: null,
                downloadUrl: null
            },
            9: {
                fileName: 'vscode_latest.zip',
                fileId: null,
                downloadUrl: null
            },
            10: {
                fileName: 'windows11_pro.zip',
                fileId: null,
                downloadUrl: null
            },
            11: {
                fileName: 'autocad_2024.zip',
                fileId: null,
                downloadUrl: null
            },
            12: {
                fileName: 'minecraft_java.zip',
                fileId: null,
                downloadUrl: null
            },
            13: {
                fileName: 'norton360_deluxe.zip',
                fileId: null,
                downloadUrl: null
            },
            14: {
                fileName: 'zoom_pro.zip',
                fileId: null,
                downloadUrl: null
            },
            15: {
                fileName: 'adobe_creative_suite.zip',
                fileId: null,
                downloadUrl: null
            },
            16: {
                fileName: 'intellij_ultimate.zip',
                fileId: null,
                downloadUrl: null
            },
            17: {
                fileName: 'spotify_premium.zip',
                fileId: null,
                downloadUrl: null
            },
            18: {
                fileName: 'vmware_workstation.zip',
                fileId: null,
                downloadUrl: null
            }
        };
    }

    async initialize() {
        try {
            // Para desarrollo, usar credenciales de servicio
            // En producción, usar OAuth2

            // Crear cliente OAuth2
            this.auth = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID || 'your-client-id',
                process.env.GOOGLE_CLIENT_SECRET || 'your-client-secret',
                process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
            );

            // Configurar tokens de acceso (estos se obtienen del proceso OAuth)
            // Por ahora usaremos un token de servicio o credenciales de aplicación

            this.drive = google.drive({ version: 'v3', auth: this.auth });
            this.initialized = true;

            console.log('✅ Google Drive Service initialized');
            return true;
        } catch (error) {
            console.error('❌ Error initializing Google Drive Service:', error);
            return false;
        }
    }

    async setServiceAccountAuth(credentialsPath) {
        try {
            const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
            this.auth = new google.auth.GoogleAuth({
                credentials: credentials,
                scopes: ['https://www.googleapis.com/auth/drive']
            });

            this.drive = google.drive({ version: 'v3', auth: this.auth });
            this.initialized = true;

            console.log('✅ Google Drive Service initialized with service account');
            return true;
        } catch (error) {
            console.error('❌ Error setting service account auth:', error);
            return false;
        }
    }

    async grantFilePermission(userEmail, productId) {
        if (!this.initialized) {
            throw new Error('Google Drive Service not initialized');
        }

        try {
            const productFile = this.productFileMapping[productId];
            if (!productFile) {
                throw new Error(`No file mapping found for product ${productId}`);
            }

            // Buscar el archivo en la carpeta principal
            const fileId = await this.findFileInFolder(this.mainFolderId, productFile.fileName);
            if (!fileId) {
                throw new Error(`File ${productFile.fileName} not found in Google Drive`);
            }

            // Otorgar permisos de lectura al usuario
            const permission = {
                role: 'reader',
                type: 'user',
                emailAddress: userEmail
            };

            const result = await this.drive.permissions.create({
                fileId: fileId,
                resource: permission,
                sendNotificationEmail: true,
                emailMessage: `Se te ha otorgado acceso al archivo ${productFile.fileName} que compraste en CISNET.`
            });

            console.log(`✅ Permission granted to ${userEmail} for file ${productFile.fileName}`);
            return {
                success: true,
                fileId: fileId,
                permissionId: result.data.id,
                downloadUrl: `https://drive.google.com/file/d/${fileId}/view`
            };

        } catch (error) {
            console.error(`❌ Error granting permission to ${userEmail}:`, error);
            throw error;
        }
    }

    async findFileInFolder(folderId, fileName) {
        try {
            const response = await this.drive.files.list({
                q: `'${folderId}' in parents and name='${fileName}' and trashed=false`,
                fields: 'files(id, name)'
            });

            const files = response.data.files;
            if (files && files.length > 0) {
                return files[0].id;
            }
            return null;
        } catch (error) {
            console.error(`❌ Error finding file ${fileName}:`, error);
            return null;
        }
    }

    async getDownloadUrl(productId, userEmail) {
        try {
            const productFile = this.productFileMapping[productId];
            if (!productFile) {
                throw new Error(`No file mapping found for product ${productId}`);
            }

            // Para el caso específico donde no tenemos Google Drive API configurado,
            // generar URL directa basada en el nombre del archivo
            const fileName = productFile.fileName;
            const directUrl = `https://drive.google.com/drive/u/1/folders/${this.mainFolderId}`;

            return {
                success: true,
                downloadUrl: directUrl,
                fileName: fileName,
                message: `Busca el archivo ${fileName} en la carpeta compartida`
            };

        } catch (error) {
            console.error(`❌ Error getting download URL:`, error);
            throw error;
        }
    }

    // Método para obtener URL específica del archivo cuando tengamos el file ID
    getSpecificFileUrl(productId, fileId) {
        if (!fileId) {
            // Fallback a la carpeta principal
            return `https://drive.google.com/drive/u/1/folders/${this.mainFolderId}`;
        }

        // URL directa de descarga del archivo específico
        return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Método para obtener URL de vista del archivo
    getFileViewUrl(fileId) {
        if (!fileId) {
            return `https://drive.google.com/drive/u/1/folders/${this.mainFolderId}`;
        }
        return `https://drive.google.com/file/d/${fileId}/view`;
    }

    async checkUserPermission(fileId, userEmail) {
        try {
            const response = await this.drive.permissions.list({
                fileId: fileId,
                fields: 'permissions(emailAddress, role)'
            });

            const permissions = response.data.permissions;
            return permissions.some(permission =>
                permission.emailAddress === userEmail &&
                (permission.role === 'reader' || permission.role === 'writer' || permission.role === 'owner')
            );
        } catch (error) {
            console.error(`❌ Error checking permission for ${userEmail}:`, error);
            return false;
        }
    }

    async listFilesInMainFolder() {
        if (!this.initialized) {
            throw new Error('Google Drive Service not initialized');
        }

        try {
            const response = await this.drive.files.list({
                q: `'${this.mainFolderId}' in parents and trashed=false`,
                fields: 'files(id, name, size, modifiedTime)'
            });

            return response.data.files;
        } catch (error) {
            console.error('❌ Error listing files:', error);
            throw error;
        }
    }

    async revokePermission(fileId, userEmail) {
        try {
            // Buscar el permiso del usuario
            const response = await this.drive.permissions.list({
                fileId: fileId,
                fields: 'permissions(id, emailAddress)'
            });

            const permission = response.data.permissions.find(p => p.emailAddress === userEmail);
            if (permission) {
                await this.drive.permissions.delete({
                    fileId: fileId,
                    permissionId: permission.id
                });
                console.log(`✅ Permission revoked for ${userEmail}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`❌ Error revoking permission:`, error);
            throw error;
        }
    }
}

module.exports = GoogleDriveService;