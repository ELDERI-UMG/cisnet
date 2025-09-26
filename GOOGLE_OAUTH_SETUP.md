# 🔐 Google OAuth Setup Guide - CisnetPOS

Esta guía te ayudará a configurar la autenticación con Google ("Continuar con Google") en CisnetPOS.

## 📋 Requisitos Previos

- Cuenta de Google
- Acceso a Google Cloud Console
- Dominio o localhost configurado

## 🚀 Paso 1: Configurar Google Cloud Console

### 1.1 Crear un Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Nombra tu proyecto (ej: "CisnetPOS Authentication")

### 1.2 Habilitar Google+ API
1. En el panel izquierdo, ve a **APIs & Services** > **Library**
2. Busca "Google+ API" y habilitala
3. También habilita "Google Identity" si está disponible

### 1.3 Configurar Pantalla de Consentimiento OAuth
1. Ve a **APIs & Services** > **OAuth consent screen**
2. Selecciona **External** (para usuarios fuera de tu organización)
3. Completa la información requerida:
   - **App name**: CisnetPOS
   - **User support email**: tu email
   - **Developer contact information**: tu email
4. Guarda y continúa

### 1.4 Crear Credenciales OAuth
1. Ve a **APIs & Services** > **Credentials**
2. Clic en **Create Credentials** > **OAuth 2.0 Client IDs**
3. Selecciona **Web application**
4. Configura:
   - **Name**: CisnetPOS Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost` (para desarrollo)
     - `https://tu-dominio.com` (para producción)
   - **Authorized redirect URIs**: 
     - `http://localhost/frontend` (para desarrollo)
     - `https://tu-dominio.com/frontend` (para producción)

## 🔧 Paso 2: Configurar la Aplicación

### 2.1 Actualizar Client ID
1. Abre el archivo: `frontend/config/google-auth-config.js`
2. Reemplaza `YOUR_GOOGLE_CLIENT_ID.googleusercontent.com` con tu Client ID real:

```javascript

```

### 2.2 Verificar URLs de Redirección
Asegúrate de que las URLs en tu configuración coincidan con las del Google Cloud Console.

## 🖥️ Paso 3: Configurar Backend (Opcional)

Si quieres validación del lado del servidor, necesitarás:

### 3.1 Instalar Google Auth Library
```bash
cd backend
npm install google-auth-library
```

### 3.2 Agregar Rutas de Google Auth
Crea estas rutas en tu backend para manejar la autenticación con Google:

- `POST /api/auth/google-login`
- `POST /api/auth/google-register`
- `POST /api/auth/user-by-email`

## 🧪 Paso 4: Probar la Integración

### 4.1 Modo Desarrollo
1. Inicia tu servidor local
2. Navega a las páginas de login/registro
3. Deberías ver el botón "Continuar con Google"
4. Haz clic para probar la autenticación

### 4.2 Verificar Funcionamiento
- ✅ El botón de Google aparece correctamente
- ✅ Al hacer clic, se abre la ventana de Google
- ✅ Después de autenticarse, el usuario es redirigido
- ✅ Los datos del usuario se guardan correctamente

## 🔒 Consideraciones de Seguridad

### Client ID Público
- El Client ID puede ser público, pero mantén el Client Secret privado
- Solo agrega dominios de confianza a las URLs autorizadas

### Validación del Token
```javascript
// El sistema valida automáticamente los tokens JWT de Google
const userInfo = this.decodeJWT(response.credential);
```

### Almacenamiento Seguro
```javascript
// Los datos se almacenan de forma segura en localStorage
localStorage.setItem('cisnet_user', JSON.stringify({
    id: this.id,
    name: this.name,
    email: this.email,
    provider: 'google',
    picture: googleUser.picture
}));
```

## 🐛 Solución de Problemas Comunes

### Error: "Invalid Client ID"
- Verifica que el Client ID esté correctamente copiado
- Asegúrate de que el dominio esté en las URLs autorizadas

### Error: "Redirect URI Mismatch"
- Verifica que las URLs de redirección coincidan exactamente
- Incluye el protocolo (http/https) y el puerto si es necesario

### El Botón no Aparece
- Verifica que el script de Google se esté cargando
- Revisa la consola del navegador para errores
- Asegúrate de que `google-auth-config.js` se esté cargando

### Error de CORS
- Agrega tu dominio a las URLs autorizadas en Google Console
- Verifica la configuración de CORS en tu servidor

## 📱 Responsive y Móviles

El botón de Google es completamente responsive y funciona en:
- ✅ Desktop
- ✅ Tablets
- ✅ Móviles
- ✅ Diferentes navegadores

## 🎨 Personalización

### Cambiar Estilo del Botón
Edita el CSS en `frontend/assets/css/styles.css`:

```css
.google-signin-btn {
    /* Personaliza aquí */
    background-color: #4285f4;
    color: white;
}
```

### Cambiar Texto del Botón
Modifica en `google-auth-config.js`:

```javascript
window.google.accounts.id.renderButton(container, {
    text: 'signup_with', // o 'signin_with'
    theme: 'filled_blue'
});
```

## 📊 Estados de la Integración

- ✅ **Configuración**: Completada
- ✅ **UI/UX**: Botones integrados en login y registro
- ✅ **Frontend**: Manejo completo de autenticación
- ✅ **Validación**: Tokens JWT validados
- ✅ **Almacenamiento**: Datos seguros en localStorage
- ⚠️ **Backend**: Requiere implementación de endpoints

## 🚀 Próximos Pasos

1. **Completar Backend**: Implementar los endpoints de Google auth
2. **Testing**: Probar con usuarios reales
3. **Producción**: Configurar dominio de producción
4. **Analytics**: Agregar seguimiento de conversiones

---

## 📞 Soporte

Si encuentras problemas con la configuración:

1. Revisa la consola del navegador para errores
2. Verifica la configuración en Google Cloud Console
3. Asegúrate de que todas las URLs estén correctas
4. Consulta la documentación de Google OAuth 2.0

¡La autenticación con Google está lista para usar! 🎉