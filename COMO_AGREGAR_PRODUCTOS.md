# 📦 Cómo Agregar Nuevos Productos ZIP

## 🚀 **Proceso Súper Simple (3 Pasos)**

### **Paso 1: Crear/Subir archivo ZIP**
```bash
# Ir a la carpeta de descargas
cd C:\xampp\htdocs\CisnetPOS\downloads

# Subir tu archivo ZIP (reemplaza con tu archivo real)
# Nombre sugerido: producto_ID_version.zip
```

**Ejemplo**: Si tienes producto ID 17, nombra el archivo:
```
producto_17_v1.0.zip
```

### **Paso 2: Editar configuración**
📝 **Archivo**: `frontend/config/media-config.js`

**Buscar esta sección**:
```javascript
12: {
    name: 'VMware Workstation Pro',
    zipFile: 'vmware_workstation.zip',
    videoId: 'dQw4w9WgXcQ',
    videoUrl: null
},
```

**Agregar tu producto DESPUÉS del último**:
```javascript
12: {
    name: 'VMware Workstation Pro',
    zipFile: 'vmware_workstation.zip',
    videoId: 'dQw4w9WgXcQ',
    videoUrl: null
},
17: {                                    ← NUEVO PRODUCTO
    name: 'Mi Producto Nuevo',           ← Nombre que aparecerá
    zipFile: 'producto_17_v1.0.zip',    ← Archivo que subiste
    videoId: 'ABC123XYZ',               ← ID del video tutorial
    videoUrl: null
}
```

### **Paso 3: Actualizar cache**
📝 **Archivo**: `frontend/index.html`

**Buscar**:
```html
<script src="config/media-config.js?v=2"></script>
```

**Cambiar número de versión**:
```html
<script src="config/media-config.js?v=3"></script>
```

## ✅ **¡Listo! Tu producto ya funciona**

---

## 🎬 **Para Videos Tutoriales**

### **YouTube**:
- URL: `https://www.youtube.com/watch?v=ABC123XYZ`
- **videoId**: `ABC123XYZ` (la parte después de `?v=`)

### **Vimeo**:
- URL: `https://vimeo.com/123456789`
- **videoId**: `123456789`
- **Cambiar también** `videosPath` en config:
  ```javascript
  this.videosPath = 'https://vimeo.com/';
  ```

### **Tu propio servidor**:
```javascript
this.videosPath = 'https://tu-servidor.com/videos/';
```

---

## 🔧 **Ejemplo Completo: Producto ID 20**

### **1. Archivo ZIP**:
```
C:\xampp\htdocs\CisnetPOS\downloads\mi_software_nuevo_v2.0.zip
```

### **2. Configuración**:
```javascript
20: {
    name: 'Mi Software Nuevo',
    zipFile: 'mi_software_nuevo_v2.0.zip',
    videoId: 'XYZ789ABC',
    videoUrl: null
}
```

### **3. Cache**: 
```html
<script src="config/media-config.js?v=4"></script>
```

---

## 🎯 **Verificar que Funciona**

1. **Recargar página** (Ctrl+F5)
2. **Comprar el producto** (simular pago)
3. **Verificar en consola**:
   ```
   ✅ Real ZIP download completed for product 20: mi_software_nuevo_v2.0.zip
   ```
4. **Botones**: Debe aparecer "📥 Descargar ZIP"

---

## 🚨 **Errores Comunes**

### ❌ "No hay archivo disponible para el producto X"
**Solución**: Agregar producto X a `media-config.js`

### ❌ Archivo no descarga
**Solución**: Verificar que el archivo existe en `/downloads/`

### ❌ Configuración no se actualiza  
**Solución**: Cambiar número de versión en `index.html`

### ❌ Video no carga
**Solución**: Verificar `videoId` correcto

---

## 📁 **Estructura Final**

```
downloads/
├── office365_v2024.zip
├── norton360_deluxe.zip  
├── producto_17_v1.0.zip          ← Tu archivo nuevo
└── mi_software_nuevo_v2.0.zip    ← Otro ejemplo

media-config.js
├── 1: Office 365
├── 7: Norton 360
├── 17: Producto Nuevo             ← Tu configuración
└── 20: Mi Software Nuevo         ← Otro ejemplo
```

**¡Súper fácil de mantener!** 🎉