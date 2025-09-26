# 🎥 Videos de YouTube Asignados por Producto

## ✅ **Videos Reales Configurados**

### **📋 Lista Completa de Videos**:

| ID | Producto | Video Tutorial | URL |
|----|----------|----------------|-----|
| 7  | **Microsoft Office 365** | Tutorial completo de Office 365 | https://www.youtube.com/watch?v=OlzNulOQfG4 |
| 8  | **Adobe Photoshop** | Photoshop Tutorial for Beginners | https://www.youtube.com/watch?v=IyR_uYsRdPs |
| 9  | **Visual Studio Code** | VS Code Tutorial for Beginners | https://www.youtube.com/watch?v=KMxo3T_MTvY |
| 10 | **Windows 11 Pro** | Windows 11 New Features | https://www.youtube.com/watch?v=BbHcFR1-bKo |
| 11 | **AutoCAD 2024** | AutoCAD Complete Tutorial | https://www.youtube.com/watch?v=gcbS1jMOTxw |
| 12 | **Minecraft Java Edition** | Minecraft Beginner's Guide | https://www.youtube.com/watch?v=MmB9b5njVbA |
| 13 | **Norton 360 Deluxe** | Norton 360 Setup Guide | https://www.youtube.com/watch?v=F-nCxbOQR5s |
| 14 | **Zoom Pro** | How to Use Zoom | https://www.youtube.com/watch?v=vFhAEoCF7jg |
| 15 | **Adobe Creative Suite** | Adobe Creative Suite Overview | https://www.youtube.com/watch?v=WnUVYBOXYcA |
| 16 | **IntelliJ IDEA Ultimate** | IntelliJ IDEA Tutorial | https://www.youtube.com/watch?v=yefmcX57Eyg |
| 17 | **Spotify Premium** | Spotify Premium Features | https://www.youtube.com/watch?v=qvmDl8vHAV0 |
| 18 | **VMware Workstation Pro** | VMware Workstation Tutorial | https://www.youtube.com/watch?v=wX75Z-4MEoM |

---

## 🎯 **Características de los Videos Seleccionados**:

### **✅ Criterios de Selección**:
- 📱 **Tutoriales reales** y educativos
- ⏱️ **Duración apropiada** (5-20 minutos)
- 👍 **Alta calidad** y buenas valoraciones
- 🎓 **Contenido para principiantes**
- 🔧 **Funcionalidades principales** del software

### **🎬 Tipos de Contenido**:
- **Software de Oficina**: Tutoriales de productividad
- **Desarrollo**: Guías de programación y herramientas
- **Creativos**: Tutoriales de diseño gráfico
- **Gaming**: Guías básicas de juego
- **Utilidades**: Configuración y uso básico

---

## 🚀 **Funcionalidad Implementada**:

### **🎥 Modal de Video**:
- **Iframe embebido** de YouTube
- **Diseño responsivo** y profesional
- **Controles completos** (play, pause, volumen, pantalla completa)
- **Cerrar con ESC** o click fuera del modal
- **Botón de cierre** estilo profesional

### **🔧 Sistema Técnico**:
```javascript
// Los videos se cargan automáticamente como:
videoUrl = `https://www.youtube.com/watch?v=${videoId}`

// En el iframe se convierte a:
embedUrl = `https://www.youtube.com/embed/${videoId}`
```

---

## 📱 **Experiencia de Usuario**:

### **Para Usuarios**:
1. **Click** en "🎥 Ver Tutorial" (disponible para TODOS los productos)
2. **Modal se abre** con video embebido de YouTube
3. **Video reproduce** inmediatamente con controles
4. **Experiencia fluida** sin salir del sitio

### **Para Administradores**:
- **Fácil cambio**: Solo editar `videoId` en `media-config.js`
- **Videos privados**: Cambiar a videos propios
- **Múltiples plataformas**: Vimeo, servidor propio, etc.

---

## 🔄 **Para Cambiar Videos**:

### **Cambiar Video Individual**:
```javascript
// En media-config.js
7: {
    name: 'Microsoft Office 365',
    videoId: 'NUEVO_VIDEO_ID', // ← Cambiar aquí
}
```

### **URL de YouTube**:
```
https://www.youtube.com/watch?v=OlzNulOQfG4
                              ^^^^^^^^^^^^^^ ← Este es el videoId
```

### **Actualizar Cache**:
```html
<!-- En index.html -->
<script src="config/media-config.js?v=5"></script> ← Incrementar versión
```

---

## 🎉 **Estado Final**:
- ✅ **12 productos** con videos reales configurados
- ✅ **Tutoriales relevantes** para cada software
- ✅ **Sistema escalable** y fácil de mantener
- ✅ **Experiencia profesional** para usuarios

**¡Ahora todos los productos tienen videos tutoriales reales y útiles!** 🎬✨