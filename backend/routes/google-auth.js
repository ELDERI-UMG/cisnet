const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Simple test route
router.get('/test', (req, res) => {
    res.json({ 
        message: 'Google Auth routes are working!',
        timestamp: new Date(),
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Loaded' : 'Not loaded'
    });
});

/**
 * Verify Google credential token securely on the server
 * POST /api/auth/google-verify
 */
router.post('/google-verify', async (req, res) => {
    try {
        const { credential, clientId } = req.body;

        if (!credential) {
            return res.status(400).json({
                success: false,
                error: 'Missing credential token'
            });
        }

        // Verify the credential token with Google
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        
        if (!payload) {
            return res.status(400).json({
                success: false,
                error: 'Invalid credential token'
            });
        }

        // Extract user information from verified token
        const googleUser = {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
            provider: 'google',
            // Additional Google profile data
            givenName: payload.given_name,
            familyName: payload.family_name,
            locale: payload.locale
        };

        console.log('✅ Google token verified for user:', googleUser.email);

        res.json({
            success: true,
            user: googleUser,
            message: 'Google authentication verified successfully'
        });

    } catch (error) {
        console.error('❌ Google token verification error:', error);
        
        res.status(400).json({
            success: false,
            error: 'Failed to verify Google token',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Handle Google login with verified user data
 * POST /api/auth/google-login
 */
router.post('/google-login', async (req, res) => {
    try {
        const { googleId, email, name, picture, emailVerified } = req.body;

        if (!googleId || !email) {
            return res.status(400).json({
                success: false,
                error: 'Missing required Google user data'
            });
        }

        // Here you would typically:
        // 1. Check if user exists in your database
        // 2. Create session or JWT token
        // 3. Return user data and authentication token

        // For now, we'll simulate a successful login
        const userData = {
            id: `google_${googleId}`,
            name: name,
            email: email,
            picture: picture,
            provider: 'google',
            emailVerified: emailVerified
        };

        // In a real implementation, you'd generate a proper JWT token
        const token = `google_token_${Date.now()}_${googleId}`;

        console.log('🔐 Google login successful for:', email);

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
            error: 'Internal server error during Google login'
        });
    }
});

/**
 * Handle Google registration with verified user data
 * POST /api/auth/google-register
 */
router.post('/google-register', async (req, res) => {
    try {
        const { googleId, email, name, picture, emailVerified } = req.body;

        if (!googleId || !email || !name) {
            return res.status(400).json({
                success: false,
                error: 'Missing required user data for registration'
            });
        }

        // Here you would typically:
        // 1. Check if user already exists
        // 2. Create new user in database
        // 3. Generate authentication token
        // 4. Send welcome email

        // For now, we'll simulate a successful registration
        const newUser = {
            id: `google_${googleId}`,
            name: name,
            email: email,
            picture: picture,
            provider: 'google',
            emailVerified: emailVerified,
            createdAt: new Date().toISOString()
        };

        // In a real implementation, you'd generate a proper JWT token
        const token = `google_token_${Date.now()}_${googleId}`;

        console.log('👤 Google registration successful for:', email);

        res.json({
            success: true,
            data: {
                user: newUser,
                token: token
            },
            message: 'Google registration successful'
        });

    } catch (error) {
        console.error('❌ Google registration error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during Google registration'
        });
    }
});

/**
 * Check if user exists by email
 * POST /api/auth/user-by-email
 */
router.post('/user-by-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }

        // Here you would check your database for existing user
        // For now, we'll simulate that users don't exist (to test registration flow)
        
        // Simulate some existing users for testing
        const existingEmails = [
            'test@example.com',
            'admin@cisnet.com',
            'demo@gmail.com'
        ];

        const userExists = existingEmails.includes(email.toLowerCase());

        if (userExists) {
            res.json({
                success: true,
                exists: true,
                message: 'User found'
            });
        } else {
            res.json({
                success: false,
                exists: false,
                message: 'User not found'
            });
        }

    } catch (error) {
        console.error('❌ User lookup error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Internal server error during user lookup'
        });
    }
});

module.exports = router;