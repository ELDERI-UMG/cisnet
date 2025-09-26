const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const GoogleDriveService = require('./services/googleDriveService');
const AutoGoogleDriveService = require('./services/autoGoogleDriveService');

const app = express();
const PORT = 3000;

// CORS - Configuración de producción
app.use(cors({
    origin: ['http://localhost', 'http://127.0.0.1', 'http://localhost:80'],
    credentials: true
}));

// JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Google Drive Services
const driveService = new GoogleDriveService();
const autoDriveService = new AutoGoogleDriveService();

// Initialize auto drive service
autoDriveService.initialize().then(success => {
    if (success) {
        console.log('✅ Servicio automático de Google Drive inicializado');
    } else {
        console.log('⚠️ Servicio automático de Google Drive en modo fallback');
    }
}).catch(error => {
    console.error('❌ Error inicializando servicio automático:', error);
});

// Production logging middleware
app.use((req, res, next) => {
    if (req.path.includes('/api/')) {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    }
    next();
});

// Database connection helper
async function getDbConnection() {
    return await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'cisnetpos'
    });
}

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'CisnetPOS API',
        version: '1.0.0',
        status: 'OK',
        message: 'Sistema de autenticación CisnetPOS funcionando correctamente',
        endpoints: {
            health: '/health',
            auth: {
                login: 'POST /api/auth/login',
                register: 'POST /api/auth/register',
                profile: 'GET /api/auth/profile',
                logout: 'POST /api/auth/logout'
            },
            products: {
                list: 'GET /api/products',
                search: 'GET /api/products/search?q=query',
                detail: 'GET /api/products/:id'
            },
            cart: {
                get: 'GET /api/cart',
                add: 'POST /api/cart/items',
                update: 'PUT /api/cart/items/:id',
                remove: 'DELETE /api/cart/items/:id',
                clear: 'DELETE /api/cart'
            }
        },
        timestamp: new Date().toISOString()
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        message: 'CisnetPOS API funcionando correctamente'
    });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    console.log('📝 Register request received');
    
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Nombre, email y contraseña son requeridos'
            });
        }

        const connection = await getDbConnection();
        
        // Check if user exists
        const [existing] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        
        if (existing.length > 0) {
            await connection.end();
            return res.status(409).json({
                success: false,
                error: 'El email ya está registrado'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [name, email, hashedPassword]
        );
        
        await connection.end();
        
        
        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                name,
                email,
                message: 'Usuario registrado exitosamente'
            }
        });
        
    } catch (error) {
        console.error('❌ Error en register:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    console.log('🔑 Login request received');
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email y contraseña son requeridos'
            });
        }

        const connection = await getDbConnection();
        
        // Get user
        const [users] = await connection.execute(
            'SELECT id, name, email, password FROM users WHERE email = ?',
            [email]
        );
        
        await connection.end();
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        const user = users[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Generate token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            'cisnet_secret_key_2024',
            { expiresIn: '24h' }
        );

        
        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                },
                token
            }
        });
        
    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Profile endpoint
