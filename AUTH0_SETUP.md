# 🔐 Integración de Auth0

## Configuración Requerida

### 1. Crear Aplicación en Auth0

1. Ve a [Auth0 Dashboard](https://manage.auth0.com/)
2. Crea una nueva aplicación (tipo: Single Page Application)
3. Configura los "Allowed Callback URLs":
   ```
   http://localhost:5173/home
   https://tu-dominio.com/home
   ```

4. Configura los "Allowed Logout URLs":
   ```
   http://localhost:5173
   https://tu-dominio.com
   ```

### 2. Variables de Entorno

Edita `.env.local` y agrega tus credenciales de Auth0:

```env
VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id-aqui
```

### 3. Uso en Componentes

#### En un componente de login:
```jsx
import { useAuth0 } from '@auth0/auth0-react'

function LoginComponent() {
    const { loginWithRedirect, isLoading } = useAuth0()
    
    return (
        <button onClick={() => loginWithRedirect()}>
            Iniciar Sesión
        </button>
    )
}
```

#### Para obtener el usuario autenticado:
```jsx
const { user, isAuthenticated } = useAuth0()

if (isAuthenticated) {
    console.log(user.name, user.email)
}
```

#### Para logout:
```jsx
const { logout } = useAuth0()

<button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
    Cerrar Sesión
</button>
```

## Archivos Modificados

- `src/App.jsx` - Envuelto con Auth0Provider
- `src/components/login/Main.jsx` - Integración de login con Auth0
- `config/auth0Config.js` - Configuración de Auth0
- `.env.local` - Variables de entorno

## Componentes Nuevos

- `src/components/UserProfile.jsx` - Muestra perfil y logout (opcional)

## Próximos Pasos Recomendados

1. ✅ Configura tu aplicación en Auth0
2. ✅ Agrega las credenciales a `.env.local`
3. ✅ Prueba el flujo de login
4. ✅ Integra `UserProfile` en tu Header/Navbar
5. ✅ Protege rutas usando `isAuthenticated`
