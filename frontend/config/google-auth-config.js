class GoogleAuthConfig {
    constructor() {
        this.clientId = '245143519733-76krc6317q8trft38s9rph2kl90afkig.apps.googleusercontent.com';
        this.initialized = false;
    }

    // Initialize Google Auth
    async initialize() {
        if (this.initialized) return;

        try {
            await this.loadGoogleAPIs();
            await this.initializeGoogleSignIn();
            this.initialized = true;
            console.log('✅ Google Auth initialized');
        } catch (error) {
            console.error('❌ Error initializing Google Auth:', error);
            throw error;
        }
    }

    // Load Google APIs script
    loadGoogleAPIs() {
        return new Promise((resolve, reject) => {
            if (window.google && window.google.accounts) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;

            script.onload = () => resolve();
            script.onerror = (error) => reject(error);

            document.head.appendChild(script);
        });
    }

    // Initialize Google Sign-In
    async initializeGoogleSignIn() {
        return new Promise((resolve, reject) => {
            if (!window.google || !window.google.accounts) {
                reject(new Error('Google APIs not loaded'));
                return;
            }

            try {
                window.google.accounts.id.initialize({
                    client_id: this.clientId,
                    callback: this.handleCredentialResponse.bind(this),
                    auto_select: false,
                    cancel_on_tap_outside: false,
                    use_fedcm_for_prompt: false,
                    itp_support: true
                });
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // Handle Google credential response
    async handleCredentialResponse(response) {
        try {
            console.log('🔐 Google credential received:', response);

            if (!response.credential) {
                console.error('❌ No credential in response:', response);
                throw new Error('No credential received from Google');
            }

            // Decode JWT token to get user info
            const userInfo = this.decodeJWT(response.credential);
            console.log('👤 User info from Google:', userInfo);

            // Validate required fields
            if (!userInfo.email || !userInfo.sub) {
                console.error('❌ Missing required user info:', userInfo);
                throw new Error('Invalid user information from Google');
            }

            // Create user object
            const googleUser = {
                googleId: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name || userInfo.email,
                picture: userInfo.picture || '',
                emailVerified: userInfo.email_verified || false,
                provider: 'google'
            };

            console.log('📦 Processed Google user:', googleUser);

            // Process authentication
            if (window.authController) {
                console.log('🚀 Calling authController.handleGoogleAuth...');
                await window.authController.handleGoogleAuth(googleUser);
            } else {
                console.error('❌ AuthController not available');
                throw new Error('AuthController not initialized');
            }

        } catch (error) {
            console.error('❌ Error handling Google credential:', error);
            if (window.authController) {
                window.authController.showMessage('Error al procesar autenticación de Google: ' + error.message, 'error');
            } else {
                alert('Error al procesar autenticación de Google: ' + error.message);
            }
        }
    }

    // Decode JWT token
    decodeJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('❌ Error decoding JWT:', error);
            throw new Error('Invalid Google token');
        }
    }

    // Render Google Sign-In button
    renderSignInButton(containerId) {
        if (!this.initialized) {
            console.error('❌ Google Auth not initialized');
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) {
            console.error('❌ Container not found:', containerId);
            return;
        }

        try {
            // Clear any existing content
            container.innerHTML = '';

            window.google.accounts.id.renderButton(container, {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'continue_with',
                shape: 'rectangular',
                logo_alignment: 'left',
                width: '100%',
                locale: 'es'
            });

            console.log('✅ Google Sign-In button rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering Google Sign-In button:', error);
            // Fallback: Create manual button
            container.innerHTML = `
                <button onclick="window.googleAuth.promptGoogleSignIn()"
                        style="width: 100%; padding: 12px; border: 1px solid #dadce0; border-radius: 4px; background: white; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style="width: 18px; height: 18px;">
                    <span>Continuar con Google</span>
                </button>
            `;
        }
    }

    // Prompt Google Sign-In (manual trigger)
    promptGoogleSignIn() {
        if (window.google && window.google.accounts) {
            try {
                window.google.accounts.id.prompt((notification) => {
                    console.log('Google Sign-In prompt result:', notification);
                    if (notification.isNotDisplayed()) {
                        console.error('Google Sign-In prompt was not displayed:', notification.getNotDisplayedReason());
                    }
                });
            } catch (error) {
                console.error('❌ Error prompting Google Sign-In:', error);
            }
        } else {
            console.error('❌ Google APIs not loaded');
        }
    }

    // Sign out from Google
    signOut() {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
    }
}

// Create global instance
window.googleAuth = new GoogleAuthConfig();

// Initialize when the app is ready
window.addEventListener('appReady', async () => {
    console.log('📡 App ready - initializing Google Auth');
    try {
        await window.googleAuth.initialize();
    } catch (error) {
        console.error('❌ Failed to initialize Google Auth:', error);
    }
});