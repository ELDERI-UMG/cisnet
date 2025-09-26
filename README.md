# CISNET - Sistema de Venta de Software

Sistema de venta de software refactorizado con arquitectura simplificada, usando MySQL como base de datos y frontend MVC.

## Características

- Backend con arquitectura hexagonal simplificada
- Frontend con patrón MVC (Model-View-Controller)
- Base de datos MySQL local
- API REST para gestión de productos, usuarios y carrito
- Interfaz web responsive

## Requisitos

- Node.js 16+
- MySQL 5.7+
- npm

## Instalación

### 1. Configurar la base de datos

Crear una base de datos MySQL llamada `cisnet`:

```sql
CREATE DATABASE cisnet;
```

### 2. Instalar dependencias del backend

```bash
cd backend
npm install
```

### 3. Configurar variables de entorno

Editar el archivo `backend/.env` con la configuración de tu base de datos MySQL:

```
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=cisnet
```

### 4. Ejecutar migraciones

```bash
cd backend
npm run migrate
```

### 5. Poblar la base de datos (opcional)

```bash
cd backend
npm run seed
```

## Uso

### Iniciar el backend

```bash
cd backend
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Acceder al frontend

Abrir `frontend/index.html` en un navegador web o servir los archivos estáticos desde un servidor web.

## Estructura del Proyecto

```
CisnetPOS/
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── cart/
│   │   └── shared/
│   ├── database/
│   ├── server.js
│   └── package.json
└── frontend/
    ├── models/
    ├── views/
    ├── controllers/
    ├── assets/
    └── index.html
```

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Listar productos
- `GET /api/products/:id` - Obtener producto
- `GET /api/products/search` - Buscar productos
- `GET /api/products/categories` - Obtener categorías

### Carrito
- `GET /api/cart` - Obtener carrito
- `POST /api/cart/items` - Agregar item
- `PUT /api/cart/items/:id` - Actualizar item
- `DELETE /api/cart/items/:id` - Eliminar item
- `DELETE /api/cart` - Vaciar carrito

## Tecnologías Utilizadas

### Backend
- Node.js
- Express.js
- MySQL2
- JWT para autenticación
- Bcrypt para encriptación

### Frontend
- HTML5
- CSS3
- JavaScript (ES6+)
- Patrón MVC

## Licencia

MIT

