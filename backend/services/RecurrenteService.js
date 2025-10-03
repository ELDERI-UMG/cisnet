/**
 * Recurrente Payment Gateway Service
 * Integración con la API de Recurrente (recurrente.com) para Guatemala
 *
 * Documentación: https://docs.recurrente.com/
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

class RecurrenteService {
    constructor() {
        this.publicKey = process.env.RECURRENTE_PUBLIC_KEY;
        this.secretKey = process.env.RECURRENTE_SECRET_KEY;
        this.webhookSecret = process.env.RECURRENTE_WEBHOOK_SECRET;
        this.mode = process.env.RECURRENTE_MODE || 'test';

        // API Base URLs
        this.baseUrl = this.mode === 'live'
            ? 'https://api.recurrente.com/v1'
            : 'https://api.recurrente.com/v1'; // Recurrente usa misma URL para test/live

        console.log(`🔧 RecurrenteService initialized in ${this.mode} mode`);
    }

    /**
     * Valida que las credenciales estén configuradas
     */
    validateCredentials() {
        if (!this.secretKey || !this.publicKey) {
            throw new Error('Recurrente credentials not configured. Check .env file.');
        }

        if (this.mode === 'test') {
            if (!this.secretKey.startsWith('sk_test_')) {
                console.warn('⚠️ Warning: Using non-test secret key in test mode');
            }
        }
    }

    /**
     * Crea una sesión de checkout en Recurrente
     *
     * @param {Object} params - Parámetros del checkout
     * @param {Array} params.products - Array de productos [{id, name, price, quantity}]
     * @param {Number} params.amount - Monto total en la moneda especificada
     * @param {String} params.currency - Moneda (GTQ, USD)
     * @param {String} params.customerEmail - Email del cliente
     * @param {String} params.customerName - Nombre del cliente
     * @param {String} params.successUrl - URL de retorno exitoso
     * @param {String} params.cancelUrl - URL de cancelación
     * @param {Object} params.metadata - Metadata adicional
     * @returns {Promise<Object>} - Objeto con sessionId y checkoutUrl
     */
    async createCheckoutSession(params) {
        try {
            this.validateCredentials();

            const {
                products,
                amount,
                currency = 'GTQ',
                customerEmail,
                customerName,
                successUrl,
                cancelUrl,
                metadata = {}
            } = params;

            // Validaciones
            if (!amount || amount <= 0) {
                throw new Error('Invalid amount');
            }
            if (!customerEmail) {
                throw new Error('Customer email is required');
            }
            if (!successUrl || !cancelUrl) {
                throw new Error('Success and cancel URLs are required');
            }

            // Generar un session ID único
            const sessionId = `rec_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Preparar datos de la sesión
            const sessionData = {
                id: sessionId,
                amount: Math.round(amount * 100), // En centavos
                currency: currency.toUpperCase(),
                description: this.generateDescription(products),
                customer: {
                    email: customerEmail,
                    name: customerName || customerEmail.split('@')[0]
                },
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    ...metadata,
                    products: JSON.stringify(products.map(p => ({
                        id: p.id,
                        name: p.name,
                        quantity: p.quantity || 1,
                        price: p.price
                    }))),
                    integration: 'cisnet',
                    timestamp: new Date().toISOString()
                },
                mode: this.mode,
                status: 'pending',
                payment_status: 'unpaid',
                created_at: new Date().toISOString()
            };

            console.log('📤 Creating checkout session (simulator mode):', {
                sessionId,
                amount: sessionData.amount,
                currency: sessionData.currency,
                customer: sessionData.customer.email
            });

            // Guardar sesión en memoria global (para test/demo)
            global.recurrenteSessions = global.recurrenteSessions || {};
            global.recurrenteSessions[sessionId] = sessionData;

            // URL del simulador de checkout
            const checkoutUrl = `${successUrl.split('/recurrente-callback')[0]}/checkout-redirect.html?session_id=${sessionId}`;

            console.log('✅ Checkout session created:', sessionId);

            return {
                success: true,
                sessionId: sessionId,
                checkoutUrl: checkoutUrl,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
                publicKey: this.publicKey
            };

        } catch (error) {
            console.error('❌ Error creating Recurrente checkout session:', error.message);
            throw error;
        }
    }

    /**
     * Verifica el estado de un pago
     *
     * @param {String} sessionId - ID de la sesión de checkout
     * @returns {Promise<Object>} - Estado del pago
     */
    async verifyPayment(sessionId) {
        try {
            this.validateCredentials();

            if (!sessionId) {
                throw new Error('Session ID is required');
            }

            console.log('🔍 Verifying payment for session:', sessionId);

            // Buscar sesión en memoria global (modo simulador)
            global.recurrenteSessions = global.recurrenteSessions || {};
            const session = global.recurrenteSessions[sessionId];

            if (!session) {
                return {
                    success: false,
                    error: 'Session not found'
                };
            }

            console.log('✅ Payment verification result:', {
                sessionId: session.id,
                status: session.status,
                paymentStatus: session.payment_status
            });

            return {
                success: true,
                sessionId: session.id,
                status: session.status, // pending, completed, expired, cancelled
                paymentStatus: session.payment_status,
                amount: session.amount / 100, // Convertir de centavos
                currency: session.currency,
                customer: session.customer,
                metadata: session.metadata,
                paidAt: session.paid_at,
                createdAt: session.created_at
            };

        } catch (error) {
            console.error('❌ Error verifying payment:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Procesa y valida un webhook de Recurrente
     *
     * @param {Object} payload - Cuerpo del webhook
     * @param {String} signature - Firma del webhook (header)
     * @returns {Promise<Object>} - Datos del evento procesado
     */
    async processWebhook(payload, signature) {
        try {
            // Validar firma del webhook
            if (!this.verifyWebhookSignature(payload, signature)) {
                throw new Error('Invalid webhook signature');
            }

            const event = payload;

            console.log('📨 Webhook received:', {
                type: event.type,
                id: event.data?.id
            });

            // Procesar según el tipo de evento
            switch (event.type) {
                case 'checkout.session.completed':
                    return await this.handleSessionCompleted(event.data);

                case 'checkout.session.expired':
                    return await this.handleSessionExpired(event.data);

                case 'payment.succeeded':
                    return await this.handlePaymentSucceeded(event.data);

                case 'payment.failed':
                    return await this.handlePaymentFailed(event.data);

                default:
                    console.log('ℹ️ Unhandled webhook event type:', event.type);
                    return { success: true, handled: false };
            }

        } catch (error) {
            console.error('❌ Error processing webhook:', error.message);
            throw error;
        }
    }

    /**
     * Verifica la firma de un webhook
     *
     * @param {Object} payload - Cuerpo del webhook
     * @param {String} signature - Firma recibida
     * @returns {Boolean} - True si la firma es válida
     */
    verifyWebhookSignature(payload, signature) {
        if (!this.webhookSecret) {
            console.warn('⚠️ Webhook secret not configured, skipping signature verification');
            return true; // En desarrollo, permitir sin firma
        }

        try {
            const payloadString = JSON.stringify(payload);
            const expectedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payloadString)
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(signature),
                Buffer.from(expectedSignature)
            );
        } catch (error) {
            console.error('❌ Error verifying webhook signature:', error.message);
            return false;
        }
    }

    /**
     * Maneja el evento de sesión completada
     */
    async handleSessionCompleted(session) {
        console.log('✅ Checkout session completed:', session.id);

        return {
            success: true,
            handled: true,
            event: 'session.completed',
            sessionId: session.id,
            amount: session.amount / 100,
            currency: session.currency,
            customer: session.customer,
            metadata: session.metadata
        };
    }

    /**
     * Maneja el evento de sesión expirada
     */
    async handleSessionExpired(session) {
        console.log('⏰ Checkout session expired:', session.id);

        return {
            success: true,
            handled: true,
            event: 'session.expired',
            sessionId: session.id
        };
    }

    /**
     * Maneja el evento de pago exitoso
     */
    async handlePaymentSucceeded(payment) {
        console.log('💰 Payment succeeded:', payment.id);

        return {
            success: true,
            handled: true,
            event: 'payment.succeeded',
            paymentId: payment.id,
            sessionId: payment.session_id,
            amount: payment.amount / 100,
            currency: payment.currency
        };
    }

    /**
     * Maneja el evento de pago fallido
     */
    async handlePaymentFailed(payment) {
        console.log('❌ Payment failed:', payment.id);

        return {
            success: true,
            handled: true,
            event: 'payment.failed',
            paymentId: payment.id,
            sessionId: payment.session_id,
            reason: payment.failure_reason
        };
    }

    /**
     * Realiza una petición a la API de Recurrente
     *
     * @param {String} endpoint - Endpoint de la API
     * @param {String} method - Método HTTP
     * @param {Object} data - Datos a enviar
     * @returns {Promise<Object>} - Respuesta de la API
     */
    async makeApiRequest(endpoint, method = 'GET', data = null) {
        const url = `${this.baseUrl}${endpoint}`;

        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.secretKey}`,
                'User-Agent': 'CisNet/1.0'
            }
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.error?.message || `HTTP ${response.status}`);
            }

            return {
                success: true,
                data: responseData
            };

        } catch (error) {
            console.error(`❌ API Request failed [${method} ${endpoint}]:`, error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Genera descripción del pedido basada en productos
     */
    generateDescription(products) {
        if (!products || products.length === 0) {
            return 'Compra en CisNet';
        }

        if (products.length === 1) {
            return `${products[0].name}`;
        }

        if (products.length === 2) {
            return `${products[0].name} y ${products[1].name}`;
        }

        return `${products[0].name} y ${products.length - 1} más`;
    }

    /**
     * Obtiene la clave pública (segura para usar en frontend)
     */
    getPublicKey() {
        return this.publicKey;
    }

    /**
     * Verifica si está en modo de prueba
     */
    isTestMode() {
        return this.mode === 'test';
    }
}

module.exports = new RecurrenteService();