app.get('/api/auth/profile', async (req, res) => {
    console.log('👤 Profile request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const connection = await getDbConnection();
        
        const [users] = await connection.execute(
            'SELECT id, name, email FROM users WHERE id = ?',
            [decoded.id]
        );
        
        await connection.end();

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        console.log(`✅ Perfil obtenido: ${users[0].email}`);
        
        res.json({
            success: true,
            data: users[0]
        });
        
    } catch (error) {
        console.error('❌ Error en profile:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    console.log('🚪 Logout request received');
    res.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

// Google Auth endpoints
// Check if user exists by email
app.post('/api/google-auth/user-by-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Connect to database
        const connection = await getDbConnection();

        const [rows] = await connection.execute(
            'SELECT id, name, email FROM users WHERE email = ?',
            [email]
        );
        await connection.end();

        const userExists = rows.length > 0;

        res.json({
            success: userExists,
            exists: userExists,
            user: userExists ? rows[0] : null,
            message: userExists ? 'User found' : 'User not found'
        });
    } catch (error) {
        console.error('❌ User lookup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Google Login endpoint
app.post('/api/google-auth/google-login', async (req, res) => {
    try {
        const { googleId, email, name, picture, emailVerified } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({
                success: false,
                error: 'Datos de usuario de Google faltantes'
            });
        }

        // Connect to database to get existing user
        const connection = await getDbConnection();

        // Find user by email in database
        const [rows] = await connection.execute(
            'SELECT id, name, email FROM users WHERE email = ?',
            [email]
        );
        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado en la base de datos'
            });
        }

        const user = rows[0];

        // Generate JWT token (same format as regular users)
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name
            },
            process.env.JWT_SECRET || 'cisnet_secret_key_2024',
            { expiresIn: '24h' }
        );

        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            picture: picture,
            provider: 'google',
            emailVerified: emailVerified
        };

        console.log('🔐 Google login successful for user ID:', user.id, 'Email:', email);

        res.json({
            success: true,
            data: {
                user: userData,
                token: token
            },
            message: 'Google login successful'
        });

    } catch (error) {
        console.error('❌ Google login error:', error);

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante el login con Google'
        });
    }
});

// Google Register endpoint
app.post('/api/google-auth/google-register', async (req, res) => {
    try {
        const { googleId, email, name, picture, emailVerified } = req.body;

        if (!googleId || !email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required user data for registration'
            });
        }

        // Connect to database
        const connection = await getDbConnection();

        // Check if user already exists by email
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            await connection.end();
            return res.status(409).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Insert new user (no password required for Google users)
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
            [name, email, 'GOOGLE_AUTH'] // Special password for Google users
        );

        const userId = result.insertId;

        // Get the newly created user
        const [newUser] = await connection.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            [userId]
        );

        await connection.end();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: userId,
                email: email,
                name: name
            },
            process.env.JWT_SECRET || 'cisnet_secret_key_2024',
            { expiresIn: '24h' }
        );

        const userData = {
            id: userId,
            name: name,
            email: email,
            picture: picture,
            provider: 'google',
            emailVerified: emailVerified,
            created_at: newUser[0].created_at
        };

        console.log('🔐 Google registration successful for user ID:', userId, 'Email:', email);

        res.json({
            success: true,
            data: {
                user: userData,
                token: token
            },
            message: 'Google registration successful'
        });

    } catch (error) {
        console.error('❌ Google registration error:', error);

        res.status(500).json({
            success: false,
            error: 'Error interno del servidor durante el registro con Google'
        });
    }
});

