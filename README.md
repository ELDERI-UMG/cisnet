# CisNet - Sistema de Venta de Software

Sistema de e-commerce para venta de software desarrollado con tecnologías modernas.

## 🚀 Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Google OAuth + JWT
- **Hosting**: Vercel
- **Arquitectura**: Hexagonal (Clean Architecture)

## 📋 Características

- ✅ Catálogo de productos de software
- ✅ Sistema de carrito de compras
- ✅ Autenticación con Google
- ✅ Panel de administración
- ✅ Procesamiento de pagos
- ✅ Responsive design
- ✅ Búsqueda de productos
- ✅ Filtros por categoría

## 🛠️ Configuración

### Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# CORS Configuration
CORS_ORIGIN=https://your-domain.vercel.app
```

### Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/ELDERI-UMG/cisnet.git
cd cisnet
```

2. Instala las dependencias del backend:
```bash
cd backend
npm install
```

3. Configura las variables de entorno (ver arriba)

4. Ejecuta las migraciones de Supabase:
```sql
-- Ejecuta el contenido de database/supabase-migration.sql en tu dashboard de Supabase
```

5. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio de GitHub con Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente con cada push a main

### Variables de Entorno en Vercel

Agrega estas variables en la configuración de Vercel:

- `NODE_ENV`: production
- `SUPABASE_URL`: Tu URL de Supabase
- `SUPABASE_ANON_KEY`: Tu clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY`: Tu clave de service role
- `JWT_SECRET`: Tu secreto JWT
- `GOOGLE_CLIENT_ID`: Tu ID de cliente de Google
- `GOOGLE_CLIENT_SECRET`: Tu secreto de cliente de Google
- `CORS_ORIGIN`: Tu dominio de Vercel

## 📊 Base de Datos

El proyecto utiliza Supabase como base de datos. La estructura incluye:

- **users**: Usuarios del sistema
- **products**: Catálogo de productos
- **cart_items**: Items del carrito de compras
- **purchases**: Historial de compras
- **purchase_items**: Detalles de items comprados

## 🔐 Seguridad

- Autenticación JWT
- Google OAuth integrado
- Row Level Security (RLS) en Supabase
- Validación de datos en backend
- Sanitización de inputs

## 📱 Responsive Design

El frontend está optimizado para:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🧪 Testing

Para probar el sistema localmente:

1. Crea productos de prueba en Supabase
2. Configura Google OAuth para desarrollo
3. Prueba el flujo completo de compra

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Eddy Alexander Ramirez Lorenzana**
- GitHub: [@ELDERI-UMG](https://github.com/ELDERI-UMG)

## 🙏 Agradecimientos

- Supabase por la infraestructura de base de datos
- Vercel por el hosting
- Google por la autenticación OAuth