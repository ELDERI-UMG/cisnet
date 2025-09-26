class CartController {
    constructor(cartModel) {
        this.cartModel = cartModel;
    }

    async showCart() {
        if (!this.cartModel.user.isAuthenticated()) {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = `
                <div class="container">
                    <h2>Carrito de Compras</h2>
                    <p>Debes iniciar sesión para ver tu carrito.</p>
                    <button class="btn" onclick="window.viewManager.loadView('auth/login')">Iniciar Sesión</button>
                </div>
            `;
            return;
        }

        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = '<div class="loading">Cargando carrito...</div>';

        const result = await this.cartModel.getCart();

        if (result.success) {
            mainContent.innerHTML = this.renderCartView();
            this.attachCartEvents();
        } else {
            mainContent.innerHTML = `<div class="error">Error: ${result.error}</div>`;
        }
    }

    renderCartView() {
        const items = this.cartModel.items;
        const total = this.cartModel.total;

        if (!items || items.length === 0) {
            return `
                <div class="container">
                    <h2>Carrito de Compras</h2>
                    <p>Tu carrito está vacío.</p>
                    <button class="btn" onclick="window.viewManager.loadView('products/list')">Ver Productos</button>
                </div>
            `;
        }

        const itemsHtml = items.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>Precio unitario: $${item.price}</p>
                </div>
                <div class="item-controls">
                    <label for="quantity-${item.id}">Cantidad:</label>
                    <input type="number" id="quantity-${item.id}" value="${item.quantity}" min="1" max="10" style="width: 60px; margin: 0 0.5rem;">
                    <button class="btn update-quantity-btn" data-item-id="${item.id}">Actualizar</button>
                    <button class="btn btn-danger remove-item-btn" data-item-id="${item.id}">Eliminar</button>
                </div>
                <div class="item-total">
                    <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            </div>
        `).join('');

        return `
            <div class="container">
                <h2>Carrito de Compras</h2>
                <div class="cart-items">
                    ${itemsHtml}
                </div>
                <div class="cart-total">
                    Total: $${total.toFixed(2)}
                </div>
                <div class="cart-actions" style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                    <button class="btn btn-danger" id="clear-cart-btn">🗑️ Vaciar Carrito</button>
                    <button class="btn" onclick="window.viewManager.loadView('products/list')">🛍️ Seguir Comprando</button>
                    <button class="btn" id="complete-purchase-btn" style="background: linear-gradient(45deg, #28a745, #20c997); color: white; font-weight: 600; padding: 0.8rem 2rem;">
                        💳 Completar Compra ($${total.toFixed(2)})
                    </button>
                </div>
            </div>
        `;
    }

    attachCartEvents() {
        // Eventos para actualizar cantidad
        const updateButtons = document.querySelectorAll('.update-quantity-btn');
        updateButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                const quantityInput = document.getElementById(`quantity-${itemId}`);
                const quantity = parseInt(quantityInput.value);
                
                if (quantity > 0) {
                    await this.updateItemQuantity(itemId, quantity);
                }
            });
        });

        // Eventos para eliminar items
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const itemId = e.target.getAttribute('data-item-id');
                await this.removeItem(itemId);
            });
        });

        // Evento para vaciar carrito
        const clearCartBtn = document.getElementById('clear-cart-btn');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
                    await this.clearCart();
                }
            });
        }

        // Evento para completar compra - Nueva implementación con pasarelas reales
        const completePurchaseBtn = document.getElementById('complete-purchase-btn');
        if (completePurchaseBtn) {
            completePurchaseBtn.addEventListener('click', () => {
                this.proceedToCheckout();
            });
        }
    }

    proceedToCheckout() {
        console.log('🛒 Proceeding to checkout with real payment gateways');
        
        const cart = this.getCart();
        if (!cart.items || cart.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Redirigir a la página de checkout moderna
        if (window.viewManager) {
            window.viewManager.loadView('checkout/payment');
        } else {
            console.error('❌ ViewManager not available');
        }
    }

    async updateItemQuantity(itemId, quantity) {
        const result = await this.cartModel.updateItem(itemId, quantity);
        
        if (result.success) {
            this.showMessage('Cantidad actualizada', 'success');
            // Recargar vista del carrito
            setTimeout(() => {
                this.showCart();
            }, 1000);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    async removeItem(itemId) {
        const result = await this.cartModel.removeItem(itemId);
        
        if (result.success) {
            this.showMessage('Producto eliminado del carrito', 'success');
            // Recargar vista del carrito
            setTimeout(() => {
                this.showCart();
            }, 1000);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    async clearCart() {
        const result = await this.cartModel.clearCart();
        
        if (result.success) {
            this.showMessage('Carrito vaciado', 'success');
            // Recargar vista del carrito
            setTimeout(() => {
                this.showCart();
            }, 1000);
        } else {
            this.showMessage(result.error, 'error');
        }
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;
        
        const mainContent = document.getElementById('main-content');
        mainContent.insertBefore(messageDiv, mainContent.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    showPaymentForm() {
        const items = this.cartModel.items;
        const total = this.cartModel.total;
        
        if (!items || items.length === 0) {
            this.showMessage('El carrito está vacío', 'error');
            return;
        }

        const mainContent = document.getElementById('main-content');
        
        const itemsList = items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <span>${item.name} (x${item.quantity})</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');

        mainContent.innerHTML = `
            <div class="container">
                <h2>💳 Checkout - Formulario de Pago</h2>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-top: 2rem;">
                    <!-- Resumen de la orden -->
                    <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border: 1px solid #dee2e6;">
                        <h3 style="margin-top: 0;">📋 Resumen de la Orden</h3>
                        <div style="margin-bottom: 1rem;">
                            ${itemsList}
                        </div>
                        <div style="border-top: 2px solid #007bff; padding-top: 1rem; margin-top: 1rem;">
                            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                                <span>Total a pagar:</span>
                                <span style="color: #28a745;">$${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Formulario de pago -->
                    <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #dee2e6;">
                        <h3 style="margin-top: 0;">🏦 Información de Pago</h3>
                        
                        <form id="payment-form" style="display: flex; flex-direction: column; gap: 1rem;">
                            <!-- Tipo de tarjeta -->
                            <div class="form-group">
                                <label for="card-type">Tipo de Tarjeta:</label>
                                <select id="card-type" name="cardType" style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                                    <option value="">Seleccionar tipo</option>
                                    <option value="credit">💳 Tarjeta de Crédito</option>
                                    <option value="debit">💰 Tarjeta de Débito</option>
                                </select>
                            </div>
                            
                            <!-- Número de tarjeta -->
                            <div class="form-group">
                                <label for="card-number">Número de Tarjeta:</label>
                                <input type="text" id="card-number" name="cardNumber" 
                                       placeholder="1234 5678 9012 3456" 
                                       maxlength="19"
                                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            
                            <!-- Nombre del titular -->
                            <div class="form-group">
                                <label for="card-holder">Nombre del Titular:</label>
                                <input type="text" id="card-holder" name="cardHolder" 
                                       placeholder="Juan Pérez" 
                                       style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                            </div>
                            
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                <!-- Fecha de expiración -->
                                <div class="form-group">
                                    <label for="expiry-date">Fecha de Expiración:</label>
                                    <input type="text" id="expiry-date" name="expiryDate" 
                                           placeholder="MM/AA" 
                                           maxlength="5"
                                           style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                                
                                <!-- CVV -->
                                <div class="form-group">
                                    <label for="cvv">CVV:</label>
                                    <input type="text" id="cvv" name="cvv" 
                                           placeholder="123" 
                                           maxlength="4"
                                           style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                                </div>
                            </div>
                            
                            <!-- Dirección de facturación -->
                            <div class="form-group">
                                <label for="billing-address">Dirección de Facturación:</label>
                                <textarea id="billing-address" name="billingAddress" 
                                          placeholder="Calle, Ciudad, Código Postal, País"
                                          rows="3"
                                          style="width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; resize: vertical;"></textarea>
                            </div>
                            
                            <!-- Términos y condiciones -->
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <input type="checkbox" id="terms" name="terms">
                                <label for="terms" style="font-size: 0.9rem;">
                                    Acepto los <a href="#" style="color: #007bff;">términos y condiciones</a> y la <a href="#" style="color: #007bff;">política de privacidad</a>
                                </label>
                            </div>
                            
                            <!-- Botones -->
                            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                                <button type="button" onclick="window.viewManager.loadView('cart/cart')" 
                                        class="btn" style="flex: 1;">
                                    ← Volver al Carrito
                                </button>
                                <button type="submit" class="btn" 
                                        style="flex: 2; background: linear-gradient(45deg, #28a745, #20c997); color: white; font-weight: 600;">
                                    💳 Pagar $${total.toFixed(2)}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                
                <!-- Información de seguridad -->
                <div style="background: #e9ecef; padding: 1rem; border-radius: 8px; margin: 2rem 0; text-align: center;">
                    <p style="margin: 0; font-size: 0.9rem; color: #6c757d;">
                        🔒 <strong>Pago Seguro:</strong> Tu información está protegida con encriptación SSL de 256 bits. 
                        No almacenamos información de tarjetas de crédito.
                    </p>
                </div>
            </div>
        `;
        
        this.attachPaymentFormEvents();
    }

    attachPaymentFormEvents() {
        const form = document.getElementById('payment-form');
        const cardNumberInput = document.getElementById('card-number');
        const expiryDateInput = document.getElementById('expiry-date');
        const cvvInput = document.getElementById('cvv');
        
        // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
        
        // Formatear fecha de expiración (MM/AA)
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
        
        // Solo números en CVV
        cvvInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        // Envío del formulario
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.processPayment(new FormData(form));
        });
    }

    async processPayment(formData) {
        const cardType = formData.get('cardType');
        const cardNumber = formData.get('cardNumber');
        const cardHolder = formData.get('cardHolder');
        const expiryDate = formData.get('expiryDate');
        const cvv = formData.get('cvv');
        const terms = formData.get('terms');
        
        // Validaciones
        if (!cardType || !cardNumber || !cardHolder || !expiryDate || !cvv || !terms) {
            this.showMessage('Por favor completa todos los campos y acepta los términos', 'error');
            return;
        }
        
        // Simulación de procesamiento de pago
        const mainContent = document.getElementById('main-content');
        mainContent.innerHTML = `
            <div class="container" style="text-align: center; padding: 3rem;">
                <div style="background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⏳</div>
                    <h2>Procesando Pago...</h2>
                    <p style="color: #666; margin: 1rem 0;">
                        Estamos verificando tu información de pago de forma segura.<br>
                        Por favor no cierres esta ventana.
                    </p>
                    <div style="background: #e9ecef; height: 4px; border-radius: 2px; margin: 2rem 0;">
                        <div style="background: linear-gradient(45deg, #007bff, #6f42c1); height: 100%; border-radius: 2px; width: 0%; animation: progress 3s ease-in-out forwards;"></div>
                    </div>
                </div>
            </div>
            
            <style>
                @keyframes progress {
                    0% { width: 0%; }
                    50% { width: 70%; }
                    100% { width: 100%; }
                }
            </style>
        `;
        
        // Simular procesamiento (3 segundos)
        setTimeout(() => {
            this.completePurchase();
        }, 3500);
    }

    async completePurchase() {
        try {
            // Obtener productos del carrito antes de limpiarlo
            const items = this.cartModel.items;
            const total = this.cartModel.total;

            if (!items || items.length === 0) {
                this.showMessage('Error: No hay productos en el carrito', 'error');
                return;
            }

            // Llamar al backend para crear la orden y insertar permisos
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.showMessage('Error: No hay sesión activa', 'error');
                return;
            }

            const orderData = {
                productIds: items.map(item => item.product_id),
                totalAmount: total,
                paymentMethod: 'demo',
                paymentId: `demo_${Date.now()}`
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

            if (!data.success) {
                throw new Error(data.error || 'Error al crear la orden');
            }

            console.log('✅ Order created successfully:', data);

            // Marcar productos como comprados en localStorage
            let purchasedProducts = JSON.parse(localStorage.getItem('purchasedProducts') || '[]');
            items.forEach(item => {
                if (!purchasedProducts.includes(item.product_id)) {
                    purchasedProducts.push(item.product_id);
                }
            });
            localStorage.setItem('purchasedProducts', JSON.stringify(purchasedProducts));

            // Refresh product buttons to show download options
            if (window.app && window.app.productController) {
                window.app.productController.refreshProductButtons();
            }

            // Limpiar carrito
            await this.cartModel.clearCart();
            
            // Mostrar confirmación de compra
            const mainContent = document.getElementById('main-content');
            const itemsList = items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0;">
                    <span>${item.name} (x${item.quantity})</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `).join('');

            mainContent.innerHTML = `
                <div class="container" style="text-align: center; padding: 2rem;">
                    <div style="background: white; padding: 3rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border: 3px solid #28a745;">
                        <div style="font-size: 4rem; margin-bottom: 1rem;">✅</div>
                        <h1 style="color: #28a745; margin-bottom: 1rem;">¡Compra Exitosa!</h1>
                        <p style="font-size: 1.2rem; color: #666; margin-bottom: 2rem;">
                            Tu pago ha sido procesado correctamente
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; text-align: left;">
                            <h3 style="margin-top: 0;">📋 Resumen de la Compra</h3>
                            ${itemsList}
                            <div style="border-top: 2px solid #28a745; padding-top: 1rem; margin-top: 1rem;">
                                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold;">
                                    <span>Total Pagado:</span>
                                    <span style="color: #28a745;">$${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 8px; margin: 2rem 0;">
                            <h4 style="margin-top: 0;">🎉 ¡Productos Desbloqueados!</h4>
                            <p style="margin: 0;">
                                Ahora puedes descargar tus software y acceder a los videos tutoriales.
                                Ve al catálogo de productos para encontrar tus enlaces de descarga.
                            </p>
                        </div>
                        
                        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                            <button onclick="window.viewManager.loadView('products/list')" class="btn" 
                                    style="background: linear-gradient(45deg, #007bff, #6f42c1); color: white; font-weight: 600;">
                                📥 Ver Mis Descargas
                            </button>
                            <button onclick="window.viewManager.loadView('shared/home')" class="btn">
                                🏠 Ir a Inicio
                            </button>
                            <button onclick="window.print()" class="btn">
                                🖨️ Imprimir Recibo
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            console.log('✅ Purchase completed successfully');
            console.log('🎁 Products unlocked:', purchasedProducts);
            
        } catch (error) {
            console.error('💥 Error completing purchase:', error);
            this.showMessage('Error al completar la compra: ' + error.message, 'error');
        }
    }

    // Método para agregar productos al carrito (usado por ProductController)
    async addToCart(productId, quantity = 1) {
        console.log('🛒 CartController.addToCart called:', productId, quantity);
        
        if (!this.cartModel.user.isAuthenticated()) {
            console.log('❌ User not authenticated');
            return { success: false, error: 'Debes iniciar sesión para agregar productos al carrito' };
        }

        try {
            const result = await this.cartModel.addItem(productId, quantity);
            
            if (result.success) {
                console.log('✅ Product added to cart successfully');
                return { success: true, message: 'Producto agregado al carrito' };
            } else {
                console.error('❌ Error adding product to cart:', result.error);
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('💥 Exception in addToCart:', error);
            return { success: false, error: 'Error interno al agregar producto al carrito' };
        }
    }

    // Método para mostrar items del carrito (usado por ViewManager)
    async displayCartItems() {
        console.log('🛒 CartController.displayCartItems called');
        
        if (!this.cartModel.user.isAuthenticated()) {
            console.log('❌ User not authenticated');
            const emptyCart = document.getElementById('empty-cart');
            const cartSummary = document.getElementById('cart-summary');
            const cartItems = document.getElementById('cart-items');
            
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            if (cartItems) cartItems.innerHTML = '<p>Debes iniciar sesión para ver tu carrito.</p>';
            return;
        }

        try {
            const result = await this.cartModel.getCart();
            
            if (result.success) {
                this.renderCartItems();
            } else {
                console.error('❌ Error getting cart:', result.error);
                const cartItems = document.getElementById('cart-items');
                if (cartItems) {
                    cartItems.innerHTML = `<p>Error al cargar carrito: ${result.error}</p>`;
                }
            }
        } catch (error) {
            console.error('💥 Exception in displayCartItems:', error);
            const cartItems = document.getElementById('cart-items');
            if (cartItems) {
                cartItems.innerHTML = '<p>Error interno al cargar carrito</p>';
            }
        }
    }

    // Método para renderizar items del carrito en la vista de ViewManager
    renderCartItems() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');
        const cartSummary = document.getElementById('cart-summary');
        const subtotalSpan = document.getElementById('subtotal');
        const taxesSpan = document.getElementById('taxes');
        const totalSpan = document.getElementById('total');

        if (!cartItems) {
            console.error('❌ cart-items element not found');
            return;
        }

        const items = this.cartModel.items || [];
        
        if (items.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            return;
        }

        // Ocultar mensaje de carrito vacío
        if (emptyCart) emptyCart.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';

        let subtotal = 0;
        let itemsHTML = '';

        items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            itemsHTML += `
                <div class="cart-item" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 0.5rem 0;">${item.name}</h4>
                            <p style="margin: 0; color: #666;">$${item.price} x ${item.quantity}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; font-weight: bold;">$${itemTotal.toFixed(2)}</p>
                            <button onclick="window.cartController.removeItem(${item.id})" 
                                    style="background: #dc3545; color: white; border: none; padding: 0.25rem 0.5rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        cartItems.innerHTML = itemsHTML;

        // Actualizar resumen
        const taxes = subtotal * 0.1; // 10% de impuestos
        const total = subtotal + taxes;

        if (subtotalSpan) subtotalSpan.textContent = `$${subtotal.toFixed(2)}`;
        if (taxesSpan) taxesSpan.textContent = `$${taxes.toFixed(2)}`;
        if (totalSpan) totalSpan.textContent = `$${total.toFixed(2)}`;
    }

    // Método para eliminar item del carrito
    async removeItem(productId) {
        console.log('🗑️ Removing item from cart:', productId);
        
        try {
            const result = await this.cartModel.removeItem(productId);
            
            if (result.success) {
                console.log('✅ Item removed successfully');
                this.renderCartItems(); // Re-renderizar carrito
            } else {
                console.error('❌ Error removing item:', result.error);
                alert('Error al eliminar producto del carrito');
            }
        } catch (error) {
            console.error('💥 Exception removing item:', error);
            alert('Error interno al eliminar producto');
        }
    }

    // Método para vaciar carrito
    async clearCart() {
        console.log('🧹 Clearing cart');
        
        try {
            const result = await this.cartModel.clearCart();
            
            if (result.success) {
                console.log('✅ Cart cleared successfully');
                this.renderCartItems(); // Re-renderizar carrito vacío
            } else {
                console.error('❌ Error clearing cart:', result.error);
                alert('Error al vaciar carrito');
            }
        } catch (error) {
            console.error('💥 Exception clearing cart:', error);
            alert('Error interno al vaciar carrito');
        }
    }

    // Método para obtener carrito (usado por ViewManager)
    getCart() {
        console.log('🛒 CartController.getCart called');
        
        if (!this.cartModel || !this.cartModel.items) {
            console.log('❌ Cart model or items not available');
            return { items: [], total: 0 };
        }

        const items = this.cartModel.items || [];
        let total = 0;
        
        items.forEach(item => {
            total += (item.price * item.quantity);
        });

        console.log('✅ Cart retrieved:', { itemCount: items.length, total });
        
        return {
            items: items,
            total: total
        };
    }
}

