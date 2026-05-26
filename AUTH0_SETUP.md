# Integracion de Auth0

## Configuracion requerida

### 1. Crear aplicacion en Auth0

1. Ve a [Auth0 Dashboard](https://manage.auth0.com/)
2. Crea una nueva aplicacion de tipo `Single Page Application`
3. Configura los `Allowed Callback URLs`:
   ```text
   http://localhost:5173
   https://tu-dominio.com
   ```
4. Configura los `Allowed Logout URLs`:
   ```text
   http://localhost:5173
   https://tu-dominio.com
   ```

### 2. Variables de entorno

Edita `.env.local` y agrega tus credenciales:

```env
VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id-aqui
VITE_AUTH0_AUDIENCE=
```

`VITE_AUTH0_AUDIENCE` es opcional.

### 3. Donde vive la integracion

- `src/main.jsx`: monta el unico `Auth0Provider`.
- `config/auth0Config.js`: centraliza la configuracion.
- `src/components/auth/ProtectedRoute.jsx`: protege `/home`.
- `src/components/login/Main.jsx`: dispara `loginWithRedirect`.
- `src/components/chat_response/Header.jsx`: maneja logout.

### 4. Flujo esperado

1. El usuario entra a `/`.
2. Hace login con Auth0.
3. Auth0 redirige al frontend.
4. El usuario autenticado puede entrar a `/home`.
5. Si intenta abrir `/home` sin sesion, `ProtectedRoute` lo devuelve a `/`.

## Notas

- Mientras no exista `.env.local`, el proyecto usa el fallback actual definido en `config/auth0Config.js`.
- Si cambias la estrategia de callback o logout, revisa tanto Auth0 como `src/main.jsx`.
