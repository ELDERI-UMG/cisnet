class PaymentProcessorController {
    constructor() {
        this.activeGateways = [];
        this.selectedGateway = null;
        this.paymentConfigController = null;
        this.init();
    }
    
    init() {
        console.log('💳 PaymentProcessorController initialized');
        this.loadActiveGateways();
    }
    
    loadActiveGateways() {
        // Get payment configuration from PaymentConfigController
        if (window.paymentConfigController) {
            this.paymentConfigController = window.paymentConfigController;
            this.activeGateways = this.paymentConfigController.getEnabledGateways();
        } else {
            // Try to load from localStorage if controller not available
            const savedConfig = localStorage.getItem('paymentConfiguration');
            if (savedConfig) {
                try {
                    const config = JSON.parse(savedConfig);
                    this.activeGateways = Object.keys(config.gateways)
                        .filter(key => config.gateways[key].enabled)
                        .map(key => ({
                            type: key,
                            name: config.gateways[key].name,
                            config: config.gateways[key].config
                        }));
                } catch (error) {
                    console.error('❌ Error loading payment configuration:', error);
                }
            }
        }
        
        console.log('💳 Active payment gateways loaded:', this.activeGateways);
    }
    
    // Generate payment options HTML for checkout
    generatePaymentOptionsHTML() {
        if (this.activeGateways.length === 0) {
            return `
                <div class="no-payment-methods">
                    <div class="warning-message">
                        <h4>⚠️ No hay métodos de pago configurados</h4>
                        <p>Por favor, configura al menos una pasarela de pago en la sección de administración.</p>
                        <button class="btn btn-primary" onclick="window.viewManager.loadView('admin/payment-config')">
                            🔧 Configurar Pagos
                        </button>
                    </div>
                </div>
            `;
        }
        
        let optionsHTML = '<div class="payment-methods-grid">';
        
        this.activeGateways.forEach(gateway => {
            const isSelected = this.selectedGateway === gateway.type;
            
            optionsHTML += `
                <div class="payment-method-card ${isSelected ? 'selected' : ''}" 
                     data-gateway="${gateway.type}" 
                     onclick="window.paymentProcessor.selectPaymentMethod('${gateway.type}')">
                    <div class="payment-method-header">
                        ${this.getGatewayIcon(gateway.type)}
                        <h4>${gateway.name}</h4>
                        <div class="selection-indicator">
                            <div class="radio-dot ${isSelected ? 'selected' : ''}"></div>
                        </div>
                    </div>
                    <div class="payment-method-info">
                        ${this.getGatewayDescription(gateway.type)}
                    </div>
                    <div class="payment-method-features">
                        ${this.getGatewayFeatures(gateway.type)}
                    </div>
                </div>
            `;
        });
        
        optionsHTML += '</div>';
        return optionsHTML;
    }
    
    getGatewayIcon(gatewayType) {
        const icons = {
            recurrente: '<div class="gateway-icon recurrente-icon">🇬🇹</div>',
            stripe: '<div class="gateway-icon stripe-icon">💳</div>',
            paypal: '<div class="gateway-icon paypal-icon">💙</div>',
            neonet: '<div class="gateway-icon neonet-icon">🏦</div>'
        };
        return icons[gatewayType] || '<div class="gateway-icon">💰</div>';
    }

    getGatewayDescription(gatewayType) {
        const descriptions = {
            recurrente: 'Pasarela de pagos líder en Guatemala',
            stripe: 'Pago seguro con tarjeta de crédito/débito',
            paypal: 'Paga con tu cuenta PayPal o tarjeta',
            neonet: 'Pago local para Guatemala con bancos nacionales'
        };
        return descriptions[gatewayType] || 'Método de pago seguro';
    }

    getGatewayFeatures(gatewayType) {
        const features = {
            recurrente: `
                <span class="feature">✅ Visa, Mastercard, Transferencias</span>
                <span class="feature">🇬🇹 Pagos en Quetzales (GTQ)</span>
                <span class="feature">⚡ Dinero en 24 horas</span>
                <span class="feature">🔒 100% Seguro</span>
            `,
            stripe: `
                <span class="feature">✅ Visa, MasterCard, American Express</span>
                <span class="feature">🔒 Encriptación SSL</span>
                <span class="feature">⚡ Procesamiento inmediato</span>
            `,
            paypal: `
                <span class="feature">✅ Protección al comprador</span>
                <span class="feature">🔒 No compartir datos bancarios</span>
                <span class="feature">🌍 Disponible mundialmente</span>
            `,
            neonet: `
                <span class="feature">✅ BAM, Banrural, BAC, G&T</span>
                <span class="feature">🇬🇹 Especializado en Guatemala</span>
                <span class="feature">💰 Quetzales (GTQ)</span>
            `
        };
        return features[gatewayType] || '';
    }
    
    selectPaymentMethod(gatewayType) {
        this.selectedGateway = gatewayType;
        
        // Update visual selection
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.classList.remove('selected');
            const radioDot = card.querySelector('.radio-dot');
            if (radioDot) radioDot.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`[data-gateway="${gatewayType}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            const radioDot = selectedCard.querySelector('.radio-dot');
            if (radioDot) radioDot.classList.add('selected');
        }
        
        // Show gateway-specific form
        this.showGatewayForm(gatewayType);
        
        console.log('💳 Payment method selected:', gatewayType);
    }
    
    showGatewayForm(gatewayType) {
        const formsContainer = document.getElementById('payment-forms-container');
        if (!formsContainer) return;
        
        // Hide all forms first
        formsContainer.querySelectorAll('.payment-form').forEach(form => {
            form.style.display = 'none';
        });
        
        // Show or create the specific form
        let form = document.getElementById(`${gatewayType}-payment-form`);
        if (!form) {
            form = this.createGatewayForm(gatewayType);
            formsContainer.appendChild(form);
        }
        
        form.style.display = 'block';

        // Setup form submit listener
        this.setupFormSubmitListener(gatewayType);

        // Scroll to form
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setupFormSubmitListener(gatewayType) {
        const formId = `${gatewayType}-checkout-form`;
        const form = document.getElementById(formId);

        if (form && !form.dataset.listenerAttached) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log(`📝 Form submitted for ${gatewayType}`);

                // Trigger the payment processing
                if (window.processCheckoutPayment) {
                    window.processCheckoutPayment();
                }
            });
            form.dataset.listenerAttached = 'true';
        }
    }
    
    createGatewayForm(gatewayType) {
        const form = document.createElement('div');
        form.id = `${gatewayType}-payment-form`;
        form.className = 'payment-form';
        
        switch (gatewayType) {
            case 'recurrente':
                form.innerHTML = this.createRecurrenteForm();
                break;
            case 'stripe':
                form.innerHTML = this.createStripeForm();
                break;
            case 'paypal':
                form.innerHTML = this.createPayPalForm();
                break;
            case 'neonet':
                form.innerHTML = this.createNeonetForm();
                break;
            default:
                form.innerHTML = '<p>Formulario de pago no disponible</p>';
        }

        return form;
    }

    createRecurrenteForm() {
        return `
            <div class="gateway-form recurrente-form">
                <div class="form-header">
                    <h4>🇬🇹 Pago con Recurrente Guatemala</h4>
                    <p>Serás redirigido a Recurrente para completar tu pago de forma segura</p>
                </div>

                <div class="recurrente-checkout-container">
                    <div class="recurrente-benefits">
                        <div class="benefit">
                            <span class="benefit-icon">🏦</span>
                            <span>Pagos con Visa, Mastercard y Transferencias</span>
                        </div>
                        <div class="benefit">
                            <span class="benefit-icon">🇬🇹</span>
                            <span>Especializado en Guatemala - Quetzales (GTQ)</span>
                        </div>
                        <div class="benefit">
                            <span class="benefit-icon">⚡</span>
                            <span>Dinero disponible en 24 horas</span>
                        </div>
                        <div class="benefit">
                            <span class="benefit-icon">🔒</span>
                            <span>Certificado PCI - Protección antifraude</span>
                        </div>
                    </div>

                    <form id="recurrente-checkout-form" class="checkout-form">
                        <div class="form-group">
                            <label>Email de Confirmación</label>
                            <input type="email" id="recurrente-email" placeholder="tu@email.com" required>
                            <small>Te enviaremos la confirmación de compra a este email</small>
                        </div>

                        <div class="form-group">
                            <label>Nombre Completo</label>
                            <input type="text" id="recurrente-name" placeholder="Nombre completo" required>
                            <small>Nombre para la factura</small>
                        </div>

                        <div class="form-group">
                            <label>Teléfono (Opcional)</label>
                            <input type="tel" id="recurrente-phone" placeholder="+502 1234-5678">
                        </div>

                        <div class="recurrente-info">
                            <div class="info-card">
                                <h5>💳 Métodos de Pago Disponibles</h5>
                                <ul>
                                    <li><strong>Tarjetas:</strong> Visa y Mastercard</li>
                                    <li><strong>Transferencias:</strong> Bancos guatemaltecos</li>
                                    <li><strong>Comisión:</strong> 4.5% + Q2 por transacción</li>
                                </ul>
                            </div>

                            <div class="security-info">
                                <h5>🔒 Seguridad</h5>
                                <p>Recurrente es una plataforma certificada PCI-DSS con protección antifraude y 3D Secure en cada transacción. Tus datos están completamente seguros.</p>
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.paymentProcessor.cancelPayment()">
                                ❌ Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary btn-large recurrente-btn">
                                🇬🇹 Continuar a Recurrente
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    createStripeForm() {
        return `
            <div class="gateway-form stripe-form">
                <div class="form-header">
                    <h4>💳 Pago con Tarjeta - Stripe</h4>
                    <p>Ingresa los datos de tu tarjeta de forma segura</p>
                </div>
                
                <form id="stripe-checkout-form" class="checkout-form">
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Número de Tarjeta</label>
                            <input type="text" id="stripe-card-number" placeholder="1234 5678 9012 3456" 
                                   maxlength="19" required>
                            <div class="card-types">
                                <span class="card-type">💳 Visa</span>
                                <span class="card-type">💳 MasterCard</span>
                                <span class="card-type">💳 American Express</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Fecha de Expiración</label>
                            <input type="text" id="stripe-expiry" placeholder="MM/YY" maxlength="5" required>
                        </div>
                        <div class="form-group">
                            <label>CVC</label>
                            <input type="text" id="stripe-cvc" placeholder="123" maxlength="4" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group full-width">
                            <label>Nombre del Titular</label>
                            <input type="text" id="stripe-cardholder" placeholder="Como aparece en la tarjeta" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Email de Facturación</label>
                        <input type="email" id="stripe-email" placeholder="tu@email.com" required>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.paymentProcessor.cancelPayment()">
                            ❌ Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary btn-large">
                            🔐 Procesar Pago con Stripe
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    createPayPalForm() {
        return `
            <div class="gateway-form paypal-form">
                <div class="form-header">
                    <h4>💙 Pago con PayPal</h4>
                    <p>Serás redirigido a PayPal para completar el pago de forma segura</p>
                </div>
                
                <div class="paypal-checkout-container">
                    <div class="paypal-benefits">
                        <div class="benefit">
                            <span class="benefit-icon">🛡️</span>
                            <span>Protección al comprador PayPal</span>
                        </div>
                        <div class="benefit">
                            <span class="benefit-icon">🔒</span>
                            <span>No compartir datos bancarios</span>
                        </div>
                        <div class="benefit">
                            <span class="benefit-icon">⚡</span>
                            <span>Pago rápido y seguro</span>
                        </div>
                    </div>
                    
                    <form id="paypal-checkout-form" class="checkout-form">
                        <div class="form-group">
                            <label>Email de Confirmación</label>
                            <input type="email" id="paypal-email" placeholder="tu@email.com" required>
                            <small>Te enviaremos la confirmación de compra a este email</small>
                        </div>
                        
                        <div class="paypal-info">
                            <p>Al hacer clic en "Pagar con PayPal", serás redirigido al sitio seguro de PayPal donde podrás:</p>
                            <ul>
                                <li>Iniciar sesión en tu cuenta PayPal existente</li>
                                <li>Crear una nueva cuenta PayPal</li>
                                <li>Pagar como invitado con tarjeta de crédito/débito</li>
                            </ul>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="window.paymentProcessor.cancelPayment()">
                                ❌ Cancelar
                            </button>
                            <button type="submit" class="btn btn-primary btn-large paypal-btn">
                                💙 Pagar con PayPal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
    
    createNeonetForm() {
        return `
            <div class="gateway-form neonet-form">
                <div class="form-header">
                    <h4>🇬🇹 Pago con Neonet Guatemala</h4>
                    <p>Pago seguro con bancos guatemaltecos</p>
                </div>
                
                <form id="neonet-checkout-form" class="checkout-form">
                    <div class="form-group">
                        <label>Banco Preferido</label>
                        <select id="neonet-bank" required>
                            <option value="">Seleccionar banco...</option>
                            <option value="BAM">🏦 Banco Agromercantil</option>
                            <option value="BANRURAL">🏦 Banrural</option>
                            <option value="BAC">🏦 BAC Credomatic</option>
                            <option value="GT">🏦 Banco G&T Continental</option>
                            <option value="PROMERICA">🏦 Banco Promerica</option>
                        </select>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>Número de DPI</label>
                            <input type="text" id="neonet-dpi" placeholder="1234 12345 1234" maxlength="15" required>
                        </div>
                        <div class="form-group">
                            <label>Teléfono</label>
                            <input type="tel" id="neonet-phone" placeholder="1234-5678" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>Email de Confirmación</label>
                        <input type="email" id="neonet-email" placeholder="tu@email.com" required>
                    </div>
                    
                    <div class="neonet-info">
                        <div class="info-card">
                            <h5>💰 Información de Pago</h5>
                            <p>El pago se procesará en <strong>Quetzales (GTQ)</strong></p>
                            <p>Serás redirigido al portal seguro de tu banco seleccionado</p>
                        </div>
                        
                        <div class="supported-banks">
                            <h5>🏦 Bancos Soportados:</h5>
                            <div class="bank-logos">
                                <span class="bank-item">BAM</span>
                                <span class="bank-item">Banrural</span>
                                <span class="bank-item">BAC</span>
                                <span class="bank-item">G&T</span>
                                <span class="bank-item">Promerica</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="window.paymentProcessor.cancelPayment()">
                            ❌ Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary btn-large neonet-btn">
                            🇬🇹 Procesar con Neonet
                        </button>
                    </div>
                </form>
            </div>
        `;
    }
    
    // Process payment with selected gateway
    async processPayment(cartData) {
        if (!this.selectedGateway) {
            throw new Error('No se ha seleccionado un método de pago');
        }
        
        const gateway = this.activeGateways.find(g => g.type === this.selectedGateway);
        if (!gateway) {
            throw new Error('Método de pago no válido');
        }
        
        console.log(`💳 Processing payment with ${gateway.name}...`);
        
        switch (this.selectedGateway) {
            case 'recurrente':
                return await this.processRecurrentePayment(cartData, gateway.config);
            case 'stripe':
                return await this.processStripePayment(cartData, gateway.config);
            case 'paypal':
                return await this.processPayPalPayment(cartData, gateway.config);
            case 'neonet':
                return await this.processNeonetPayment(cartData, gateway.config);
            default:
                throw new Error(`Gateway ${this.selectedGateway} not implemented`);
        }
    }

    async processRecurrentePayment(cartData, config) {
        try {
            // Get form data
            const formData = this.getRecurrenteFormData();

            console.log('🇬🇹 Processing Recurrente payment...', formData);

            // Prepare products data
            const products = cartData.items.map(item => ({
                id: item.product_id || item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1
            }));

            // Convert to GTQ (approximate rate: 1 USD = 7.8 GTQ)
            const amountGTQ = Math.round(cartData.total * 7.8 * 100) / 100;

            // Create checkout session in backend
            const apiUrl = `${window.API_CONFIG.baseUrl}/api/recurrente/create-session`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    products: products,
                    amount: amountGTQ,
                    currency: 'GTQ',
                    customerEmail: formData.email,
                    customerName: formData.name,
                    metadata: {
                        phone: formData.phone,
                        cartId: Date.now().toString(),
                        source: 'cisnet-checkout'
                    }
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al crear sesión de pago');
            }

            console.log('✅ Recurrente checkout session created:', data.data.sessionId);

            // Store session ID for callback
            sessionStorage.setItem('recurrente_session_id', data.data.sessionId);
            sessionStorage.setItem('recurrente_cart_data', JSON.stringify(cartData));

            // Redirect to Recurrente checkout
            window.location.href = data.data.checkoutUrl;

            // Return pending status (actual completion happens on callback)
            return {
                success: true,
                pending: true,
                redirecting: true,
                sessionId: data.data.sessionId
            };

        } catch (error) {
            console.error('❌ Recurrente payment error:', error);
            throw error;
        }
    }
    
    async processStripePayment(cartData, config) {
        // Simulate Stripe payment processing
        const formData = this.getStripeFormData();
        
        console.log('💳 Processing Stripe payment...', formData);
        
        // Simulate API call delay
        await this.delay(2000);
        
        // Simulate success/failure (90% success rate)
        const isSuccess = Math.random() > 0.1;
        
        if (isSuccess) {
            return {
                success: true,
                transactionId: 'stripe_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                gateway: 'Stripe',
                amount: cartData.total,
                currency: 'USD',
                paymentMethod: 'Credit Card',
                cardLast4: formData.cardNumber.slice(-4),
                receipt: `https://stripe.com/receipt/stripe_${Date.now()}`
            };
        } else {
            throw new Error('Pago rechazado por el banco. Verifica los datos de tu tarjeta.');
        }
    }
    
    async processPayPalPayment(cartData, config) {
        // Simulate PayPal payment processing
        const formData = this.getPayPalFormData();
        
        console.log('💙 Processing PayPal payment...', formData);
        
        // Simulate redirect to PayPal and return
        await this.delay(1500);
        
        // Simulate success (95% success rate for PayPal)
        const isSuccess = Math.random() > 0.05;
        
        if (isSuccess) {
            return {
                success: true,
                transactionId: 'paypal_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                gateway: 'PayPal',
                amount: cartData.total,
                currency: 'USD',
                paymentMethod: 'PayPal Account',
                payerEmail: formData.email,
                receipt: `https://paypal.com/receipt/paypal_${Date.now()}`
            };
        } else {
            throw new Error('Pago cancelado en PayPal o fondos insuficientes.');
        }
    }
    
    async processNeonetPayment(cartData, config) {
        // Simulate Neonet payment processing
        const formData = this.getNeonetFormData();
        
        console.log('🇬🇹 Processing Neonet payment...', formData);
        
        // Simulate bank processing delay
        await this.delay(2500);
        
        // Simulate success (85% success rate for local banks)
        const isSuccess = Math.random() > 0.15;
        
        if (isSuccess) {
            return {
                success: true,
                transactionId: 'neonet_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                gateway: 'Neonet Guatemala',
                amount: cartData.total * 7.8, // Convert to GTQ (approximate rate)
                currency: 'GTQ',
                paymentMethod: formData.bank,
                bankReference: 'BANK_' + Date.now().toString().slice(-8),
                receipt: `https://neonet.gt/receipt/neonet_${Date.now()}`
            };
        } else {
            throw new Error('Error en el procesamiento bancario. Intenta nuevamente o contacta a tu banco.');
        }
    }
    
    getRecurrenteFormData() {
        return {
            email: document.getElementById('recurrente-email')?.value || '',
            name: document.getElementById('recurrente-name')?.value || '',
            phone: document.getElementById('recurrente-phone')?.value || ''
        };
    }

    getStripeFormData() {
        return {
            cardNumber: document.getElementById('stripe-card-number')?.value || '',
            expiry: document.getElementById('stripe-expiry')?.value || '',
            cvc: document.getElementById('stripe-cvc')?.value || '',
            cardholder: document.getElementById('stripe-cardholder')?.value || '',
            email: document.getElementById('stripe-email')?.value || ''
        };
    }

    getPayPalFormData() {
        return {
            email: document.getElementById('paypal-email')?.value || ''
        };
    }
    
    getNeonetFormData() {
        return {
            bank: document.getElementById('neonet-bank')?.value || '',
            dpi: document.getElementById('neonet-dpi')?.value || '',
            phone: document.getElementById('neonet-phone')?.value || '',
            email: document.getElementById('neonet-email')?.value || ''
        };
    }
    
    validatePaymentData(gatewayType) {
        switch (gatewayType) {
            case 'recurrente':
                return this.validateRecurrenteData();
            case 'stripe':
                return this.validateStripeData();
            case 'paypal':
                return this.validatePayPalData();
            case 'neonet':
                return this.validateNeonetData();
            default:
                return { valid: false, errors: ['Gateway no soportado'] };
        }
    }

    validateRecurrenteData() {
        const data = this.getRecurrenteFormData();
        const errors = [];

        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email requerido y válido');
        }

        if (!data.name || data.name.trim().length < 3) {
            errors.push('Nombre completo requerido (mínimo 3 caracteres)');
        }

        return { valid: errors.length === 0, errors };
    }
    
    validateStripeData() {
        const data = this.getStripeFormData();
        const errors = [];
        
        if (!data.cardNumber || data.cardNumber.replace(/\s/g, '').length < 16) {
            errors.push('Número de tarjeta inválido');
        }
        
        if (!data.expiry || !/^\d{2}\/\d{2}$/.test(data.expiry)) {
            errors.push('Fecha de expiración inválida (MM/YY)');
        }
        
        if (!data.cvc || data.cvc.length < 3) {
            errors.push('CVC inválido');
        }
        
        if (!data.cardholder || data.cardholder.trim().length < 2) {
            errors.push('Nombre del titular requerido');
        }
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email inválido');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    validatePayPalData() {
        const data = this.getPayPalFormData();
        const errors = [];
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email requerido para confirmación');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    validateNeonetData() {
        const data = this.getNeonetFormData();
        const errors = [];
        
        if (!data.bank) {
            errors.push('Selecciona un banco');
        }
        
        if (!data.dpi || data.dpi.replace(/\s/g, '').length < 13) {
            errors.push('Número de DPI inválido');
        }
        
        if (!data.phone) {
            errors.push('Teléfono requerido');
        }
        
        if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.push('Email inválido');
        }
        
        return { valid: errors.length === 0, errors };
    }
    
    cancelPayment() {
        this.selectedGateway = null;
        
        // Clear form selections
        document.querySelectorAll('.payment-method-card').forEach(card => {
            card.classList.remove('selected');
            const radioDot = card.querySelector('.radio-dot');
            if (radioDot) radioDot.classList.remove('selected');
        });
        
        // Hide payment forms
        const formsContainer = document.getElementById('payment-forms-container');
        if (formsContainer) {
            formsContainer.querySelectorAll('.payment-form').forEach(form => {
                form.style.display = 'none';
            });
        }
        
        // Return to cart
        if (window.viewManager) {
            window.viewManager.loadView('cart/cart');
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Setup form input formatting
    setupFormFormatting() {
        // Format card number
        document.addEventListener('input', (e) => {
            if (e.target.id === 'stripe-card-number') {
                e.target.value = this.formatCardNumber(e.target.value);
            } else if (e.target.id === 'stripe-expiry') {
                e.target.value = this.formatExpiry(e.target.value);
            } else if (e.target.id === 'neonet-dpi') {
                e.target.value = this.formatDPI(e.target.value);
            }
        });
    }
    
    formatCardNumber(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    }
    
    formatExpiry(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    }
    
    formatDPI(value) {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const parts = [];

        if (v.length > 0) parts.push(v.substring(0, 4));
        if (v.length > 4) parts.push(v.substring(4, 9));
        if (v.length > 9) parts.push(v.substring(9, 13));

        return parts.join(' ');
    }

    // Create order in backend after successful payment
    async createOrder(cartData, paymentResult) {
        try {
            const token = window.app.user.token;
            if (!token) {
                throw new Error('Usuario no autenticado');
            }

            const orderData = {
                productIds: cartData.items.map(item => item.productId),
                totalAmount: cartData.total,
                paymentMethod: paymentResult.gateway,
                paymentId: paymentResult.transactionId
            };

            console.log('📝 Creating order in backend...', orderData);

            const response = await fetch('http://localhost:3000/api/purchases/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Order created successfully:', data);

                // Refresh product buttons to show download options
                if (window.app.productController) {
                    window.app.productController.refreshProductButtons();
                }

                return {
                    success: true,
                    orderId: data.orderId,
                    message: data.message
                };
            } else {
                throw new Error(data.error || 'Error al crear la orden');
            }

        } catch (error) {
            console.error('❌ Error creating order:', error);
            throw error;
        }
    }
}

// Create global instance
window.paymentProcessor = new PaymentProcessorController();