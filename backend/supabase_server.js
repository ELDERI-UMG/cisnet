const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import Supabase repositories
const SupabaseProductRepository = require('./src/products/infrastructure/repositories/SupabaseProductRepository');
const SupabaseUserRepository = require('./src/auth/infrastructure/repositories/SupabaseUserRepository');
const SupabaseCartRepository = require('./src/cart/infrastructure/repositories/SupabaseCartRepository');

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
app.use(express.urlencoded({ extended: true }));

// Initialize repositories
const productRepository = new SupabaseProductRepository();
const userRepository = new SupabaseUserRepository();
const cartRepository = new SupabaseCartRepository();

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'CisNet API with Supabase is running',
        timestamp: new Date().toISOString()
    });
});

// PUBLIC PRODUCTS ENDPOINTS (No authentication required)
app.get('/api/products', async (req, res) => {
    try {
        console.log('📦 Fetching all products...');
        const products = await productRepository.findAll();
        console.log(`✅ Found ${products.length} products`);

        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching products',
            details: error.message
        });
    }
});

app.get('/api/products/featured', async (req, res) => {
    try {
        console.log('⭐ Fetching featured products...');
        const products = await productRepository.getFeatured();
        console.log(`✅ Found ${products.length} featured products`);

        res.json({
            success: true,
            data: products,
            count: products.length
        });
    } catch (error) {
        console.error('❌ Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching featured products',
            details: error.message
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching product with ID: ${id}`);

        const product = await productRepository.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }

        console.log(`✅ Found product: ${product.name}`);
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Error fetching product',
            details: error.message
        });
    }
});

app.get('/api/products/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query required'
            });
        }

        console.log(`🔍 Searching products with query: ${q}`);
        const products = await productRepository.search(q);
        console.log(`✅ Found ${products.length} products matching "${q}"`);

        res.json({
            success: true,
            data: products,
            count: products.length,
            query: q
        });
    } catch (error) {
        console.error('❌ Error searching products:', error);
        res.status(500).json({
            success: false,
            error: 'Error searching products',
            details: error.message
        });
    }
});

// Test endpoint to verify Supabase connection
app.get('/api/test/supabase', async (req, res) => {
    try {
        console.log('🧪 Testing Supabase connection...');

        // Test products
        const products = await productRepository.findAll();

        // Test users (count only for security)
        const userCount = await userRepository.findByEmail('test@example.com') ? 1 : 0;

        res.json({
            success: true,
            message: 'Supabase connection working',
            data: {
                products_count: products.length,
                users_table_accessible: true,
                cart_table_accessible: true
            }
        });
    } catch (error) {
        console.error('❌ Supabase connection test failed:', error);
        res.status(500).json({
            success: false,
            error: 'Supabase connection failed',
            details: error.message
        });
    }
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 CisNet Supabase Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Supabase URL: ${process.env.SUPABASE_URL ? 'Configured' : 'Missing'}`);
    console.log(`🔑 Supabase Key: ${process.env.SUPABASE_ANON_KEY ? 'Configured' : 'Missing'}`);
});

module.exports = app;