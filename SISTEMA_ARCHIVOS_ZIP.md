# 📁 Sistema de Archivos ZIP - CisnetPOS

## 🎯 Estado Actual: SIMULADO

### Ubicación del Código
- **Archivo**: `frontend/controllers/ProductController.js`
- **Método**: `simulateZipDownload()` (líneas 547-584)
- **Asociación**: `getProductNameById()` (líneas 650-672)

### Funcionamiento Actual
```javascript
// ProductController.js
simulateZipDownload(productId) {
    const productName = this.getProductNameById(productId);
    const fileName = `${productName.replace(/\s+/g, '_')}_v1.0.zip`;
    
    // CONTENIDO TEXTO SIMULADO (NO es ZIP real)
    const zipContent = `
=== ${productName} ===
Instalación: Ejecutar setup.exe
Licencia: Incluida en la compra
...
    `;
    
    // Crear Blob temporal y descargar
    const blob = new Blob([zipContent], { type: 'application/zip' });
    // ... descarga automática
}
```

### Asociación Producto ↔ Archivo
```javascript
// ID del producto → Nombre del archivo
const productNames = {
    1: 'Microsoft Office 365',      // → Microsoft_Office_365_v1.0.zip
    2: 'Adobe Photoshop',           // → Adobe_Photoshop_v1.0.zip
    3: 'Visual Studio Code',        // → Visual_Studio_Code_v1.0.zip
    7: 'Norton 360 Deluxe',         // → Norton_360_Deluxe_v1.0.zip
    // ... etc
};
```

---

## 🏗️ Sistema REAL Propuesto

### 1. Estructura de Carpetas
```
C:\xampp\htdocs\CisnetPOS\
├── downloads/                    ← Nueva carpeta para ZIPs reales
│   ├── 1_Microsoft_Office_365_v1.0.zip
│   ├── 2_Adobe_Photoshop_v1.0.zip
│   ├── 3_Visual_Studio_Code_v1.0.zip
│   ├── 7_Norton_360_Deluxe_v1.0.zip
│   └── ...
├── backend/
├── frontend/
└── ...
```

### 2. Base de Datos Mejorada
Agregar columna `download_file` a tabla `products`:

```sql
ALTER TABLE products ADD COLUMN download_file VARCHAR(255);

UPDATE products SET download_file = '1_Microsoft_Office_365_v1.0.zip' WHERE id = 1;
UPDATE products SET download_file = '2_Adobe_Photoshop_v1.0.zip' WHERE id = 2;
-- etc...
```

### 3. Backend API para Descargas
```javascript
// backend/routes/downloads.js
app.get('/api/download/:productId', authMiddleware, (req, res) => {
    const productId = req.params.productId;
    
    // Verificar que el usuario compró el producto
    const hasPurchased = checkUserPurchase(req.user.id, productId);
    if (!hasPurchased) {
        return res.status(403).json({ error: 'Product not purchased' });
    }
    
    // Obtener archivo del producto
    const product = getProductById(productId);
    const filePath = path.join(__dirname, '../downloads/', product.download_file);
    
    // Enviar archivo
    res.download(filePath, product.download_file);
});
```

### 4. Frontend Actualizado
```javascript
// ProductController.js - Versión con archivos reales
async downloadProduct(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/download/${productId}`, {
            headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
        });
        
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const fileName = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'download.zip';
        
        // Descargar archivo real
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        
    } catch (error) {
        console.error('Download error:', error);
        this.showMessage('❌ Error al descargar archivo', 'error');
    }
}
```

---

## 🔧 Para Implementar Sistema Real

### Paso 1: Crear Carpeta Downloads
```bash
mkdir C:\xampp\htdocs\CisnetPOS\downloads
```

### Paso 2: Subir Archivos ZIP
- Crear/subir archivos ZIP reales con software
- Nombrar según convención: `{ID}_{Nombre}_v{Version}.zip`

### Paso 3: Actualizar Base de Datos
- Agregar columna `download_file` a productos
- Asociar cada producto con su archivo

### Paso 4: Implementar API Backend
- Ruta protegida `/api/download/:productId`
- Verificación de compra
- Entrega de archivo real

### Paso 5: Actualizar Frontend
- Cambiar `simulateZipDownload()` por `downloadProduct()`
- Usar fetch() para descargar archivos reales
- Manejo de errores y autenticación

---

## 📊 Beneficios del Sistema Real

✅ **Archivos reales**: Software genuino descargable  
✅ **Seguridad**: Verificación de compra en backend  
✅ **Escalabilidad**: Fácil agregar nuevos productos  
✅ **Control**: Mantenimiento centralizado de archivos  
✅ **Analytics**: Tracking de descargas  

## 🎯 Estado Actual vs Propuesto

| Aspecto | **Actual (Simulado)** | **Propuesto (Real)** |
|---------|----------------------|---------------------|
| Archivos | Texto en Blob | ZIP reales en `/downloads/` |
| Asociación | Hardcoded en JS | Base de datos |
| Seguridad | Solo frontend | Backend verificado |
| Mantenimiento | Editar código | Subir archivos |
| Escalabilidad | Manual | Automatizada |

¿Te gustaría que implemente el sistema real con archivos ZIP? 🚀