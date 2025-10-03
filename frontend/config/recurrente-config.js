/**
 * Recurrente Payment Gateway Configuration
 * Configuración del cliente para la pasarela de pagos Recurrente (Guatemala)
 */

// Recurrente Configuration
window.RECURRENTE_CONFIG = {
    // Public Key (segura para usar en frontend)
    publicKey: 'pk_test_uWS5SBTkEnhI1o8f0E1Lyzvfn89Qadqumwkj5e6Gk1BQ8rFNxUMe3IAnK',

    // Mode: 'test' o 'live'
    mode: 'test',

    // Currency
    defaultCurrency: 'GTQ',

    // Exchange rate USD to GTQ (approximate)
    exchangeRate: 7.8,

    // Enabled
    enabled: true,

    // Display name
    displayName: 'Recurrente Guatemala',

    // Features
    features: {
        cards: true,  // Visa, Mastercard
        transfers: true,  // Transferencias bancarias
        installments: false  // Cuotas (futuro)
    },

    // Supported banks for transfers
    supportedBanks: [
        'BAM - Banco Agromercantil',
        'Banrural',
        'BAC Credomatic',
        'G&T Continental',
        'Promerica',
        'Industrial'
    ],

    // Commission info
    commission: {
        percentage: 4.5,
        fixed: 2, // Q2
        description: 'Comisión de 4.5% + Q2 por transacción'
    },

    // Test cards for development
    testCards: {
        success: '4242424242424242',
        decline: '4000000000000002',
        insufficientFunds: '4000000000009995',
        cvv: '123',
        expiry: '12/25'
    },

    // URLs
    urls: {
        checkoutBase: window.location.origin,
        successCallback: `${window.location.origin}/frontend/recurrente-callback.html`,
        errorCallback: `${window.location.origin}/frontend/recurrente-callback.html`
    },

    // UI Configuration
    ui: {
        primaryColor: '#667eea',
        secondaryColor: '#764ba2',
        icon: '🇬🇹',
        logo: null
    },

    // Validation rules
    validation: {
        minAmount: 1, // GTQ 1.00 mínimo
        maxAmount: 100000, // GTQ 100,000 máximo
        requireEmail: true,
        requireName: true,
        requirePhone: false
    }
};

// Helper functions
window.RecurrenteHelpers = {
    /**
     * Convert USD to GTQ
     */
    usdToGtq: function(amountUsd) {
        return Math.round(amountUsd * window.RECURRENTE_CONFIG.exchangeRate * 100) / 100;
    },

    /**
     * Convert GTQ to USD
     */
    gtqToUsd: function(amountGtq) {
        return Math.round((amountGtq / window.RECURRENTE_CONFIG.exchangeRate) * 100) / 100;
    },

    /**
     * Format currency
     */
    formatCurrency: function(amount, currency = 'GTQ') {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Calculate commission
     */
    calculateCommission: function(amount) {
        const percentageFee = amount * (window.RECURRENTE_CONFIG.commission.percentage / 100);
        const fixedFee = window.RECURRENTE_CONFIG.commission.fixed;
        return Math.round((percentageFee + fixedFee) * 100) / 100;
    },

    /**
     * Calculate total with commission
     */
    calculateTotal: function(amount) {
        return amount + this.calculateCommission(amount);
    },

    /**
     * Validate amount
     */
    validateAmount: function(amount) {
        const config = window.RECURRENTE_CONFIG.validation;
        if (amount < config.minAmount) {
            return {
                valid: false,
                error: `El monto mínimo es ${this.formatCurrency(config.minAmount)}`
            };
        }
        if (amount > config.maxAmount) {
            return {
                valid: false,
                error: `El monto máximo es ${this.formatCurrency(config.maxAmount)}`
            };
        }
        return { valid: true };
    },

    /**
     * Check if in test mode
     */
    isTestMode: function() {
        return window.RECURRENTE_CONFIG.mode === 'test';
    },

    /**
     * Get public key
     */
    getPublicKey: function() {
        return window.RECURRENTE_CONFIG.publicKey;
    }
};

// Log configuration (only in development)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🇬🇹 Recurrente Configuration Loaded');
    console.log('Mode:', window.RECURRENTE_CONFIG.mode);
    console.log('Public Key:', window.RECURRENTE_CONFIG.publicKey.substring(0, 20) + '...');
    console.log('Test Mode:', window.RecurrenteHelpers.isTestMode());
}
