/**
 * Google Drive API Credentials Setup
 *
 * Para configurar las credenciales reales de Google Drive API:
 *
 * 1. Ir a Google Cloud Console: https://console.cloud.google.com/
 * 2. Crear un nuevo proyecto o seleccionar uno existente
 * 3. Habilitar Google Drive API
 * 4. Crear credenciales (Service Account o OAuth 2.0)
 * 5. Descargar el archivo de credenciales JSON
 * 6. Configurar las variables de entorno
 */

const fs = require('fs');
const path = require('path');

class GoogleCredentialsSetup {
    constructor() {
        this.credentialsPath = path.join(__dirname, 'google-service-account.json');
        this.envPath = path.join(__dirname, '../.env');
    }

    // Método para configurar Service Account (recomendado para uso automatizado)
    setupServiceAccount(credentialsData) {
        try {
            // Guardar credenciales de Service Account
            fs.writeFileSync(this.credentialsPath, JSON.stringify(credentialsData, null, 2));

            // Configurar variables de entorno
            const envContent = `
# Google Drive API Configuration
GOOGLE_APPLICATION_CREDENTIALS=${this.credentialsPath}
GOOGLE_DRIVE_FOLDER_ID=1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi

# Credenciales de la cuenta principal
GOOGLE_ACCOUNT_EMAIL=cisnetsociedadanonima@gmail.com
GOOGLE_ACCOUNT_PASSWORD=123$876@

# Configuración de la aplicación
GOOGLE_DRIVE_AUTO_GRANT=true
`;

            fs.writeFileSync(this.envPath, envContent);

            console.log('✅ Credenciales de Service Account configuradas');
            console.log('📁 Archivo guardado en:', this.credentialsPath);
            console.log('🔧 Variables de entorno configuradas en:', this.envPath);

            return true;

        } catch (error) {
            console.error('❌ Error configurando Service Account:', error);
            return false;
        }
    }

    // Método para configurar OAuth 2.0 (para aplicaciones web)
    setupOAuth2(clientId, clientSecret, redirectUri) {
        try {
            const envContent = `
# Google Drive API Configuration - OAuth 2.0
GOOGLE_CLIENT_ID=${clientId}
GOOGLE_CLIENT_SECRET=${clientSecret}
GOOGLE_REDIRECT_URI=${redirectUri}
GOOGLE_DRIVE_FOLDER_ID=1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi

# Credenciales de la cuenta principal
GOOGLE_ACCOUNT_EMAIL=cisnetsociedadanonima@gmail.com
GOOGLE_ACCOUNT_PASSWORD=123$876@

# Configuración de la aplicación
GOOGLE_DRIVE_AUTO_GRANT=true
`;

            fs.writeFileSync(this.envPath, envContent);

            console.log('✅ Credenciales OAuth 2.0 configuradas');
            console.log('🔧 Variables de entorno configuradas en:', this.envPath);

            return true;

        } catch (error) {
            console.error('❌ Error configurando OAuth 2.0:', error);
            return false;
        }
    }

    // Verificar si las credenciales están configuradas
    checkCredentials() {
        const hasServiceAccount = fs.existsSync(this.credentialsPath);
        const hasEnvFile = fs.existsSync(this.envPath);

        console.log('🔍 Estado de las credenciales:');
        console.log('  Service Account:', hasServiceAccount ? '✅' : '❌');
        console.log('  Variables de entorno:', hasEnvFile ? '✅' : '❌');

        if (hasEnvFile) {
            const envContent = fs.readFileSync(this.envPath, 'utf8');
            const hasClientId = envContent.includes('GOOGLE_CLIENT_ID');
            const hasCredentials = envContent.includes('GOOGLE_APPLICATION_CREDENTIALS');

            console.log('  OAuth 2.0:', hasClientId ? '✅' : '❌');
            console.log('  Service Account JSON:', hasCredentials ? '✅' : '❌');
        }

        return { hasServiceAccount, hasEnvFile };
    }

    // Generar template de credenciales
    generateServiceAccountTemplate() {
        const template = {
            "type": "service_account",
            "project_id": "tu-proyecto-id",
            "private_key_id": "key-id",
            "private_key": "-----BEGIN PRIVATE KEY-----\\nTU_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
            "client_email": "service-account@tu-proyecto.iam.gserviceaccount.com",
            "client_id": "client-id",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/service-account%40tu-proyecto.iam.gserviceaccount.com"
        };

        const templatePath = path.join(__dirname, 'google-service-account-template.json');
        fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));

        console.log('📄 Template de Service Account generado en:', templatePath);
        console.log('🔧 Edita este archivo con tus credenciales reales y usa setupServiceAccount()');

        return templatePath;
    }

    // Instrucciones paso a paso
    showInstructions() {
        console.log(`
📋 INSTRUCCIONES PARA CONFIGURAR GOOGLE DRIVE API

🔗 Paso 1: Google Cloud Console
   1. Ve a: https://console.cloud.google.com/
   2. Crea un nuevo proyecto o selecciona uno existente
   3. Habilita la API de Google Drive

🔑 Paso 2: Crear Service Account (Recomendado)
   1. Ve a "IAM & Admin" > "Service Accounts"
   2. Crea una nueva Service Account
   3. Descarga el archivo JSON de credenciales
   4. Ejecuta: setup.setupServiceAccount(credentialsJSON)

🌐 Paso 3: Configurar permisos en Google Drive
   1. Inicia sesión con: cisnetsociedadanonima@gmail.com
   2. Ve a la carpeta: https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi
   3. Comparte la carpeta con el email del Service Account
   4. Dale permisos de "Editor" o "Propietario"

📁 Paso 4: Subir archivos ZIP
   1. Sube los archivos con los nombres específicos
   2. office365_v2024.zip, photoshop_2024.zip, etc.

🚀 Paso 5: Probar el sistema
   1. Reinicia el servidor backend
   2. Realiza una compra de prueba
   3. Verifica que se otorguen permisos automáticamente

⚡ Alternativa rápida - OAuth 2.0:
   setup.setupOAuth2('client-id', 'client-secret', 'redirect-uri')
`);
    }
}

// Ejemplo de uso:
const setup = new GoogleCredentialsSetup();

// Verificar estado actual
setup.checkCredentials();

// Mostrar instrucciones
setup.showInstructions();

// Generar template
setup.generateServiceAccountTemplate();

module.exports = GoogleCredentialsSetup;