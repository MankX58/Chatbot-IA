// Configuración de Auth0
export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || "tu-dominio.auth0.com",
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || "tu-client-id",
  redirectUri: window.location.origin + '/home'
};
