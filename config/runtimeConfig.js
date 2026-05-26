function normalizeBaseUrl(value) {
  if (!value) {
    return '';
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export const apiBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '');

export function buildApiUrl(path) {
  return `${apiBaseUrl}${path}`;
}
