// Vercel Serverless Function - Ultra simple
module.exports = (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { url } = req;
    console.log('Request URL:', url);

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

    // Products endpoint
    if (url === '/api/products' || url.startsWith('/api/products')) {
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

        // Featured products
        if (url === '/api/products/featured') {
            const featured = products.filter(p => p.featured);
            return res.json({
                success: true,
                data: featured,
                count: featured.length
            });
        }

        // Individual product
        if (url.match(/\/api\/products\/\d+$/)) {
            const id = url.split('/').pop();
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

    // 404 for other routes
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available: [
            '/api/health',
            '/api/products',
            '/api/products/featured',
            '/api/products/1'
        ]
    });
};