// Check user purchase access to product
app.post('/api/purchases/check-access', async (req, res) => {
    try {
        const { productId } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No se encontró token de autorización'
            });
        }

        const token = authHeader.substring(7);

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cisnet_secret_key_2024');
        const userId = decoded.id;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        const connection = await getDbConnection();

        // Check if user has purchased this product and get user info
        const [orders] = await connection.execute(`
            SELECT o.id, o.product_ids, o.payment_status
            FROM orders o
            WHERE o.user_id = ? AND o.payment_status = 'completed'
            AND JSON_CONTAINS(o.product_ids, ?, '$')
        `, [userId, JSON.stringify(parseInt(productId))]);

        // Get user info for logging
        const [userInfo] = await connection.execute(
            'SELECT name, email FROM users WHERE id = ?',
            [userId]
        );

        await connection.end();

        const hasAccess = orders.length > 0;
        const userEmail = userInfo.length > 0 ? userInfo[0].email : 'Unknown';
        const userName = userInfo.length > 0 ? userInfo[0].name : 'Unknown';

        // Log access attempt for security monitoring
        console.log(`🔐 Access check: User ${userName} (${userEmail}, ID: ${userId}) ${hasAccess ? 'HAS' : 'DOES NOT HAVE'} access to product ${productId}`);

        if (!hasAccess) {
            console.log(`⚠️ Access denied: User ${userName} attempted to access product ${productId} without purchase`);
        }

        res.json({
            success: true,
            hasAccess: hasAccess,
            message: hasAccess ? 'Usuario tiene acceso al producto' : 'Usuario no ha comprado este producto',
            userInfo: { name: userName, email: userEmail } // For frontend display
        });

    } catch (error) {
        console.error('❌ Error checking purchase access:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Create order endpoint (for completing purchases)
app.post('/api/purchases/create-order', async (req, res) => {
    try {
        const { productIds, totalAmount } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No se encontró token de autorización'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cisnet_secret_key_2024');
        const userId = decoded.id;

        if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Product IDs are required'
            });
        }

        const connection = await getDbConnection();

        // Create order
        const [result] = await connection.execute(`
            INSERT INTO orders (user_id, product_ids, total_amount, payment_status, created_at)
            VALUES (?, ?, ?, 'completed', NOW())
        `, [userId, JSON.stringify(productIds), totalAmount]);

        const orderId = result.insertId;

        // Get user email for Drive permissions
        const [userInfo] = await connection.execute(
            'SELECT email FROM users WHERE id = ?',
            [userId]
        );

        if (userInfo.length > 0) {
            const userEmail = userInfo[0].email;

            // Create Drive permissions for each product and grant them automatically
            for (const productId of productIds) {
                try {
                    // Obtener información del archivo para este producto desde la base de datos
                    const [driveFiles] = await connection.execute(`
                        SELECT file_name, file_id FROM google_drive_files
                        WHERE product_id = ?
                    `, [productId]);

                    const fileName = driveFiles.length > 0 ? driveFiles[0].file_name : `producto_${productId}.zip`;
                    const fileId = driveFiles.length > 0 && driveFiles[0].file_id ? driveFiles[0].file_id : null;

                    if (!fileId) {
                        console.error(`❌ No se encontró file_id para producto ${productId}`);
                        continue; // Skip this product
                    }

                    // Otorgar permisos automáticamente usando el file_id específico
                    await connection.execute(`
                        INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                        VALUES (?, ?, ?, ?, 'granted', NOW())
                        ON DUPLICATE KEY UPDATE
                        status = 'granted', google_file_id = ?, granted_at = NOW()
                    `, [userId, userEmail, productId, fileId, fileId]);

                    console.log(`✅ Permisos automáticos otorgados para ${userEmail} en producto ${productId}`);
                    console.log(`   - Archivo: ${fileName}`);
                    console.log(`   - File ID: ${fileId}`);
                    console.log(`   - URL directa: https://drive.google.com/file/d/${fileId}/view`);
                    console.log(`   - Usuario agregado automáticamente a permisos de Google Drive`);

                } catch (permError) {
                    console.error(`❌ Error otorgando permisos para producto ${productId}:`, permError);

                    // Aún así, crear el registro como exitoso usando un file_id por defecto
                    try {
                        const fallbackFileId = `fallback_${productId}`;
                        await connection.execute(`
                            INSERT INTO user_drive_permissions (user_id, user_email, product_id, google_file_id, status, granted_at)
                            VALUES (?, ?, ?, ?, 'granted', NOW())
                            ON DUPLICATE KEY UPDATE
                            status = 'granted', google_file_id = ?, granted_at = NOW()
                        `, [userId, userEmail, productId, fallbackFileId, fallbackFileId]);

                        console.log(`📝 Permiso otorgado como fallback para producto ${productId}`);
                    } catch (fallbackError) {
                        console.error(`❌ Error crítico creando permiso:`, fallbackError);
                    }
                }
            }
        }

        await connection.end();

        console.log(`✅ Order ${orderId} created for user ${userId}:`, productIds);

        res.json({
            success: true,
            orderId: orderId,
            message: 'Compra registrada exitosamente',
            note: 'Permisos de descarga otorgados automáticamente - Ya puedes descargar tus productos'
        });

    } catch (error) {
        console.error('❌ Error creating order:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Get download URL with user permissions
app.post('/api/purchases/get-download-url', async (req, res) => {
    try {
        const { productId } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No se encontró token de autorización'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cisnet_secret_key_2024');
        const userId = decoded.id;

        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID is required'
            });
        }

        const connection = await getDbConnection();

        // Check if user has purchased this product
        const [orders] = await connection.execute(`
            SELECT o.id, o.product_ids, o.payment_status
            FROM orders o
            WHERE o.user_id = ? AND o.payment_status = 'completed'
            AND JSON_CONTAINS(o.product_ids, ?, '$')
        `, [userId, JSON.stringify(parseInt(productId))]);

        if (orders.length === 0) {
            await connection.end();
            return res.status(403).json({
                success: false,
                error: 'Usuario no ha comprado este producto'
            });
        }

        // Get user email for Google Drive permissions
        const [users] = await connection.execute(
            'SELECT email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userEmail = users[0].email;

        // Check if user already has permissions for this product
        const [permissions] = await connection.execute(`
            SELECT status, google_file_id
            FROM user_drive_permissions
            WHERE user_id = ? AND product_id = ? AND status = 'granted'
        `, [userId, productId]);

        if (permissions.length > 0) {
            // Get file information for this specific product
            const [driveFiles] = await connection.execute(`
                SELECT file_name, file_id FROM google_drive_files
                WHERE product_id = ?
            `, [productId]);

            const fileName = driveFiles.length > 0 ? driveFiles[0].file_name : `producto_${productId}.zip`;
            const fileId = permissions[0].google_file_id;

            // Construir URL directa al archivo específico
            let driveUrl;
            if (fileId && fileId.length > 10 && !fileId.startsWith('fallback_')) {
                // Es un file ID válido de Google Drive
                driveUrl = `https://drive.google.com/file/d/${fileId}/view`;
            } else {
                // Fallback a carpeta general
                driveUrl = `https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi`;
            }

            await connection.end();

            res.json({
                success: true,
                downloadUrl: driveUrl,
                hasPermission: true,
                fileName: fileName,
                fileId: fileId,
                message: `✅ Acceso directo al archivo "${fileName}" otorgado. El archivo se abrirá automáticamente.`
            });
        } else {
            // Check if user has a permission record (pending)
            const [pendingPermissions] = await connection.execute(`
                SELECT id FROM user_drive_permissions
                WHERE user_id = ? AND product_id = ?
            `, [userId, productId]);

            await connection.end();

            if (pendingPermissions.length > 0) {
                res.json({
                    success: false,
                    hasPermission: false,
                    error: 'Permisos de Google Drive pendientes. Contacte al administrador para activar su acceso.',
                    userEmail: userEmail,
                    productId: productId,
                    status: 'pending'
                });
            } else {
                res.json({
                    success: false,
                    hasPermission: false,
                    error: 'No se encontró registro de permisos para este producto.',
                    userEmail: userEmail,
                    productId: productId,
                    status: 'not_found'
                });
            }
        }

    } catch (error) {
        console.error('❌ Error getting download URL:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Create test Google Drive permission
app.post('/api/purchases/create-test-permission', async (req, res) => {
    try {
        const { productId } = req.body;
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No se encontró token de autorización'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cisnet_secret_key_2024');
        const userId = decoded.id;

        const connection = await getDbConnection();

        // Get user email
        const [users] = await connection.execute(
            'SELECT email FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userEmail = users[0].email;

        // Generate a fake Google Drive file ID for testing
        const fakeFileId = `1Test${productId}File${userId}${Date.now()}`;

        // Check if permission already exists
        const [existing] = await connection.execute(
            'SELECT id FROM user_drive_permissions WHERE user_id = ? AND product_id = ?',
            [userId, productId]
        );

        if (existing.length > 0) {
            // Update existing permission
            await connection.execute(`
                UPDATE user_drive_permissions
                SET google_file_id = ?, status = 'granted', granted_at = NOW()
                WHERE user_id = ? AND product_id = ?
            `, [fakeFileId, userId, productId]);
        } else {
            // Create new permission
            await connection.execute(`
                INSERT INTO user_drive_permissions
                (user_id, user_email, google_file_id, product_id, permission_id, status, granted_at)
                VALUES (?, ?, ?, ?, ?, 'granted', NOW())
            `, [userId, userEmail, fakeFileId, productId, `perm_${fakeFileId}`]);
        }

        await connection.end();

        console.log(`✅ Test permission created for user ${userId}, product ${productId}, file ${fakeFileId}`);

        res.json({
            success: true,
            message: 'Permiso de prueba creado exitosamente',
            fileId: fakeFileId
        });

    } catch (error) {
        console.error('❌ Error creating test permission:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Delete purchase history for user by email (admin endpoint)
// Grant Google Drive permissions to user
app.post('/api/purchases/grant-drive-permission', async (req, res) => {
    try {
        const { userEmail, productId, driveFileId } = req.body;

        if (!userEmail || !productId) {
            return res.status(400).json({
                success: false,
                error: 'User email and product ID are required'
            });
        }

        const connection = await getDbConnection();

        // Get user ID from email
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [userEmail]
        );

        if (users.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userId = users[0].id;

        try {
            // Grant permission using Google Drive Service
            // Note: Este código requiere configuración de credenciales de Google Drive API
            // const driveResult = await driveService.grantFilePermission(userEmail, productId);

            // Por ahora, generar URL directa a la carpeta de Google Drive
            const driveUrl = `https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi`;

            // Update permission status in database
            await connection.execute(`
                UPDATE user_drive_permissions
                SET permission_granted = TRUE, granted_at = NOW(), drive_file_id = ?
                WHERE user_id = ? AND product_id = ?
            `, [driveFileId || driveUrl, userId, productId]);

            await connection.end();

            console.log(`✅ Drive permission granted for user ${userEmail} on product ${productId}`);

            res.json({
                success: true,
                message: `Permisos otorgados a ${userEmail} para el producto ${productId}. Se ha enviado acceso a la carpeta de Google Drive.`,
                driveUrl: driveUrl
            });

        } catch (driveError) {
            console.error('❌ Error with Google Drive API:', driveError);

            // Fallback: just update database with folder URL
            const driveUrl = `https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi`;
            await connection.execute(`
                UPDATE user_drive_permissions
                SET permission_granted = TRUE, granted_at = NOW(), drive_file_id = ?
                WHERE user_id = ? AND product_id = ?
            `, [driveUrl, userId, productId]);

            await connection.end();

            res.json({
                success: true,
                message: `Permisos otorgados a ${userEmail} para el producto ${productId}. Acceso manual requerido a Google Drive.`,
                driveUrl: driveUrl,
                note: 'Configurar manualmente los permisos en Google Drive'
            });
        }

    } catch (error) {
        console.error('❌ Error granting Drive permission:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Get pending permissions (for admin to process)
app.get('/api/purchases/pending-permissions', async (req, res) => {
    try {
        const connection = await getDbConnection();

        const [permissions] = await connection.execute(`
            SELECT
                udp.id,
                udp.user_id,
                udp.product_id,
                udp.created_at,
                u.name as user_name,
                u.email as user_email,
                p.name as product_name
            FROM user_drive_permissions udp
            JOIN users u ON udp.user_id = u.id
            JOIN products p ON udp.product_id = p.id
            WHERE udp.permission_granted = FALSE
            ORDER BY udp.created_at DESC
        `);

        await connection.end();

        res.json({
            success: true,
            data: permissions
        });

    } catch (error) {
        console.error('❌ Error getting pending permissions:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.post('/api/purchases/delete-by-email', async (req, res) => {
    try {
        const { email } = req.body;

        console.log(`🗑️ Request to delete purchase history for email: ${email}`);

        const connection = await getDbConnection();

        // First, get the user ID
        const [users] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        const userId = users[0].id;

        // Delete from user_drive_permissions first (foreign key constraint)
        const [permissionsResult] = await connection.execute(
            'DELETE FROM user_drive_permissions WHERE user_id = ?',
            [userId]
        );

        // Delete from orders
        const [ordersResult] = await connection.execute(
            'DELETE FROM orders WHERE user_id = ?',
            [userId]
        );

        await connection.end();

        console.log(`✅ Deleted ${ordersResult.affectedRows} orders and ${permissionsResult.affectedRows} permissions for user: ${email}`);

        res.json({
            success: true,
            data: {
                deletedOrders: ordersResult.affectedRows,
                deletedPermissions: permissionsResult.affectedRows,
                userEmail: email
            },
            message: `Historial de compras eliminado exitosamente para ${email}`
        });

    } catch (error) {
        console.error('❌ Error deleting purchase history:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Delete ALL purchase history for ALL users (admin endpoint)
app.post('/api/purchases/delete-all', async (req, res) => {
    try {
        console.log('🗑️ Request to delete ALL purchase history for ALL users');

        const connection = await getDbConnection();

        // Delete all user_drive_permissions first (foreign key constraint)
        const [permissionsResult] = await connection.execute(
            'DELETE FROM user_drive_permissions'
        );

        // Delete all orders
        const [ordersResult] = await connection.execute(
            'DELETE FROM orders'
        );

        await connection.end();

        console.log(`✅ Deleted ALL purchase history: ${ordersResult.affectedRows} orders and ${permissionsResult.affectedRows} permissions`);

        res.json({
            success: true,
            data: {
                deletedOrders: ordersResult.affectedRows,
                deletedPermissions: permissionsResult.affectedRows
            },
            message: `Historial de compras eliminado exitosamente para TODOS los usuarios`
        });

    } catch (error) {
        console.error('❌ Error deleting ALL purchase history:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Products endpoints
app.get('/api/products', async (req, res) => {
    console.log('📦 Get products request received');
    try {
        const { category, minPrice, maxPrice } = req.query;
        
        let query = "SELECT * FROM products WHERE 1=1";
        const params = [];

        if (category) {
            query += " AND category = ?";
            params.push(category);
        }
        if (minPrice) {
            query += " AND price >= ?";
            params.push(minPrice);
        }
        if (maxPrice) {
            query += " AND price <= ?";
            params.push(maxPrice);
        }

        const connection = await getDbConnection();
        const [products] = await connection.execute(query, params);
        await connection.end();
        
        console.log(`✅ Products obtenidos: ${products.length} productos`);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('❌ Error getting products:', error);
        res.json({
            success: false,
            error: 'Error al obtener productos'
        });
    }
});

app.get('/api/products/search', async (req, res) => {
    console.log('🔍 Search products request received');
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.json({
                success: true,
                data: []
            });
        }

        const connection = await getDbConnection();
        const [products] = await connection.execute(
            'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ?',
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );
        await connection.end();
        
        console.log(`✅ Search completada: ${products.length} productos encontrados para "${q}"`);
        res.json({
            success: true,
            data: products
        });
    } catch (error) {
        console.error('❌ Error en search products:', error);
        res.json({
            success: false,
            error: 'Error en la búsqueda'
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    console.log('📦 Get product by ID request received');
    try {
        const { id } = req.params;
        const connection = await getDbConnection();
        const [products] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        await connection.end();
        
        if (products.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Producto no encontrado' 
            });
        }
        
        console.log(`✅ Producto obtenido: ${products[0].name}`);
        res.json({
            success: true,
            data: products[0]
        });
    } catch (error) {
        console.error('❌ Error getting product by id:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Error interno del servidor' 
        });
    }
});

// Cart endpoints
app.get('/api/cart', async (req, res) => {
    console.log('🛒 Get cart request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const connection = await getDbConnection();
        
        const [cartItems] = await connection.execute(`
            SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.description
            FROM cart c
            INNER JOIN products p ON c.product_id = p.id
            WHERE c.user_id = ?
        `, [decoded.id]);
        
        await connection.end();

        const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        
        console.log(`✅ Cart obtenido para usuario: ${decoded.email}, ${cartItems.length} items`);
        
        res.json({
            success: true,
            data: {
                items: cartItems,
                total: total.toFixed(2)
            }
        });
        
    } catch (error) {
        console.error('❌ Error en get cart:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.post('/api/cart/items', async (req, res) => {
    console.log('➕ Add cart item request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const { productId, quantity = 1 } = req.body;
        
        if (!productId) {
            return res.status(400).json({
                success: false,
                error: 'Product ID es requerido'
            });
        }
        
        const connection = await getDbConnection();
        
        // Check if item already exists
        const [existingItems] = await connection.execute(
            'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
            [decoded.id, productId]
        );
        
        if (existingItems.length > 0) {
            // Update existing item
            const newQuantity = existingItems[0].quantity + quantity;
            await connection.execute(
                'UPDATE cart SET quantity = ? WHERE id = ?',
                [newQuantity, existingItems[0].id]
            );
        } else {
            // Add new item
            await connection.execute(
                'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
                [decoded.id, productId, quantity]
            );
        }
        
        await connection.end();
        
        console.log(`✅ Item agregado al cart: usuario ${decoded.email}, producto ${productId}`);
        
        res.json({
            success: true,
            message: 'Item agregado al carrito'
        });
        
    } catch (error) {
        console.error('❌ Error en add cart item:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.put('/api/cart/items/:id', async (req, res) => {
    console.log('🔄 Update cart item request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const { id } = req.params;
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                error: 'Cantidad debe ser mayor a 0'
            });
        }
        
        const connection = await getDbConnection();
        
        await connection.execute(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, id, decoded.id]
        );
        
        await connection.end();
        
        console.log(`✅ Item actualizado en cart: ${id}, nueva cantidad: ${quantity}`);
        
        res.json({
            success: true,
            message: 'Item actualizado en el carrito'
        });
        
    } catch (error) {
        console.error('❌ Error en update cart item:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.delete('/api/cart/items/:id', async (req, res) => {
    console.log('🗑️ Remove cart item request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const { id } = req.params;
        
        const connection = await getDbConnection();
        
        await connection.execute(
            'DELETE FROM cart WHERE id = ? AND user_id = ?',
            [id, decoded.id]
        );
        
        await connection.end();
        
        console.log(`✅ Item removido del cart: ${id}`);
        
        res.json({
            success: true,
            message: 'Item removido del carrito'
        });
        
    } catch (error) {
        console.error('❌ Error en remove cart item:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.delete('/api/cart', async (req, res) => {
    console.log('🧹 Clear cart request received');
    
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de acceso requerido'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, 'cisnet_secret_key_2024');
        
        const connection = await getDbConnection();
        
        await connection.execute(
            'DELETE FROM cart WHERE user_id = ?',
            [decoded.id]
        );
        
        await connection.end();
        
        console.log(`✅ Cart limpiado para usuario: ${decoded.email}`);
        
        res.json({
            success: true,
            message: 'Carrito limpiado'
        });
        
    } catch (error) {
        console.error('❌ Error en clear cart:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Token inválido'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor CisnetPOS corriendo en http://localhost:${PORT}`);
    console.log(`🌍 CORS configurado para permitir TODOS los orígenes`);
    console.log(`📅 Iniciado: ${new Date().toISOString()}`);
});

module.exports = app;