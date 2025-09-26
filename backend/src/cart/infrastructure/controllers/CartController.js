const ManageCart = require('../../application/useCases/ManageCart');
const SupabaseCartRepository = require('../repositories/SupabaseCartRepository');
const SupabaseProductRepository = require('../../../products/infrastructure/repositories/SupabaseProductRepository');

class CartController {
    constructor() {
        this.cartRepository = new SupabaseCartRepository();
        this.productRepository = new SupabaseProductRepository();
        this.manageCart = new ManageCart(this.cartRepository, this.productRepository);
    }

    getCart = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const result = await this.manageCart.getCart(userId);
            
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    addItem = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { productId, quantity = 1 } = req.body;
            
            if (!productId) {
                return res.status(400).json({
                    error: 'ID del producto requerido'
                });
            }

            const result = await this.manageCart.addItem(userId, productId, quantity);
            
            res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    updateItem = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            const { quantity } = req.body;
            
            if (!quantity || quantity < 1) {
                return res.status(400).json({
                    error: 'Cantidad debe ser mayor a 0'
                });
            }

            const result = await this.manageCart.updateItem(userId, id, quantity);
            
            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    removeItem = async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { id } = req.params;
            
            await this.manageCart.removeItem(userId, id);
            
            res.json({
                success: true,
                message: 'Item eliminado del carrito'
            });
        } catch (error) {
            next(error);
        }
    };

    clearCart = async (req, res, next) => {
        try {
            const userId = req.user.id;
            
            await this.manageCart.clearCart(userId);
            
            res.json({
                success: true,
                message: 'Carrito vaciado exitosamente'
            });
        } catch (error) {
            next(error);
        }
    };
}

module.exports = CartController;

