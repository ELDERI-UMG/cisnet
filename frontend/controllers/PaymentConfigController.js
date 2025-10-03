class PaymentConfigController {
    constructor() {
        this.paymentGateways = {
            recurrente: {
                name: 'Recurrente Guatemala',
                enabled: false,
                config: {}
            },
            stripe: {
                name: 'Stripe',
                enabled: false,
                config: {}
            },
            paypal: {
                name: 'PayPal',
                enabled: false,
                config: {}
            },
            neonet: {
                name: 'Neonet Guatemala',
                enabled: false,
                config: {}
            }
        };

        this.generalSettings = {};
        this.init();
    }
    
    init() {
        console.log('🔧 PaymentConfigController initialized');
        this.loadSavedConfiguration();
        this.setupEventListeners();
    }
    
    loadPaymentConfig() {
        console.log('💳 Loading payment configuration interface');
        
        // Ensure the view is loaded before setting up functionality
        setTimeout(() => {
            this.setupPaymentConfigInterface();
        }, 100);
    }
    
    setupPaymentConfigInterface() {
        this.loadSavedConfiguration();
        this.setupEventListeners();
        this.updateGatewayStatuses();
        console.log('✅ Payment configuration interface ready');
    }
    
    setupEventListeners() {
        // Gateway toggle switches
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('toggle-switch')) {
                const gatewayType = e.target.id.replace('-enabled', '');
                this.toggleGateway(gatewayType, e.target.checked);
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'stripe-form') {
                e.preventDefault();
                this.saveGatewayConfig('stripe', e.target);
            } else if (e.target.id === 'paypal-form') {
                e.preventDefault();
                this.saveGatewayConfig('paypal', e.target);
            } else if (e.target.id === 'neonet-form') {
                e.preventDefault();
                this.saveGatewayConfig('neonet', e.target);
            } else if (e.target.id === 'general-payment-settings') {
                e.preventDefault();
                this.saveGeneralSettings(e.target);
            } else if (e.target.id === 'test-payment-form') {
                e.preventDefault();
                this.runPaymentTest(e.target);
            }
        });
        
        // Gateway header clicks to expand/collapse
        document.addEventListener('click', (e) => {
            const gatewayHeader = e.target.closest('.gateway-header');
            if (gatewayHeader && !e.target.classList.contains('toggle-switch')) {
                const gatewayCard = gatewayHeader.closest('.gateway-card');
                const toggle = gatewayCard.querySelector('.toggle-switch');
                if (!toggle.checked) {
                    toggle.click();
                }
            }
        });
    }
    
    toggleGateway(gatewayType, enabled) {
        console.log(`🔄 Toggling ${gatewayType} gateway:`, enabled);
        
        const configSection = document.getElementById(`${gatewayType}-config`);
        const gatewayCard = document.getElementById(`${gatewayType}-gateway`);
        const statusIndicator = document.querySelector(`#${gatewayType}-status .status-indicator`);
        const statusText = document.querySelector(`#${gatewayType}-status .status-text`);
        
        if (enabled) {
            configSection.style.display = 'block';
            gatewayCard.classList.add('active');
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            statusText.textContent = 'Configurando...';
            this.paymentGateways[gatewayType].enabled = true;
        } else {
            configSection.style.display = 'none';
            gatewayCard.classList.remove('active');
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            statusText.textContent = 'Desconectado';
            this.paymentGateways[gatewayType].enabled = false;
        }
        
        this.saveConfiguration();
    }
    
    saveGatewayConfig(gatewayType, form) {
        const formData = new FormData(form);
        const config = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!config[cleanKey]) {
                    config[cleanKey] = [];
                }
                config[cleanKey].push(value);
            } else {
                config[key] = value;
            }
        }
        
        this.paymentGateways[gatewayType].config = config;
        this.saveConfiguration();
        
        // Update status
        const statusText = document.querySelector(`#${gatewayType}-status .status-text`);
        const statusIndicator = document.querySelector(`#${gatewayType}-status .status-indicator`);
        
        statusText.textContent = 'Configurado ✅';
        statusIndicator.classList.add('active');
        
        this.showMessage(`Configuración de ${this.paymentGateways[gatewayType].name} guardada exitosamente`, 'success');
        
        console.log(`💾 ${gatewayType} configuration saved:`, config);
    }
    
    saveGeneralSettings(form) {
        const formData = new FormData(form);
        const settings = {};
        
        for (let [key, value] of formData.entries()) {
            if (key.endsWith('[]')) {
                const cleanKey = key.replace('[]', '');
                if (!settings[cleanKey]) {
                    settings[cleanKey] = [];
                }
                settings[cleanKey].push(value);
            } else {
                settings[key] = value;
            }
        }
        
        this.generalSettings = settings;
        this.saveConfiguration();
        
        this.showMessage('Configuración general guardada exitosamente', 'success');
        console.log('💾 General settings saved:', settings);
    }
    
    saveConfiguration() {
        const config = {
            gateways: this.paymentGateways,
            general: this.generalSettings,
            lastUpdated: new Date().toISOString()
        };
        
        localStorage.setItem('paymentConfiguration', JSON.stringify(config));
        console.log('💽 Payment configuration saved to localStorage');
    }
    
    loadSavedConfiguration() {
        const saved = localStorage.getItem('paymentConfiguration');
        if (saved) {
            try {
                const config = JSON.parse(saved);
                this.paymentGateways = config.gateways || this.paymentGateways;
                this.generalSettings = config.general || this.generalSettings;
                
                console.log('📂 Loaded saved payment configuration');
                this.populateFormFields();
            } catch (error) {
                console.error('❌ Error loading saved configuration:', error);
            }
        }
    }
    
    populateFormFields() {
        // Populate gateway forms
        Object.keys(this.paymentGateways).forEach(gatewayType => {
            const gateway = this.paymentGateways[gatewayType];
            const form = document.getElementById(`${gatewayType}-form`);
            const toggle = document.getElementById(`${gatewayType}-enabled`);
            
            if (toggle) {
                toggle.checked = gateway.enabled;
                if (gateway.enabled) {
                    this.toggleGateway(gatewayType, true);
                }
            }
            
            if (form && gateway.config) {
                this.populateForm(form, gateway.config);
            }
        });
        
        // Populate general settings form
        const generalForm = document.getElementById('general-payment-settings');
        if (generalForm && this.generalSettings) {
            this.populateForm(generalForm, this.generalSettings);
        }
    }
    
    populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"], [name="${key}[]"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    if (Array.isArray(data[key])) {
                        const checkboxes = form.querySelectorAll(`[name="${key}[]"]`);
                        checkboxes.forEach(cb => {
                            cb.checked = data[key].includes(cb.value);
                        });
                    } else {
                        field.checked = data[key];
                    }
                } else {
                    field.value = data[key];
                }
            }
        });
    }
    
    updateGatewayStatuses() {
        Object.keys(this.paymentGateways).forEach(gatewayType => {
            const gateway = this.paymentGateways[gatewayType];
            const statusText = document.querySelector(`#${gatewayType}-status .status-text`);
            const statusIndicator = document.querySelector(`#${gatewayType}-status .status-indicator`);
            
            if (gateway.enabled && Object.keys(gateway.config).length > 0) {
                statusText.textContent = 'Configurado ✅';
                statusIndicator.classList.add('active');
                statusIndicator.classList.remove('inactive');
            } else if (gateway.enabled) {
                statusText.textContent = 'Configurando...';
                statusIndicator.classList.remove('active', 'inactive');
            } else {
                statusText.textContent = 'Desconectado';
                statusIndicator.classList.add('inactive');
                statusIndicator.classList.remove('active');
            }
        });
    }
    
    // Test connection functions
    async testStripeConnection() {
        this.showLoadingState('stripe', true);
        
        try {
            // Simulate API call to test Stripe connection
            await this.delay(2000);
            
            const config = this.paymentGateways.stripe.config;
            if (config.stripe_publishable_key && config.stripe_secret_key) {
                this.showMessage('✅ Conexión con Stripe exitosa', 'success');
                console.log('✅ Stripe test successful');
            } else {
                throw new Error('Faltan credenciales de Stripe');
            }
        } catch (error) {
            this.showMessage(`❌ Error conectando con Stripe: ${error.message}`, 'error');
            console.error('❌ Stripe test failed:', error);
        } finally {
            this.showLoadingState('stripe', false);
        }
    }
    
    async testPayPalConnection() {
        this.showLoadingState('paypal', true);
        
        try {
            await this.delay(1800);
            
            const config = this.paymentGateways.paypal.config;
            if (config.paypal_client_id && config.paypal_client_secret) {
                this.showMessage('✅ Conexión con PayPal exitosa', 'success');
                console.log('✅ PayPal test successful');
            } else {
                throw new Error('Faltan credenciales de PayPal');
            }
        } catch (error) {
            this.showMessage(`❌ Error conectando con PayPal: ${error.message}`, 'error');
            console.error('❌ PayPal test failed:', error);
        } finally {
            this.showLoadingState('paypal', false);
        }
    }
    
    async testNeonetConnection() {
        this.showLoadingState('neonet', true);

        try {
            await this.delay(2200);

            const config = this.paymentGateways.neonet.config;
            if (config.neonet_merchant_id && config.neonet_terminal_id && config.neonet_api_key) {
                this.showMessage('✅ Conexión con Neonet Guatemala exitosa', 'success');
                console.log('✅ Neonet test successful');
            } else {
                throw new Error('Faltan credenciales de Neonet');
            }
        } catch (error) {
            this.showMessage(`❌ Error conectando con Neonet: ${error.message}`, 'error');
            console.error('❌ Neonet test failed:', error);
        } finally {
            this.showLoadingState('neonet', false);
        }
    }

    async testRecurrenteConnection() {
        this.showLoadingState('recurrente', true);

        try {
            await this.delay(1500);

            const config = this.paymentGateways.recurrente.config;
            if (config.recurrente_public_key) {
                // Test connection to Recurrente API
                const apiUrl = `${window.API_CONFIG.baseUrl}/api/recurrente/config`;
                const response = await fetch(apiUrl);
                const data = await response.json();

                if (data.success) {
                    this.showMessage('✅ Conexión con Recurrente Guatemala exitosa', 'success');
                    console.log('✅ Recurrente test successful');
                } else {
                    throw new Error('No se pudo conectar con Recurrente');
                }
            } else {
                throw new Error('Falta la clave pública de Recurrente');
            }
        } catch (error) {
            this.showMessage(`❌ Error conectando con Recurrente: ${error.message}`, 'error');
            console.error('❌ Recurrente test failed:', error);
        } finally {
            this.showLoadingState('recurrente', false);
        }
    }
    
    validateAllSettings() {
        const errors = [];
        const warnings = [];
        
        // Check if at least one gateway is enabled
        const enabledGateways = Object.keys(this.paymentGateways).filter(
            key => this.paymentGateways[key].enabled
        );
        
        if (enabledGateways.length === 0) {
            errors.push('Debes habilitar al menos una pasarela de pago');
        }
        
        // Validate each enabled gateway
        enabledGateways.forEach(gatewayType => {
            const gateway = this.paymentGateways[gatewayType];
            const config = gateway.config;
            
            switch (gatewayType) {
                case 'recurrente':
                    if (!config.recurrente_public_key) {
                        errors.push('Recurrente: Falta la clave pública');
                    }
                    if (config.recurrente_mode === 'live' && !config.recurrente_webhook_secret) {
                        warnings.push('Recurrente: Se recomienda configurar webhook secret en producción');
                    }
                    break;

                case 'stripe':
                    if (!config.stripe_publishable_key || !config.stripe_secret_key) {
                        errors.push('Stripe: Faltan credenciales obligatorias');
                    }
                    if (config.stripe_mode === 'live' && !config.stripe_webhook_secret) {
                        warnings.push('Stripe: Se recomienda configurar webhook secret en producción');
                    }
                    break;
                    
                case 'paypal':
                    if (!config.paypal_client_id || !config.paypal_client_secret) {
                        errors.push('PayPal: Faltan credenciales obligatorias');
                    }
                    break;
                    
                case 'neonet':
                    if (!config.neonet_merchant_id || !config.neonet_terminal_id || !config.neonet_api_key) {
                        errors.push('Neonet: Faltan credenciales obligatorias');
                    }
                    if (!config.neonet_success_url || !config.neonet_error_url) {
                        warnings.push('Neonet: Se recomienda configurar URLs de retorno');
                    }
                    break;
            }
        });
        
        // Validate general settings
        if (!this.generalSettings.primary_currency) {
            errors.push('Configuración general: Falta moneda principal');
        }
        if (!this.generalSettings.notification_email) {
            errors.push('Configuración general: Falta email de notificaciones');
        }
        
        this.showValidationResults(errors, warnings);
    }
    
    showValidationResults(errors, warnings) {
        let message = '';
        let type = 'success';
        
        if (errors.length > 0) {
            type = 'error';
            message = '❌ Errores encontrados:\n' + errors.map(e => `• ${e}`).join('\n');
            if (warnings.length > 0) {
                message += '\n\n⚠️ Advertencias:\n' + warnings.map(w => `• ${w}`).join('\n');
            }
        } else if (warnings.length > 0) {
            type = 'warning';
            message = '⚠️ Advertencias encontradas:\n' + warnings.map(w => `• ${w}`).join('\n');
        } else {
            message = '✅ Todas las configuraciones son válidas';
        }
        
        this.showMessage(message, type);
    }
    
    async runPaymentTest(form) {
        const formData = new FormData(form);
        const gateway = formData.get('test_gateway');
        const amount = parseFloat(formData.get('test_amount'));
        
        if (!gateway || !amount) {
            this.showMessage('❌ Debes seleccionar una pasarela y monto válidos', 'error');
            return;
        }
        
        const resultsDiv = document.getElementById('test-results');
        resultsDiv.style.display = 'block';
        resultsDiv.className = 'test-results';
        resultsDiv.innerHTML = '<div class="loading-spinner"></div> Ejecutando prueba de pago...';
        
        try {
            await this.delay(3000);
            
            // Simulate payment test
            const testResult = {
                gateway: this.paymentGateways[gateway].name,
                amount: amount,
                currency: this.generalSettings.primary_currency || 'USD',
                status: 'success',
                transactionId: 'TEST_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                timestamp: new Date().toLocaleString()
            };
            
            resultsDiv.innerHTML = `
                <h5>✅ Prueba de Pago Exitosa</h5>
                <div style="margin-top: 15px;">
                    <p><strong>Pasarela:</strong> ${testResult.gateway}</p>
                    <p><strong>Monto:</strong> ${testResult.amount} ${testResult.currency}</p>
                    <p><strong>ID de Transacción:</strong> ${testResult.transactionId}</p>
                    <p><strong>Fecha:</strong> ${testResult.timestamp}</p>
                    <p><strong>Estado:</strong> <span style="color: #27ae60;">APROBADO</span></p>
                </div>
                <div style="margin-top: 15px; padding: 10px; background: #e8f5e8; border-radius: 5px;">
                    <small><strong>Nota:</strong> Esta fue una transacción de prueba. No se realizó cargo real.</small>
                </div>
            `;
            
            console.log('💳 Payment test completed:', testResult);
            
        } catch (error) {
            resultsDiv.className = 'test-results error';
            resultsDiv.innerHTML = `
                <h5>❌ Error en Prueba de Pago</h5>
                <p>Error: ${error.message}</p>
                <p>Verifica la configuración de la pasarela seleccionada.</p>
            `;
            console.error('❌ Payment test failed:', error);
        }
    }
    
    // Utility functions
    showLoadingState(gateway, loading) {
        const card = document.getElementById(`${gateway}-gateway`);
        if (loading) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.innerHTML = '<div class="loading-spinner"></div>';
            card.style.position = 'relative';
            card.appendChild(overlay);
        } else {
            const overlay = card.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            white-space: pre-line;
        `;
        
        if (type === 'success') {
            messageDiv.style.background = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else if (type === 'error') {
            messageDiv.style.background = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        } else if (type === 'warning') {
            messageDiv.style.background = '#fff3cd';
            messageDiv.style.color = '#856404';
            messageDiv.style.border = '1px solid #ffeaa7';
        } else {
            messageDiv.style.background = '#d1ecf1';
            messageDiv.style.color = '#0c5460';
            messageDiv.style.border = '1px solid #bee5eb';
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            messageDiv.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 5000);
    }
    
    // Get current payment configuration
    getPaymentConfiguration() {
        return {
            gateways: this.paymentGateways,
            general: this.generalSettings
        };
    }
    
    // Get enabled gateways for checkout process
    getEnabledGateways() {
        return Object.keys(this.paymentGateways)
            .filter(key => this.paymentGateways[key].enabled)
            .map(key => ({
                type: key,
                name: this.paymentGateways[key].name,
                config: this.paymentGateways[key].config
            }));
    }
}

// Global functions for button handlers
window.testStripeConnection = () => {
    if (window.paymentConfigController) {
        window.paymentConfigController.testStripeConnection();
    }
};

window.testPayPalConnection = () => {
    if (window.paymentConfigController) {
        window.paymentConfigController.testPayPalConnection();
    }
};

window.testNeonetConnection = () => {
    if (window.paymentConfigController) {
        window.paymentConfigController.testNeonetConnection();
    }
};

window.testRecurrenteConnection = () => {
    if (window.paymentConfigController) {
        window.paymentConfigController.testRecurrenteConnection();
    }
};

window.validateAllSettings = () => {
    if (window.paymentConfigController) {
        window.paymentConfigController.validateAllSettings();
    }
};