-- CisNet Product Catalog Loader
-- Script to load complete product catalog from media-config.js into Supabase
-- Execute this in Supabase SQL Editor

-- Clear existing products (optional - remove if you want to keep existing data)
-- DELETE FROM products WHERE id NOT IN ('admin_product_1');

-- Insert complete product catalog
INSERT INTO products (id, name, description, price, category, image_url, download_url, file_size, version, requirements, featured, active, created_at, updated_at) VALUES

-- Software Products
('1', 'Sistema de Facturación', 'Software completo de facturación electrónica para tu negocio con características avanzadas', 299.99, 'Software', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '2.5 GB', '2024', 'Windows 10/11, 4GB RAM', true, true, NOW(), NOW()),

('2', 'Sistema POS', 'Punto de venta integrado para gestión comercial completa', 199.99, 'Software', 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '1.8 GB', '2024', 'Windows 10/11, 4GB RAM', true, true, NOW(), NOW()),

('3', 'Sistema de Inventarios', 'Control avanzado de stock y almacén para tu empresa', 149.99, 'Software', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '1.2 GB', '2024', 'Windows 10/11, 2GB RAM', false, true, NOW(), NOW()),

-- Productivity Software
('7', 'Microsoft Office 365', 'Suite completa de productividad con Word, Excel, PowerPoint y más aplicaciones', 99.99, 'Productividad', 'https://images.unsplash.com/photo-1633613286991-611fe299c4be?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '4.2 GB', '2024', 'Windows 10/11, 4GB RAM', true, true, NOW(), NOW()),

-- Design Software
('8', 'Adobe Photoshop 2024', 'Editor de imágenes profesional líder en la industria mundial', 149.99, 'Diseño', 'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '3.2 GB', '2024', 'Windows 10/11, 8GB RAM', true, true, NOW(), NOW()),

('15', 'Adobe Creative Suite', 'Herramientas profesionales completas para diseño gráfico y multimedia', 199.99, 'Diseño', 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '8.5 GB', '2024', 'Windows 10/11, 8GB RAM, GPU dedicada', true, true, NOW(), NOW()),

-- Development Tools
('9', 'Visual Studio Code', 'Editor de código fuente ligero pero potente para desarrolladores', 0.00, 'Desarrollo', 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '200 MB', 'Latest', 'Windows/Mac/Linux, 2GB RAM', true, true, NOW(), NOW()),

('16', 'IntelliJ IDEA Ultimate', 'IDE avanzado para desarrollo Java y tecnologías empresariales', 149.00, 'Desarrollo', 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '850 MB', '2024.1', 'Windows/Mac/Linux, 8GB RAM', false, true, NOW(), NOW()),

-- Operating Systems
('10', 'Windows 11 Pro', 'Sistema operativo profesional con características avanzadas para empresas', 199.99, 'Sistema', 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '5.1 GB', '23H2', 'TPM 2.0, 4GB RAM, 64GB Storage', false, true, NOW(), NOW()),

-- Engineering Software
('11', 'AutoCAD 2024', 'Software líder en diseño asistido por computadora para ingenieros', 299.99, 'Ingeniería', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '6.8 GB', '2024', 'Windows 10/11, 16GB RAM', false, true, NOW(), NOW()),

-- Games
('12', 'Minecraft Java Edition', 'El juego de construcción y aventura más popular del mundo', 26.95, 'Juegos', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '1.2 GB', '1.20.4', 'Java 17+, 4GB RAM', true, true, NOW(), NOW()),

-- Security Software
('13', 'Norton 360 Deluxe', 'Protección completa de ciberseguridad para todos tus dispositivos', 49.99, 'Seguridad', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '180 MB', '2024', 'Windows 10/11, 2GB RAM', false, true, NOW(), NOW()),

-- Communication Tools
('14', 'Zoom Pro', 'Plataforma profesional de videoconferencias y colaboración empresarial', 14.99, 'Comunicación', 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '120 MB', '5.17.5', 'Windows/Mac/Linux, 4GB RAM', false, true, NOW(), NOW()),

-- Entertainment
('17', 'Spotify Premium', 'Streaming de música sin anuncios con calidad superior y descargas offline', 9.99, 'Entretenimiento', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '100 MB', '1.2.26', 'Windows/Mac/Linux/Mobile', false, true, NOW(), NOW()),

-- Virtualization
('18', 'VMware Workstation Pro', 'Virtualización profesional para ejecutar múltiples sistemas operativos', 249.99, 'Virtualización', 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300', 'https://drive.google.com/drive/u/1/folders/1kd8JnMTxAyCpNfNEcsaQ8cU2KyDnzqHi', '650 MB', '17.5', 'Windows/Linux, 16GB RAM, VT-x/AMD-V', false, true, NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    category = EXCLUDED.category,
    image_url = EXCLUDED.image_url,
    download_url = EXCLUDED.download_url,
    file_size = EXCLUDED.file_size,
    version = EXCLUDED.version,
    requirements = EXCLUDED.requirements,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    updated_at = NOW();

-- Verification query
SELECT 'Product catalog loaded successfully!' as status;
SELECT 'Total products:' as info, COUNT(*) as total FROM products;
SELECT 'Featured products:' as info, COUNT(*) as total FROM products WHERE featured = true;
SELECT 'Products by category:' as info, category, COUNT(*) as total FROM products GROUP BY category ORDER BY category;

-- Display loaded products
SELECT id, name, category, price, featured, active FROM products ORDER BY
    CASE
        WHEN featured = true THEN 1
        ELSE 2
    END,
    category,
    name;