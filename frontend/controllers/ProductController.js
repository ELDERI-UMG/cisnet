class ProductController {
    constructor(productModel, cartModel) {
        this.productModel = productModel;
        this.cartModel = cartModel;
    }

    // Alias for showProducts (for ViewManager compatibility)
    async loadProducts() {
        return await this.showProducts();
    }

    // Show products catalog
    async showProducts() {
        const mainContent = document.getElementById('main-content');

        if (!mainContent) {
            console.error('❌ main-content element not found');
            return;
        }

        // Show loading
        mainContent.innerHTML = `
            <div class="container">
                <h2>💻 Catálogo de Productos</h2>
                <div class="loading">Cargando productos...</div>
            </div>
        `;

        try {
            // Fetch products from API
            const apiUrl = `${window.API_CONFIG.baseUrl}${window.API_CONFIG.endpoints.products.list}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error al cargar productos');
            }

            const products = data.data;
            console.log(`✅ Loaded ${products.length} products`);

            // Render products
            await this.renderProducts(products);

        } catch (error) {
            console.error('❌ Error loading products:', error);
            mainContent.innerHTML = `
                <div class="container">
                    <h2>💻 Catálogo de Productos</h2>
                    <div class="error" style="text-align: center; padding: 2rem;">
                        <h3>❌ Error al cargar productos</h3>
                        <p>${error.message}</p>
                        <button onclick="window.productController.showProducts()" class="btn">🔄 Intentar de Nuevo</button>
                    </div>
                </div>
            `;
        }
    }

    // Render products list
    async renderProducts(products) {
        const mainContent = document.getElementById('main-content');
        let productsHTML = '';

        // Check if user is authenticated
        const isAuthenticated = window.app && window.app.user && window.app.user.isAuthenticated();

        for (const product of products) {
            try {
                // Check if user has purchased this product
                const hasPurchased = isAuthenticated ? await window.app.user.hasPurchased(product.id) : false;

                // Generate product card
                productsHTML += this.generateProductCard(product, isAuthenticated, hasPurchased);

            } catch (error) {
                console.error(`❌ Error processing product ${product.id}:`, error);
                // Add error card for this product
                productsHTML += `
                    <div class="product-card error-card">
                        <h3>${product.name}</h3>
                        <p>Error al cargar este producto</p>
                        <button onclick="window.productController.showProducts()" class="btn">🔄 Reintentar</button>
                    </div>
                `;
            }
        }

        // Render final HTML
        const finalHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-align: center; padding: 3rem; margin-bottom: 2rem;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem; font-weight: 700;">💻 Catálogo de Software</h1>
                <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Descubre las mejores herramientas de software profesional</p>
                <div style="display: flex; justify-content: center; gap: 3rem; flex-wrap: wrap;">
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">${products.length}</div>
                        <div style="font-size: 1rem; opacity: 0.8;">Productos</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">4.8</div>
                        <div style="font-size: 1rem; opacity: 0.8;">⭐ Rating</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; font-weight: bold; margin-bottom: 0.5rem;">24/7</div>
                        <div style="font-size: 1rem; opacity: 0.8;">🎧 Soporte</div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                    ${productsHTML}
                </div>
            </div>
        `;

        mainContent.innerHTML = finalHTML;
        console.log('✅ Products rendered successfully');
    }

    // Generate individual product card
    generateProductCard(product, isAuthenticated, hasPurchased) {
        const actionButton = this.generateActionButton(product, isAuthenticated, hasPurchased);

        return `
            <div class="product-card" style="border: 1px solid #ddd; padding: 1.5rem; border-radius: 8px; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h3 style="color: #2c3e50; margin-bottom: 0.5rem; font-size: 1.2rem;">${product.name}</h3>
                <p style="color: #7f8c8d; margin-bottom: 1rem; line-height: 1.4;">${product.description}</p>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <p style="font-size: 1.4rem; font-weight: bold; color: #27ae60; margin: 0;">💰 $${product.price}</p>
                    <p style="color: #3498db; margin: 0; font-size: 0.9rem;">📂 ${product.category}</p>
                </div>

                ${actionButton}
            </div>
        `;
    }

    // Generate action button based on user status and purchase history
    generateActionButton(product, isAuthenticated, hasPurchased) {
        // Generate tutorial button - ALWAYS visible
        const tutorialButton = `
            <button onclick="window.productController.viewTutorial(${product.id})"
                    style="width: 100%; background: linear-gradient(45deg, #ff6b6b, #ee5a52); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">
                📺 Ver Tutorial
            </button>
        `;

        if (hasPurchased) {
            // User has purchased - show download button + tutorial
            return `
                <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; text-align: center;">
                    <p style="margin: 0; font-weight: 600;">✅ ¡Producto Comprado!</p>
                </div>

                <button onclick="window.productController.downloadProduct(${product.id})"
                        style="width: 100%; background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">
                    📥 Descargar ${product.name}
                </button>

                ${tutorialButton}

                <p style="font-size: 0.8rem; color: #666; text-align: center; margin: 0.5rem 0 0 0;">Archivo ZIP con instalación completa</p>
            `;
        } else {
            // User hasn't purchased - show add to cart button + tutorial
            return `
                <button onclick="window.productController.addToCart(${product.id})"
                        style="width: 100%; background: linear-gradient(45deg, #3498db, #2980b9); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.95rem; margin-bottom: 0.75rem;">
                    🛒 Agregar al Carrito
                </button>

                ${tutorialButton}

                <div style="background: #f8f9fa; border: 1px solid #dee2e6; color: #6c757d; padding: 1rem; border-radius: 6px; text-align: center; margin-top: 0.75rem;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600;">🔒 Contenido Exclusivo</p>
                    <p style="margin: 0; font-size: 0.9rem;">Descarga disponible después de la compra</p>
                </div>
            `;
        }
    }

    // Add product to cart
    async addToCart(productId) {

        try {
            const result = await this.cartModel.addItem(productId, 1);

            if (result.success) {
                this.showProductMessage(productId, '✅ Producto agregado al carrito', 'success');

                // Redirect to cart after 1.5 seconds to show the success message first
                setTimeout(() => {
                    console.log('🛒 Redirecting to cart...');
                    console.log('🔍 Checking window.viewManager:', window.viewManager);

                    // Use the global viewManager directly
                    window.viewManager.loadView('cart/cart');
                }, 1500);
            } else {
                // Don't redirect if there was an error (like duplicate product)
                this.showProductMessage(productId, result.error || 'Error al agregar producto al carrito', 'error');
            }
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            this.showProductMessage(productId, 'Error interno al agregar producto al carrito', 'error');
        }
    }

    // View tutorial for product - ALWAYS available
    async viewTutorial(productId) {
        try {
            // Check if mediaConfig is available
            if (!window.mediaConfig) {
                this.showProductMessage(productId, 'Error: Configuración de medios no disponible', 'error');
                return;
            }

            // Get product media info (this is async)
            const mediaInfo = await window.mediaConfig.getProductMedia(productId);

            if (mediaInfo && mediaInfo.videoUrl) {
                // Open video in popup window
                this.openVideoPopup(productId, mediaInfo.name, mediaInfo.videoUrl);
                this.showProductMessage(productId, '📺 Abriendo tutorial...', 'success');
            } else {
                // Check if product exists in config but doesn't have video
                const productExists = window.mediaConfig.productMedia[productId];
                if (productExists) {
                    this.showProductMessage(productId, 'Tutorial en desarrollo para este producto', 'error');
                } else {
                    // Generate YouTube URL directly for products not in config
                    const fallbackVideoId = this.getFallbackVideoId(productId);
                    if (fallbackVideoId) {
                        const fallbackUrl = `https://www.youtube.com/watch?v=${fallbackVideoId}`;
                        const productName = this.getProductNameFromPage(productId) || `Producto ${productId}`;
                        this.openVideoPopup(productId, productName, fallbackUrl);
                        this.showProductMessage(productId, '📺 Abriendo tutorial...', 'success');
                    } else {
                        this.showProductMessage(productId, 'Tutorial no disponible para este producto', 'error');
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error opening tutorial:', error);
            this.showProductMessage(productId, 'Error al abrir tutorial', 'error');
        }
    }

    // Open video in popup window
    openVideoPopup(productId, productName, videoUrl) {
        try {
            // Get screen dimensions
            const screenWidth = window.screen.availWidth;
            const screenHeight = window.screen.availHeight;

            // Calculate popup dimensions (95% of screen)
            const popupWidth = Math.round(screenWidth * 0.95);
            const popupHeight = Math.round(screenHeight * 0.95);

            // Center the popup
            const left = Math.round((screenWidth - popupWidth) / 2);
            const top = Math.round((screenHeight - popupHeight) / 2);

            // Build URL with parameters
            const baseUrl = '/CisnetPOS/frontend/video-tutorial.html';
            const params = new URLSearchParams({
                productId: productId,
                productName: productName,
                videoUrl: videoUrl
            });
            const fullUrl = `${baseUrl}?${params.toString()}`;

            // Window features
            const windowFeatures = [
                `width=${popupWidth}`,
                `height=${popupHeight}`,
                `left=${left}`,
                `top=${top}`,
                'menubar=no',
                'toolbar=no',
                'location=no',
                'directories=no',
                'status=no',
                'scrollbars=no',
                'resizable=yes',
                'copyhistory=no'
            ].join(',');

            // Open popup window
            const popup = window.open(fullUrl, `tutorial_${productId}`, windowFeatures);

            // Focus the popup
            if (popup) {
                popup.focus();
            } else {
                // Fallback if popup was blocked
                this.showProductMessage(productId, 'Por favor permite ventanas emergentes para ver el tutorial', 'error');
            }

        } catch (error) {
            console.error('❌ Error opening video popup:', error);
            this.showProductMessage(productId, 'Error al abrir ventana de tutorial', 'error');
        }
    }

    // Helper function to get product name from the page
    getProductNameFromPage(productId) {
        const productCards = document.querySelectorAll('.product-card');
        for (const card of productCards) {
            const button = card.querySelector('button[onclick*="' + productId + '"]');
            if (button) {
                const titleElement = card.querySelector('h3');
                return titleElement ? titleElement.textContent : null;
            }
        }
        return null;
    }

    // Fallback video IDs for products not in media config
    getFallbackVideoId(productId) {
        const fallbackVideos = {
            1: 'dQw4w9WgXcQ', // Generic software tutorial
            2: 'dQw4w9WgXcQ', // Generic POS tutorial
            3: 'dQw4w9WgXcQ', // Generic inventory tutorial
            4: 'dQw4w9WgXcQ', // Generic tutorial
            5: 'dQw4w9WgXcQ', // Generic tutorial
            6: 'dQw4w9WgXcQ'  // Generic tutorial
        };
        return fallbackVideos[productId] || null;
    }

    // Download product (for purchased products)
    async downloadProduct(productId) {

        if (!window.app.user.isAuthenticated()) {
            this.showProductMessage(productId, 'Debes iniciar sesión para descargar', 'error');
            return;
        }

        try {
            const response = await fetch(`${window.API_CONFIG.baseUrl}/api/purchases/get-download-url`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.app.user.token}`
                },
                body: JSON.stringify({ productId })
            });

            const data = await response.json();

            if (data.success && data.downloadUrl) {
                // Open Google Drive URL in new tab
                window.open(data.downloadUrl, '_blank');

                // Show specific message with file name if available
                let message = '📁 Abriendo Google Drive - Busca tu archivo ZIP en la carpeta compartida';
                if (data.fileName) {
                    message = `📁 Abriendo Google Drive - Busca el archivo "${data.fileName}"`;
                }
                if (data.message) {
                    message = `📁 ${data.message}`;
                }

                this.showProductMessage(productId, message, 'success');
            } else {
                // Show specific error message based on status
                let errorMessage = data.error || 'Error: No tienes acceso a este producto';
                if (data.status === 'pending') {
                    errorMessage = '⏳ Permisos de Google Drive pendientes. Contacta al administrador.';
                }
                this.showProductMessage(productId, errorMessage, 'error');
            }
        } catch (error) {
            console.error('❌ Error downloading product:', error);
            this.showProductMessage(productId, 'Error al procesar descarga', 'error');
        }
    }

    // Show message
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = type;
        messageDiv.textContent = message;

        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.insertBefore(messageDiv, mainContent.firstChild);

            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }

    // Refresh product buttons after purchase
    async refreshProductButtons() {
        console.log('🔄 Refreshing product buttons after purchase...');

        // Wait a moment for the purchase to be processed
        setTimeout(async () => {
            try {
                // Re-render all products to update buttons
                await this.showProducts();
                console.log('✅ Product buttons refreshed');
            } catch (error) {
                console.error('❌ Error refreshing product buttons:', error);
            }
        }, 1000);
    }

    // Show message specific to a product card
    showProductMessage(productId, message, type) {
        // Find the product card
        const productCards = document.querySelectorAll('.product-card');
        let targetCard = null;

        productCards.forEach(card => {
            const button = card.querySelector('button[onclick*="' + productId + '"]');
            if (button) {
                targetCard = card;
            }
        });

        if (targetCard) {
            // Remove any existing message in this card
            const existingMessage = targetCard.querySelector('.product-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Create new message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'product-message';
            messageDiv.style.cssText = `
                padding: 10px;
                margin: 10px 0;
                border-radius: 5px;
                font-weight: 600;
                text-align: center;
                ${type === 'error' ? 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;' : 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;'}
            `;
            messageDiv.textContent = message;

            // Insert message after the last button in the card
            const buttons = targetCard.querySelectorAll('button');
            const lastButton = buttons[buttons.length - 1];
            if (lastButton) {
                lastButton.parentNode.insertBefore(messageDiv, lastButton.nextSibling);
            } else {
                targetCard.appendChild(messageDiv);
            }

            // Remove message after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        } else {
            // Fallback to regular message if card not found
            this.showMessage(message, type);
        }
    }
}