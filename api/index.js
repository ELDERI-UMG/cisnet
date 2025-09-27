// Vercel Serverless Function with Cart and Purchase Support
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

    // Products data
    const products = [
        {
            id: '1',
            name: 'Microsoft Office 365',
            description: 'Suite completa de productividad con Word, Excel, PowerPoint',
            price: 99.99,
            category: 'Productividad',
            image_url: 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=300',
            featured: true,
            active: true
        },
        {
            id: '2',
            name: 'Sistema de Facturación',
            description: 'Software completo de facturación electrónica',
            price: 299.99,
            category: 'Software',
            image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300',
            featured: false,
            active: true
        },
        {
            id: '3',
            name: 'Sistema POS',
            description: 'Punto de venta integrado para tu negocio',
            price: 199.99,
            category: 'Software',
            image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
            featured: true,
            active: true
        },
        {
            id: '4',
            name: 'Adobe Creative Suite',
            description: 'Herramientas profesionales para diseño gráfico',
            price: 199.99,
            category: 'Diseño',
            image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300',
            featured: true,
            active: true
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

                        // Mock download URLs (in production, these would be actual files)
                        const downloadUrls = {
                            '1': 'https://drive.google.com/file/d/mock-office365-download/view',
                            '2': 'https://drive.google.com/file/d/mock-billing-system-download/view',
                            '3': 'https://drive.google.com/file/d/mock-pos-system-download/view',
                            '4': 'https://drive.google.com/file/d/mock-adobe-suite-download/view'
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
            'POST /api/purchases/create-order',
            'POST /api/purchases/get-download-url',
            'POST /api/purchases/check-access'
        ]
    });
};