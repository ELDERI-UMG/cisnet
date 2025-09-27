const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Products data
const PRODUCTS = [
    {
        id: '1',
        name: 'Microsoft Office 365',
        description: 'Suite completa de productividad con Word, Excel, PowerPoint y más',
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
        description: 'Herramientas profesionales para diseño gráfico y multimedia',
        price: 199.99,
        category: 'Diseño',
        image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300',
        featured: true,
        active: true
    },
    {
        id: '5',
        name: 'Sistema de Inventarios',
        description: 'Control de stock y almacén',
        price: 149.99,
        category: 'Software',
        image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300',
        featured: false,
        active: true
    }
];

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CisNet API is running',
        timestamp: new Date().toISOString(),
        products_count: PRODUCTS.length
    });
});

// Get all products
app.get('/api/products', (req, res) => {
    try {
        console.log('📦 Serving products...');

        res.json({
            success: true,
            data: PRODUCTS,
            count: PRODUCTS.length
        });
    } catch (error) {
        console.error('❌ Error serving products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching products'
        });
    }
});

// Get featured products
app.get('/api/products/featured', (req, res) => {
    try {
        const featured = PRODUCTS.filter(p => p.featured);

        res.json({
            success: true,
            data: featured,
            count: featured.length
        });
    } catch (error) {
        console.error('❌ Error serving featured products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching featured products'
        });
    }
});

// Get product by ID
app.get('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        const product = PRODUCTS.find(p => p.id === id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('❌ Error serving product:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching product'
        });
    }
});

// Search products
app.get('/api/products/search', (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query required'
            });
        }

        const results = PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.description.toLowerCase().includes(q.toLowerCase()) ||
            p.category.toLowerCase().includes(q.toLowerCase())
        );

        res.json({
            success: true,
            data: results,
            count: results.length,
            query: q
        });
    } catch (error) {
        console.error('❌ Error searching products:', error);
        res.status(500).json({
            success: false,
            error: 'Error searching products'
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: [
            'GET /api/health',
            'GET /api/products',
            'GET /api/products/featured',
            'GET /api/products/:id',
            'GET /api/products/search?q=term'
        ]
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 CisNet Server running on port ${PORT}`);
        console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
}

module.exports = app;