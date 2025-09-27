const express = require('express');
const cors = require('cors');

// Verificar si tenemos las variables de entorno necesarias
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    console.error('❌ Missing required environment variables');
    console.error('SUPABASE_URL:', process.env.SUPABASE_URL ? 'Set' : 'Missing');
    console.error('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
}

const app = express();
const PORT = process.env.PORT || 3000;

// CORS simple para producción
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Health check simple
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CisNet API is running',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            SUPABASE_URL: process.env.SUPABASE_URL ? 'Configured' : 'Missing',
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing'
        }
    });
});

// Test endpoint simple
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API Test successful',
        timestamp: new Date().toISOString()
    });
});

// Productos mock para testing inicial
const MOCK_PRODUCTS = [
    {
        id: '1',
        name: 'Microsoft Office 365',
        description: 'Suite completa de productividad',
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
        description: 'Punto de venta integrado',
        price: 199.99,
        category: 'Software',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300',
        featured: true,
        active: true
    }
];

// Endpoint de productos con datos mock
app.get('/api/products', (req, res) => {
    try {
        console.log('📦 Serving mock products...');

        res.json({
            success: true,
            data: MOCK_PRODUCTS,
            count: MOCK_PRODUCTS.length,
            source: 'mock_data'
        });
    } catch (error) {
        console.error('❌ Error serving products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching products',
            details: error.message
        });
    }
});

// Productos destacados
app.get('/api/products/featured', (req, res) => {
    try {
        const featured = MOCK_PRODUCTS.filter(p => p.featured);

        res.json({
            success: true,
            data: featured,
            count: featured.length,
            source: 'mock_data'
        });
    } catch (error) {
        console.error('❌ Error serving featured products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching featured products',
            details: error.message
        });
    }
});

// Producto por ID
app.get('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        const product = MOCK_PRODUCTS.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product,
            source: 'mock_data'
        });
    } catch (error) {
        console.error('❌ Error serving product:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching product',
            details: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl,
        available_endpoints: [
            'GET /api/health',
            'GET /api/test',
            'GET /api/products',
            'GET /api/products/featured',
            'GET /api/products/:id'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support'
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 CisNet Simple API running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Available at: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('✅ Process terminated');
    });
});

module.exports = app;