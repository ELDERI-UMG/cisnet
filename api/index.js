// Vercel Serverless Function with Cart and Purchase Support
const RecurrenteService = require('../backend/services/RecurrenteService');

// Initialize Recurrente service
const recurrenteService = new RecurrenteService();

module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url, method } = req;
    console.log('Request:', method, url);

    // Parse URL parts
    const urlParts = url.split('?')[0].split('/').filter(part => part);
    const [api, endpoint, ...subPaths] = urlParts;

    // Basic routing
    if (url === '/api' || url === '/api/') {
        return res.json({
            success: true,
            message: 'CisNet API is working',
            timestamp: new Date().toISOString()
        });
    }

    // Health check
    if (url === '/api/health') {
        return res.json({
            status: 'OK',
            message: 'Server is healthy',
            timestamp: new Date().toISOString()
        });
    }

    // Products data - Complete catalog from media-config.js
    const products = [
        {
            id: '1',
            name: 'Sistema de Facturación',
            description: 'Software completo de facturación electrónica para tu negocio',
            price: 299.99,
            category: 'Software',
            image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
            featured: true,
            active: true,
            videoId: 'dQw4w9WgXcQ'
        },
        {
            id: '2',
            name: 'Sistema POS',
            description: 'Punto de venta integrado para gestión comercial',
            price: 199.99,
            category: 'Software',
            image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
            featured: true,
            active: true,
            videoId: 'kJQP7kiw5Fk'
        },
        {
            id: '3',
            name: 'Sistema de Inventarios',
            description: 'Control avanzado de stock y almacén',
            price: 149.99,
            category: 'Software',
            image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
            featured: false,
            active: true,
            videoId: 'kJQP7kiw5Fk'
        },
        {
            id: '7',
            name: 'Microsoft Office 365',
            description: 'Suite completa de productividad con Word, Excel, PowerPoint y más',
            price: 99.99,
            category: 'Productividad',
            image_url: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=300',
            featured: true,
            active: true,
            videoId: 'OlJydEEKa5g'
        },
        {
            id: '8',
            name: 'Adobe Photoshop 2024',
            description: 'Editor de imágenes profesional líder en la industria',
            price: 149.99,
            category: 'Diseño',
            image_url: 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=300',
            featured: true,
            active: true,
            videoId: 'IyR_uYsRdPs'
        },
        {
            id: '9',
            name: 'Visual Studio Code',
            description: 'Editor de código fuente ligero pero potente para desarrolladores',
            price: 0.00,
            category: 'Desarrollo',
            image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300',
            featured: true,
            active: true,
            videoId: 'VqCgcpAypFQ'
        },
        {
            id: '10',
            name: 'Windows 11 Pro',
            description: 'Sistema operativo profesional con características avanzadas',
            price: 199.99,
            category: 'Sistema',
            image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
            featured: false,
            active: true,
            videoId: 'xzpndHX8R9E'
        },
        {
            id: '11',
            name: 'AutoCAD 2024',
            description: 'Software líder en diseño asistido por computadora',
            price: 299.99,
            category: 'Ingeniería',
            image_url: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300',
            featured: false,
            active: true,
            videoId: 'f1DgA06aRjQ'
        },
        {
            id: '12',
            name: 'Minecraft Java Edition',
            description: 'El juego de construcción y aventura más popular del mundo',
            price: 26.95,
            category: 'Juegos',
            image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
            featured: true,
            active: true,
            videoId: 'H2X61VKTU8o'
        },
        {
            id: '13',
            name: 'Norton 360 Deluxe',
            description: 'Protección completa de ciberseguridad para todos tus dispositivos',
            price: 49.99,
            category: 'Seguridad',
            image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300',
            featured: false,
            active: true,
            videoId: 'Lbfe3-v1_fY'
        },
        {
            id: '14',
            name: 'Zoom Pro',
            description: 'Plataforma profesional de videoconferencias y colaboración',
            price: 14.99,
            category: 'Comunicación',
            image_url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=300',
            featured: false,
            active: true,
            videoId: 'vFhAEoCF7jg'
        },
        {
            id: '15',
            name: 'Adobe Creative Suite',
            description: 'Herramientas profesionales completas para diseño gráfico y multimedia',
            price: 199.99,
            category: 'Diseño',
            image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300',
            featured: true,
            active: true,
            videoId: 'w8QJy8lG5AY'
        },
        {
            id: '16',
            name: 'IntelliJ IDEA Ultimate',
            description: 'IDE avanzado para desarrollo Java y tecnologías empresariales',
            price: 149.00,
            category: 'Desarrollo',
            image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=300',
            featured: false,
            active: true,
            videoId: 'yefmcX57Eyg'
        },
        {
            id: '17',
            name: 'Spotify Premium',
            description: 'Streaming de música sin anuncios con calidad superior',
            price: 9.99,
            category: 'Entretenimiento',
            image_url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300',
            featured: false,
            active: true,
            videoId: 'KrtyypDK-0s'
        },
        {
            id: '18',
            name: 'VMware Workstation Pro',
            description: 'Virtualización profesional para ejecutar múltiples sistemas operativos',
            price: 249.99,
            category: 'Virtualización',
            image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300',
            featured: false,
            active: true,
            videoId: 'RGrbV6BZ9kw'
        }
    ];

    // Products endpoints
    if (endpoint === 'products') {
        // Featured products
        if (subPaths[0] === 'featured') {
            const featured = products.filter(p => p.featured);
            return res.json({
                success: true,
                data: featured,
                count: featured.length
            });
        }

        // Individual product
        if (subPaths[0] && subPaths[0].match(/^\d+$/)) {
            const id = subPaths[0];
            const product = products.find(p => p.id === id);

            if (!product) {
                return res.status(404).json({
                    success: false,
                    error: 'Product not found'
                });
            }

            return res.json({
                success: true,
                data: product
            });
        }

        // All products
        return res.json({
            success: true,
            data: products,
            count: products.length,
            message: 'Products loaded successfully'
        });
    }

    // Cart endpoints (simplified for demo - uses memory storage)
    if (endpoint === 'cart') {
        // Mock cart storage (in production, use database)
        const mockCart = {
            items: [],
            total: 0
        };

        if (method === 'GET') {
            // Get cart
            return res.json({
                success: true,
                data: mockCart,
                message: 'Cart retrieved successfully'
            });
        }

        if (method === 'POST' && subPaths[0] === 'items') {
            // Add item to cart
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { productId, quantity = 1 } = JSON.parse(body);
                        const product = products.find(p => p.id === String(productId));

                        if (!product) {
                            return res.status(404).json({
                                success: false,
                                error: 'Product not found'
                            });
                        }

                        // Check if item already exists (prevent duplicates)
                        const existingItem = mockCart.items.find(item => item.product_id === String(productId));
                        if (existingItem) {
                            return res.status(400).json({
                                success: false,
                                error: 'Este producto ya está en el carrito'
                            });
                        }

                        // Add item
                        const cartItem = {
                            id: Date.now(),
                            product_id: String(productId),
                            name: product.name,
                            price: product.price,
                            quantity: parseInt(quantity)
                        };

                        mockCart.items.push(cartItem);
                        mockCart.total = mockCart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                        return res.json({
                            success: true,
                            data: { item: cartItem, cart: mockCart },
                            message: 'Item added to cart'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'DELETE') {
            // Clear cart
            mockCart.items = [];
            mockCart.total = 0;
            return res.json({
                success: true,
                data: mockCart,
                message: 'Cart cleared successfully'
            });
        }
    }

    // Authentication endpoints
    if (endpoint === 'auth') {
        if (method === 'POST' && subPaths[0] === 'login') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { email, password } = JSON.parse(body);

                        // Mock admin user for demo
                        if (email === 'eddy@cisnet.com' && password === '123456') {
                            const user = {
                                id: 'admin_1',
                                name: 'Eddy Alexander',
                                email: 'eddy@cisnet.com',
                                provider: 'local'
                            };

                            const token = `token_${Date.now()}_${user.id}`;

                            return res.json({
                                success: true,
                                data: { user, token },
                                message: 'Login successful'
                            });
                        }

                        return res.status(401).json({
                            success: false,
                            error: 'Invalid email or password'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'POST' && subPaths[0] === 'register') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { name, email, password } = JSON.parse(body);

                        // Mock registration (in production, save to database)
                        return res.json({
                            success: true,
                            message: 'User registered successfully'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'POST' && subPaths[0] === 'logout') {
            return res.json({
                success: true,
                message: 'Logout successful'
            });
        }
    }

    // Google Auth endpoints
    if (endpoint === 'google-auth') {
        if (method === 'POST' && subPaths[0] === 'user-by-email') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { email } = JSON.parse(body);

                        // Check if email is in allowed test users
                        const testUsers = ['elderixcopal@gmail.com', 'eixcopala@miumg.edu.gt'];

                        if (testUsers.includes(email)) {
                            return res.json({
                                success: true,
                                user: { email }
                            });
                        }

                        return res.json({
                            success: false,
                            error: 'User not found'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'POST' && (subPaths[0] === 'google-login' || subPaths[0] === 'google-register')) {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const googleUser = JSON.parse(body);

                        // Validate test users
                        const testUsers = ['elderixcopal@gmail.com', 'eixcopala@miumg.edu.gt'];

                        if (!testUsers.includes(googleUser.email)) {
                            return res.status(403).json({
                                success: false,
                                error: 'Este email no está autorizado para acceder a la aplicación en modo prueba'
                            });
                        }

                        // Create user session
                        const user = {
                            id: `google_${googleUser.googleId}`,
                            name: googleUser.name,
                            email: googleUser.email,
                            picture: googleUser.picture,
                            provider: 'google'
                        };

                        const token = `token_${Date.now()}_${user.id}`;

                        return res.json({
                            success: true,
                            data: { user, token },
                            message: 'Google authentication successful'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }

    // Purchase endpoints
    if (endpoint === 'purchases') {
        if (method === 'POST' && subPaths[0] === 'create-order') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { productIds, totalAmount, paymentMethod, paymentId } = JSON.parse(body);

                        // Validate products exist
                        const validProducts = productIds.filter(id =>
                            products.find(p => p.id === String(id))
                        );

                        if (validProducts.length !== productIds.length) {
                            return res.status(400).json({
                                success: false,
                                error: 'Some products not found'
                            });
                        }

                        // Create mock order
                        const order = {
                            id: `order_${Date.now()}`,
                            productIds: validProducts,
                            totalAmount,
                            paymentMethod,
                            paymentId,
                            status: 'completed',
                            createdAt: new Date().toISOString()
                        };

                        console.log('✅ Order created:', order);

                        return res.json({
                            success: true,
                            data: order,
                            message: 'Order created successfully'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'POST' && subPaths[0] === 'get-download-url') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { productId } = JSON.parse(body);
                        const product = products.find(p => p.id === String(productId));

                        if (!product) {
                            return res.status(404).json({
                                success: false,
                                error: 'Product not found'
                            });
                        }

                        // Real download URLs from media-config.js
                        const downloadUrls = {
                            '1': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Sistema Facturación
                            '2': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Sistema POS
                            '3': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Sistema Inventarios
                            '7': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Microsoft Office 365
                            '8': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Adobe Photoshop
                            '9': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Visual Studio Code
                            '10': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Windows 11 Pro
                            '11': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // AutoCAD 2024
                            '12': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Minecraft Java
                            '13': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Norton 360
                            '14': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Zoom Pro
                            '15': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Adobe Creative Suite
                            '16': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // IntelliJ IDEA
                            '17': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', // Spotify Premium
                            '18': 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi'  // VMware Workstation
                        };

                        return res.json({
                            success: true,
                            downloadUrl: downloadUrls[productId] || '#',
                            fileName: `${product.name.replace(/\s+/g, '_')}.zip`,
                            message: `Descarga disponible: ${product.name}`
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        if (method === 'POST' && subPaths[0] === 'check-access') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { productId } = JSON.parse(body);
                        const product = products.find(p => p.id === String(productId));

                        if (!product) {
                            return res.status(404).json({
                                success: false,
                                error: 'Product not found'
                            });
                        }

                        // For demo purposes, always return false (user should purchase first)
                        // In production, this would check the database for user purchases
                        return res.json({
                            success: true,
                            hasAccess: false,
                            message: 'Purchase required for access'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    }

    // Recurrente Payment Gateway endpoints
    if (endpoint === 'recurrente') {
        // Create checkout session
        if (method === 'POST' && subPaths[0] === 'create-session') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', async () => {
                    try {
                        const { products, amount, currency, customerEmail, customerName, metadata } = JSON.parse(body);

                        // Get base URL for callbacks
                        const baseUrl = req.headers.origin || process.env.CORS_ORIGIN || 'https://cisnet.vercel.app';

                        // Create checkout session using Recurrente API
                        const result = await recurrenteService.createCheckoutSession({
                            products: products,
                            amount: amount,
                            currency: currency || 'GTQ',
                            customerEmail: customerEmail,
                            customerName: customerName,
                            successUrl: `${baseUrl}/frontend/recurrente-callback.html`,
                            cancelUrl: `${baseUrl}/frontend/views/cart/cart.html`,
                            metadata: {
                                ...metadata,
                                source: 'cisnet_vercel',
                                timestamp: new Date().toISOString()
                            }
                        });

                        if (!result.success) {
                            return res.status(400).json({
                                success: false,
                                error: result.error || 'Failed to create checkout session'
                            });
                        }

                        console.log('✅ Recurrente checkout session created:', result.sessionId);

                        return res.json({
                            success: true,
                            data: {
                                sessionId: result.sessionId,
                                checkoutUrl: result.checkoutUrl,
                                expiresAt: result.expiresAt,
                                publicKey: result.publicKey
                            },
                            message: 'Checkout session created successfully'
                        });
                    } catch (parseError) {
                        console.error('❌ Error parsing request:', parseError);
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                console.error('❌ Error creating session:', error);
                return res.status(500).json({
                    success: false,
                    error: error.message || 'Internal server error'
                });
            }
        }

        // Verify payment status
        if (method === 'GET' && subPaths[0] === 'verify-payment') {
            try {
                const sessionId = subPaths[1];

                if (!sessionId) {
                    return res.status(400).json({
                        success: false,
                        error: 'Session ID is required'
                    });
                }

                // Verify payment using Recurrente API
                const result = await recurrenteService.verifyPayment(sessionId);

                if (!result.success) {
                    return res.status(404).json({
                        success: false,
                        error: result.error || 'Payment verification failed'
                    });
                }

                return res.json({
                    success: true,
                    data: {
                        sessionId: result.sessionId,
                        status: result.status,
                        paymentStatus: result.paymentStatus,
                        amount: result.amount,
                        currency: result.currency,
                        customer: result.customer,
                        metadata: result.metadata,
                        paidAt: result.paidAt,
                        createdAt: result.createdAt
                    }
                });
            } catch (error) {
                console.error('❌ Error verifying payment:', error);
                return res.status(500).json({
                    success: false,
                    error: error.message || 'Error verifying payment'
                });
            }
        }

        // Complete payment (mock endpoint to simulate webhook)
        if (method === 'POST' && subPaths[0] === 'complete-payment') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const { sessionId } = JSON.parse(body);

                        global.recurrenteSessions = global.recurrenteSessions || {};
                        const session = global.recurrenteSessions[sessionId];

                        if (!session) {
                            return res.status(404).json({
                                success: false,
                                error: 'Session not found'
                            });
                        }

                        // Mark as completed
                        session.status = 'completed';
                        session.payment_status = 'paid';
                        session.paid_at = new Date().toISOString();

                        console.log('✅ Payment completed for session:', sessionId);

                        return res.json({
                            success: true,
                            message: 'Payment completed successfully'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        // Webhook endpoint
        if (method === 'POST' && subPaths[0] === 'webhook') {
            try {
                let body = '';
                req.on('data', chunk => { body += chunk; });
                req.on('end', () => {
                    try {
                        const event = JSON.parse(body);

                        console.log('📨 Recurrente webhook received:', event.type);

                        // Process webhook event
                        // In production, validate signature and process accordingly

                        return res.json({
                            success: true,
                            message: 'Webhook received'
                        });
                    } catch (parseError) {
                        return res.status(400).json({
                            success: false,
                            error: 'Invalid JSON payload'
                        });
                    }
                });
                return;
            } catch (error) {
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }

        // Get public key
        if (method === 'GET' && subPaths[0] === 'config') {
            return res.json({
                success: true,
                data: {
                    publicKey: 'pk_test_uWS5SBTkEnhI1o8f0E1Lyzvfn89Qadqumwkj5e6Gk1BQ8rFNxUMe3IAnK',
                    mode: 'test'
                }
            });
        }
    }

    // 404 for other routes
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available: [
            'GET /api/health',
            'GET /api/products',
            'GET /api/products/featured',
            'GET /api/products/1',
            'GET /api/cart',
            'POST /api/cart/items',
            'DELETE /api/cart',
            'POST /api/auth/login',
            'POST /api/auth/register',
            'POST /api/auth/logout',
            'POST /api/google-auth/user-by-email',
            'POST /api/google-auth/google-login',
            'POST /api/google-auth/google-register',
            'POST /api/purchases/create-order',
            'POST /api/purchases/get-download-url',
            'POST /api/purchases/check-access',
            'POST /api/recurrente/create-session',
            'GET /api/recurrente/verify-payment/:sessionId',
            'POST /api/recurrente/complete-payment',
            'POST /api/recurrente/webhook',
            'GET /api/recurrente/config'
        ]
    });
};