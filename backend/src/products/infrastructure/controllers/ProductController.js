const GetProducts = require('../../application/useCases/GetProducts');
const SearchProducts = require('../../application/useCases/SearchProducts');
const { ProductFilterDto } = require('../../application/dtos/ProductDto');
const SupabaseProductRepository = require('../repositories/SupabaseProductRepository');

class ProductController {
    constructor() {
        this.productRepository = new SupabaseProductRepository();
        this.getProducts = new GetProducts(this.productRepository);
        this.searchProducts = new SearchProducts(this.productRepository);
    }

    getAll = async (req, res, next) => {
        try {
            const filterDto = ProductFilterDto.fromQuery(req.query);
            const result = await this.getProducts.execute(filterDto);
            
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const product = await this.productRepository.findById(id);

            if (!product) {
                return res.status(404).json({
                    error: 'Producto no encontrado'
                });
            }

            res.json(product);
        } catch (error) {
            next(error);
        }
    };

    search = async (req, res, next) => {
        try {
            const { q } = req.query;
            
            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    error: 'Parámetro de búsqueda requerido'
                });
            }

            const result = await this.searchProducts.execute(q.trim());
            res.json(result);
        } catch (error) {
            next(error);
        }
    };

    getCategories = async (req, res, next) => {
        try {
            const categories = await this.productRepository.getCategories();
            res.json(categories);
        } catch (error) {
            next(error);
        }
    };

    getPriceRange = async (req, res, next) => {
        try {
            const priceRange = await this.productRepository.getPriceRange();
            res.json(priceRange);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = ProductController;

