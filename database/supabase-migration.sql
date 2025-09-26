-- Migration script for Supabase
-- Crear tablas para CisNet

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    profile_picture TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url TEXT,
    download_url TEXT,
    file_size VARCHAR(50),
    version VARCHAR(50),
    requirements TEXT,
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabla de compras
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de compra
CREATE TABLE IF NOT EXISTS purchase_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, category, image_url, download_url, file_size, version, requirements, featured) VALUES
('Microsoft Office 365', 'Suite completa de productividad con Word, Excel, PowerPoint y más', 99.99, 'Productividad', 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=300', '#', '4.2 GB', '2024', 'Windows 10/11, 4GB RAM', true),
('Adobe Creative Suite', 'Herramientas profesionales para diseño gráfico y multimedia', 199.99, 'Diseño', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300', '#', '8.5 GB', '2024', 'Windows 10/11, 8GB RAM, GPU dedicada', true),
('AutoCAD 2024', 'Software líder en diseño asistido por computadora', 299.99, 'Ingeniería', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300', '#', '6.8 GB', '2024', 'Windows 10/11, 16GB RAM', false),
('Visual Studio Code', 'Editor de código fuente ligero pero potente', 0.00, 'Desarrollo', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300', '#', '200 MB', 'Latest', 'Windows/Mac/Linux, 2GB RAM', true),
('Photoshop 2024', 'Editor de imágenes profesional líder en la industria', 149.99, 'Diseño', 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=300', '#', '3.2 GB', '2024', 'Windows 10/11, 8GB RAM', false),
('IntelliJ IDEA Ultimate', 'IDE inteligente para desarrollo Java y más', 179.99, 'Desarrollo', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300', '#', '1.5 GB', '2024.1', 'Windows/Mac/Linux, 4GB RAM', false),
('Windows 11 Pro', 'Sistema operativo Windows 11 Professional', 199.99, 'Sistema Operativo', 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=300', '#', '5.4 GB', '23H2', 'TPM 2.0, Secure Boot', true),
('Norton 360 Deluxe', 'Protección completa contra malware y amenazas', 79.99, 'Seguridad', 'https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=300', '#', '500 MB', '2024', 'Windows/Mac, 2GB RAM', false),
('Spotify Premium', 'Música ilimitada sin anuncios', 9.99, 'Entretenimiento', 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=300', '#', '100 MB', 'Latest', 'Cualquier dispositivo', false),
('Zoom Pro', 'Plataforma de videoconferencias profesional', 14.99, 'Comunicación', 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=300', '#', '150 MB', '5.17', 'Windows/Mac/Linux, cámara web', false),
('VMware Workstation', 'Virtualización para escritorio', 249.99, 'Virtualización', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300', '#', '600 MB', '17.0', 'Windows/Linux, 8GB RAM', false),
('Minecraft Java Edition', 'Juego de construcción y aventura', 26.95, 'Videojuegos', 'https://images.unsplash.com/photo-1606040906485-26bb2c99671a?w=300', '#', '1 GB', '1.20', 'Java 8+, 4GB RAM', true);

-- Crear políticas RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_items ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo pueden ver/editar sus propios datos)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para productos (todos pueden ver, solo admins pueden modificar)
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (active = true);

-- Políticas para carrito (solo el usuario puede ver/modificar su carrito)
CREATE POLICY "Users can view their own cart" ON cart_items
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage their own cart" ON cart_items
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para compras (solo el usuario puede ver sus compras)
CREATE POLICY "Users can view their own purchases" ON purchases
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own purchases" ON purchases
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para items de compra
CREATE POLICY "Users can view their own purchase items" ON purchase_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM purchases
            WHERE purchases.id = purchase_items.purchase_id
            AND purchases.user_id::text = auth.uid()::text
        )
    );

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured, active);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase_id ON purchase_items(purchase_id);