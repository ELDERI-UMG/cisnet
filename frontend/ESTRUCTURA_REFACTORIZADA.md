# Estructura Refactorizada del Frontend

## Resumen de Cambios

El frontend ha sido refactorizado siguiendo el patrón MVC para mejorar la organización y mantenimiento:

### Nueva Estructura de Carpetas

```
frontend/
├── views/
│   ├── auth/
│   │   ├── login.html
│   │   └── register.html
│   ├── products/
│   │   └── list.html
│   ├── cart/
│   │   └── cart.html
│   ├── payment/
│   │   └── simulator.html
│   └── shared/
│       ├── header.html
│       ├── footer.html
│       └── home.html
├── controllers/
│   ├── ViewManager.js (NUEVO)
│   ├── AuthController.js
│   ├── ProductController.js
│   └── CartController.js
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Cart.js
├── assets/
│   ├── css/
│   └── js/
└── index.html (ACTUALIZADO)
```

## Funcionalidades Implementadas

### 1. ViewManager
- **Archivo**: `controllers/ViewManager.js`
- **Función**: Gestiona la carga dinámica de vistas HTML
- **Características**:
  - Cache de vistas para mejor rendimiento
  - Enrutamiento interno de la aplicación
  - Gestión de eventos específicos por vista
  - Integración con controladores existentes

### 2. Vistas Organizadas por Módulo

#### Auth (`views/auth/`)
- **login.html**: Formulario de inicio de sesión
- **register.html**: Formulario de registro

#### Products (`views/products/`)
- **list.html**: Catálogo de productos con filtros y búsqueda

#### Cart (`views/cart/`)
- **cart.html**: Vista del carrito de compras

#### Payment (`views/payment/`)
- **simulator.html**: Simulador de pagos (extraído de index.html)

#### Shared (`views/shared/`)
- **home.html**: Página de inicio
- **header.html**: Encabezado común
- **footer.html**: Pie de página común

### 3. Simulador de Pago Integrado
- Extraído de `index.html` y convertido en vista independiente
- Funcionalidad completa de simulación de pagos
- Integración con el carrito de compras
- Validación de formularios de pago

## Ventajas de la Nueva Estructura

### Mantenimiento
- **Separación de responsabilidades**: Cada vista tiene su archivo específico
- **Reutilización**: Componentes compartidos en `views/shared/`
- **Organización**: Vistas agrupadas por funcionalidad

### Desarrollo
- **Modularidad**: Fácil agregar nuevas vistas
- **Cache inteligente**: ViewManager cachea vistas para mejor rendimiento
- **Event binding**: Gestión automática de eventos por vista

### Escalabilidad
- **Patrón consistente**: Fácil seguir el patrón para nuevas funcionalidades
- **Flexibilidad**: ViewManager permite fácil extensión

## Cómo Usar

### Cargar una Vista
```javascript
// Cargar una vista específica
window.viewManager.loadView('products/list');

// Cargar una vista con datos
window.viewManager.loadView('products/list', { selectedCategory: 'software' });
```

### Agregar Nueva Vista
1. Crear archivo HTML en la carpeta correspondiente de `views/`
2. Agregar método en ViewManager para eventos específicos
3. La vista se carga automáticamente

### Integración con Controladores
Los controladores existentes (Auth, Product, Cart) siguen funcionando igual, pero ahora son accesibles globalmente para ViewManager:
- `window.authController`
- `window.productController` 
- `window.cartController`

## Cambios en index.html
- Agregado ViewManager a los scripts
- Cambiado ID del botón de simulador de pago
- ViewManager maneja toda la navegación automáticamente

## Compatibilidad
- Mantiene compatibilidad total con el backend existente
- Los controladores y modelos no requieren cambios
- API endpoints siguen funcionando igual

## Próximos Pasos Sugeridos
1. Agregar lazy loading para vistas más pesadas
2. Implementar transiciones entre vistas
3. Crear sistema de templates más avanzado
4. Agregar validación de permisos por vista