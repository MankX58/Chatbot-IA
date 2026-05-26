const fallbackDomain = 'dev-jx33fyuny835mdmv.us.auth0.com';
const fallbackClientId = 'rvIM8cMSVb8Y6eHXUkw1D09auVI16dWA';
const browserOrigin = typeof window !== 'undefined' ? window.location.origin : '';

export const auth0Config = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN || fallbackDomain,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || fallbackClientId,
  redirectUri: browserOrigin,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
};

export const isAuthConfigured = Boolean(auth0Config.domain && auth0Config.clientId);
