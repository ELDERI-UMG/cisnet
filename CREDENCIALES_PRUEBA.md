# Credenciales de Prueba - CisnetPOS

## ✅ Estado del Sistema
- **Backend**: ✅ Funcionando en `http://localhost:3000`
- **Frontend**: ✅ Servido por XAMPP en `http://localhost/CisnetPOS/frontend/`
- **Base de datos**: ✅ Poblada con datos de prueba

## 🔐 Credenciales de Usuario

### Usuario Demo
- **Email**: `demo@example.com`
- **Contraseña**: `123456`
- **Nombre**: Usuario Demo

## 📦 Productos Disponibles
El sistema incluye 12 productos de prueba:
1. Microsoft Office 365 - $99.99
2. Adobe Photoshop - $239.88
3. Visual Studio Code - $0.00 (Gratis)
4. Windows 11 Pro - $199.99
5. AutoCAD 2024 - $1690.00
6. Minecraft Java Edition - $26.95
7. Norton 360 Deluxe - $49.99
8. Zoom Pro - $149.90
9. Adobe Creative Suite - $599.88
10. IntelliJ IDEA Ultimate - $499.00
11. Spotify Premium - $9.99
12. VMware Workstation Pro - $249.99

## 🧪 URLs de Prueba

### Frontend
- **Inicio**: `http://localhost/CisnetPOS/frontend/`
- **Pruebas**: `http://localhost/CisnetPOS/frontend/test_refactoring.html`

### API Backend
- **Estado**: `http://localhost:3000/health`
- **Productos**: `http://localhost:3000/api/products`
- **Login**: `POST http://localhost:3000/api/auth/login`

### Ejemplo de Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@example.com", "password": "123456"}'
```

## 🚀 Funcionalidades Probadas
- ✅ Servidor backend funcionando
- ✅ Frontend refactorizado cargando
- ✅ Sistema de autenticación
- ✅ Carga de productos desde API
- ✅ Navegación entre vistas
- ✅ Simulador de pago integrado
- ✅ ViewManager funcionando

## 📁 Estructura Nueva
```
frontend/
├── views/
│   ├── auth/         # Login, Register
│   ├── products/     # Catálogo
│   ├── cart/         # Carrito
│   ├── payment/      # Simulador
│   └── shared/       # Home, Header, Footer
├── controllers/      # ViewManager, Auth, Product, Cart
├── models/          # User, Product, Cart
└── assets/          # CSS, JS
```

**¡El sistema está completamente funcional y refactorizado!** 🎉