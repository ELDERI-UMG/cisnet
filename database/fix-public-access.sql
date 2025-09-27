-- Script para permitir acceso público a productos
-- Esto permite que cualquier persona vea el catálogo sin autenticarse

-- Eliminar política restrictiva actual de productos
DROP POLICY IF EXISTS "Anyone can view products" ON products;

-- Crear nueva política que permite acceso público total a productos
CREATE POLICY "Public can view active products" ON products
    FOR SELECT USING (active = true);

-- Permitir acceso público para insertar productos (solo para testing)
CREATE POLICY "Public can insert products" ON products
    FOR INSERT WITH CHECK (true);

-- Verificar productos existentes
SELECT 'Total products:' as info, COUNT(*) as count FROM products;
SELECT 'Active products:' as info, COUNT(*) as count FROM products WHERE active = true;
SELECT 'Featured products:' as info, COUNT(*) as count FROM products WHERE featured = true;

-- Mostrar algunos productos para verificar
SELECT id, name, price, category, active, featured
FROM products
ORDER BY created_at DESC
LIMIT 5;