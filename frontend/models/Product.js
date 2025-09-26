    class Product {
    constructor() {
        this.products = [];
    }

    async getAll(filters = {}) {
        try {
            const url = 'http://localhost:3000/api/products';
            console.log('🌐 Fetching from:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('📋 Raw response:', data);
            
            if (data.success && data.data) {
                console.log('✅ Products found:', data.data.length);
                this.products = data.data;
                return {
                    success: true,
                    data: data.data
                };
            } else {
                return {
                    success: false,
                    error: data.error || 'No se encontraron productos'
                };
            }
            
        } catch (error) {
            console.error('💥 Fetch error:', error);
            return {
                success: false,
                error: `Error de conexión: ${error.message}`
            };
        }
    }

    async getById(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/${id}`);
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Error al obtener producto' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async search(query) {
        try {
            const response = await fetch(`http://localhost:3000/api/products/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Error en la búsqueda' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async getCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/products/categories');
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Error al obtener categorías' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    async getPriceRange() {
        try {
            const response = await fetch('http://localhost:3000/api/products/price-range');
            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, data: data.data };
            } else {
                return { success: false, error: data.error || 'Error al obtener rango de precios' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }
}

