// API Configuration - optimized
const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

// Get API base URL from environment or default to localhost
// Get API base URL: In production, ALWAYS use relative path to avoid Mixed Content (HTTPS->HTTP) errors.
// In development, use VITE_API_URL or default to localhost.
export const API_BASE_URL = (import.meta.env?.PROD)
  ? '/api'
  : ((import.meta.env?.VITE_API_URL) || 'http://localhost:8000/api').replace(/\/$/, '');

// Token management
export const getToken = () => {
  if (isNode) return null;
  const s = /** @type {Storage} */ (storage);
  return s.getItem('nebula_access_token') || s.getItem('token') || null;
};

export const setToken = (token) => {
  if (isNode) return;
  const s = /** @type {Storage} */ (storage);
  if (token) {
    s.setItem('nebula_access_token', token);
    s.setItem('token', token);
  } else {
    s.removeItem('nebula_access_token');
    s.removeItem('token');
  }
};

export const removeToken = () => {
  if (isNode) return;
  const s = /** @type {Storage} */ (storage);
  s.removeItem('nebula_access_token');
  s.removeItem('token');
};

