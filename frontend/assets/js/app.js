class App {
    constructor() {
        this.user = new User();
        this.productModel = new Product();
        this.cartModel = new Cart(this.user);

        this.authController = new AuthController(this.user);
        this.productController = new ProductController(this.productModel, this.cartModel);
        this.cartController = new CartController(this.cartModel);
        this.viewManager = window.viewManager; // Reference to the global viewManager

        // Hacer los controladores globalmente accesibles para ViewManager
        window.authController = this.authController;
        window.productController = this.productController;
        window.cartController = this.cartController;

        this.init();
    }

    async init() {
        // Verificar si el usuario está autenticado sin hacer llamada al servidor
        // La validación del token se hará cuando sea necesario
        this.authController.updateNavigation();
        // ViewManager ya maneja la navegación, no necesitamos attachNavigationEvents

        // Notificar que la aplicación está lista
        console.log('✅ App initialized - AuthController available globally');

        // Disparar evento personalizado para notificar que la app está lista
        window.dispatchEvent(new CustomEvent('appReady', {
            detail: { authController: this.authController }
        }));
    }

}


// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

