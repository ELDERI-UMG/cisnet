class Product {
    constructor(id, name, description, price, category, version, compatibility, imageUrl, createdAt = null, updatedAt = null) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.version = version;
        this.compatibility = compatibility;
        this.imageUrl = imageUrl;
        this.createdAt = createdAt || new Date();
        this.updatedAt = updatedAt || new Date();
    }

    static create(name, description, price, category, version = null, compatibility = null, imageUrl = null) {
        // Validaciones de dominio
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre del producto es requerido');
        }

        if (name.trim().length > 200) {
            throw new Error('El nombre del producto no puede exceder 200 caracteres');
        }

        if (!description || description.trim().length === 0) {
            throw new Error('La descripción del producto es requerida');
        }

        if (!price || price < 0) {
            throw new Error('El precio debe ser mayor o igual a 0');
        }

        if (price > 999999.99) {
            throw new Error('El precio no puede exceder $999,999.99');
        }

        if (!category || category.trim().length === 0) {
            throw new Error('La categoría del producto es requerida');
        }

        const validCategories = [
            'Productividad', 'Diseño', 'Desarrollo', 'Sistema Operativo', 
            'Juegos', 'Seguridad', 'Comunicación', 'Entretenimiento', 
            'Utilidades', 'Educación'
        ];

        if (!validCategories.includes(category)) {
            throw new Error(`La categoría debe ser una de: ${validCategories.join(', ')}`);
        }

        return new Product(
            null,
            name.trim(),
            description.trim(),
            parseFloat(price),
            category,
            version ? version.trim() : null,
            compatibility ? compatibility.trim() : null,
            imageUrl ? imageUrl.trim() : null
        );
    }

    updateDetails(name, description, price, category, version, compatibility, imageUrl) {
        if (name && name.trim().length > 0) {
            this.name = name.trim();
        }

        if (description && description.trim().length > 0) {
            this.description = description.trim();
        }

        if (price !== undefined && price >= 0) {
            this.price = parseFloat(price);
        }

        if (category && category.trim().length > 0) {
            this.category = category;
        }

        if (version !== undefined) {
            this.version = version ? version.trim() : null;
        }

        if (compatibility !== undefined) {
            this.compatibility = compatibility ? compatibility.trim() : null;
        }

        if (imageUrl !== undefined) {
            this.imageUrl = imageUrl ? imageUrl.trim() : null;
        }

        this.updatedAt = new Date();
        return this;
    }

    getFormattedPrice() {
        return `$${this.price.toFixed(2)}`;
    }

    isFree() {
        return this.price === 0;
    }

    matchesSearch(searchTerm) {
        if (!searchTerm) return true;
        
        const term = searchTerm.toLowerCase();
        return (
            this.name.toLowerCase().includes(term) ||
            this.description.toLowerCase().includes(term) ||
            this.category.toLowerCase().includes(term) ||
            (this.version && this.version.toLowerCase().includes(term)) ||
            (this.compatibility && this.compatibility.toLowerCase().includes(term))
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            formattedPrice: this.getFormattedPrice(),
            category: this.category,
            version: this.version,
            compatibility: this.compatibility,
            imageUrl: this.imageUrl,
            isFree: this.isFree(),
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;

