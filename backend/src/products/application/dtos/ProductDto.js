const Joi = require('joi');

class ProductDto {
    constructor(name, description, price, category, version = null, compatibility = null, imageUrl = null) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.version = version;
        this.compatibility = compatibility;
        this.imageUrl = imageUrl;
        this.validate();
    }

    validate() {
        const schema = Joi.object({
            name: Joi.string()
                .min(1)
                .max(200)
                .required()
                .messages({
                    'string.empty': 'El nombre del producto es requerido',
                    'string.min': 'El nombre debe tener al menos 1 caracter',
                    'string.max': 'El nombre no puede exceder 200 caracteres',
                    'any.required': 'El nombre del producto es requerido'
                }),
            description: Joi.string()
                .min(1)
                .required()
                .messages({
                    'string.empty': 'La descripción del producto es requerida',
                    'string.min': 'La descripción debe tener al menos 1 caracter',
                    'any.required': 'La descripción del producto es requerida'
                }),
            price: Joi.number()
                .min(0)
                .max(999999.99)
                .required()
                .messages({
                    'number.base': 'El precio debe ser un número',
                    'number.min': 'El precio debe ser mayor o igual a 0',
                    'number.max': 'El precio no puede exceder $999,999.99',
                    'any.required': 'El precio es requerido'
                }),
            category: Joi.string()
                .valid(
                    'Productividad', 'Diseño', 'Desarrollo', 'Sistema Operativo',
                    'Juegos', 'Seguridad', 'Comunicación', 'Entretenimiento',
                    'Utilidades', 'Educación'
                )
                .required()
                .messages({
                    'any.only': 'La categoría debe ser una de las categorías válidas',
                    'any.required': 'La categoría es requerida'
                }),
            version: Joi.string()
                .allow(null, '')
                .max(20)
                .messages({
                    'string.max': 'La versión no puede exceder 20 caracteres'
                }),
            compatibility: Joi.string()
                .allow(null, '')
                .max(100)
                .messages({
                    'string.max': 'La compatibilidad no puede exceder 100 caracteres'
                }),
            imageUrl: Joi.string()
                .allow(null, '')
                .uri()
                .messages({
                    'string.uri': 'La URL de la imagen debe ser válida'
                })
        });

        const { error } = schema.validate({
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            version: this.version,
            compatibility: this.compatibility,
            imageUrl: this.imageUrl
        });

        if (error) {
            throw new Error(error.details[0].message);
        }
    }

    static fromRequest(req) {
        const { name, description, price, category, version, compatibility, imageUrl } = req.body;
        return new ProductDto(name, description, price, category, version, compatibility, imageUrl);
    }
}

class ProductFilterDto {
    constructor(filters = {}) {
        this.category = filters.category;
        this.minPrice = filters.minPrice;
        this.maxPrice = filters.maxPrice;
        this.version = filters.version;
        this.compatibility = filters.compatibility;
        this.isFree = filters.isFree;
        this.page = parseInt(filters.page) || 1;
        this.limit = parseInt(filters.limit) || 20;
        this.validate();
    }

    validate() {
        const schema = Joi.object({
            category: Joi.string()
                .valid(
                    'Productividad', 'Diseño', 'Desarrollo', 'Sistema Operativo',
                    'Juegos', 'Seguridad', 'Comunicación', 'Entretenimiento',
                    'Utilidades', 'Educación'
                )
                .allow(null, ''),
            minPrice: Joi.number().min(0).allow(null),
            maxPrice: Joi.number().min(0).allow(null),
            version: Joi.string().allow(null, ''),
            compatibility: Joi.string().allow(null, ''),
            isFree: Joi.boolean().allow(null),
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(20)
        });

        const { error, value } = schema.validate({
            category: this.category,
            minPrice: this.minPrice,
            maxPrice: this.maxPrice,
            version: this.version,
            compatibility: this.compatibility,
            isFree: this.isFree,
            page: this.page,
            limit: this.limit
        });

        if (error) {
            throw new Error(error.details[0].message);
        }

        // Aplicar valores validados
        Object.assign(this, value);
    }

    static fromQuery(query) {
        return new ProductFilterDto({
            category: query.category,
            minPrice: query.minPrice ? parseFloat(query.minPrice) : null,
            maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : null,
            version: query.version,
            compatibility: query.compatibility,
            isFree: query.isFree === 'true' ? true : query.isFree === 'false' ? false : null,
            page: query.page,
            limit: query.limit
        });
    }
}

module.exports = { ProductDto, ProductFilterDto };

