-- Script de actualización para Supabase
-- Solo agrega los datos que faltan sin recrear las tablas

-- Insertar usuario administrador (password: 123456)
-- La contraseña ya está hasheada con bcrypt
INSERT INTO users (username, email, password, created_at) VALUES
('Eddy Alexander', 'eddy@cisnet.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW())
ON CONFLICT (email) DO NOTHING;

-- Insertar productos específicos del negocio (solo si no existen)
-- Usamos DO $$ para verificar si existen antes de insertar
DO $$
BEGIN
    -- Sistema de Facturación
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sistema de Facturación') THEN
        INSERT INTO products (name, description, price, category, image_url, download_url, file_size, version, requirements, featured)
        VALUES ('Sistema de Facturación', 'Software completo de facturación electrónica', 299.99, 'Software', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300', '#', '2.5 GB', '2024', 'Windows 10/11, 4GB RAM', false);
    END IF;

    -- Sistema POS
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sistema POS') THEN
        INSERT INTO products (name, description, price, category, image_url, download_url, file_size, version, requirements, featured)
        VALUES ('Sistema POS', 'Punto de venta integrado', 199.99, 'Software', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300', '#', '1.8 GB', '2024', 'Windows 10/11, 4GB RAM', true);
    END IF;

    -- Sistema de Inventarios
    IF NOT EXISTS (SELECT 1 FROM products WHERE name = 'Sistema de Inventarios') THEN
        INSERT INTO products (name, description, price, category, image_url, download_url, file_size, version, requirements, featured)
        VALUES ('Sistema de Inventarios', 'Control de stock y almacén', 149.99, 'Software', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300', '#', '1.2 GB', '2024', 'Windows 10/11, 2GB RAM', false);
    END IF;
END $$;

-- Verificar que las tablas existen y tienen datos
SELECT 'Users count:' as info, COUNT(*) as total FROM users;
SELECT 'Products count:' as info, COUNT(*) as total FROM products;
SELECT 'Admin user exists:' as info, EXISTS(SELECT 1 FROM users WHERE email = 'eddy@cisnet.com') as exists;