// API Configuration - optimized
const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

// Get API base URL from environment or default to localhost
// Get API base URL: In production, ALWAYS use relative path to avoid Mixed Content (HTTPS->HTTP) errors.
// In development, use VITE_API_URL or default to localhost.
export const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

// Token management
export const getToken = () => {
  if (isNode) return null;
  return storage.getItem('nebula_access_token') || storage.getItem('token') || null;
};

export const setToken = (token) => {
  if (isNode) return;
  if (token) {
    storage.setItem('nebula_access_token', token);
    storage.setItem('token', token);
  } else {
    storage.removeItem('nebula_access_token');
    storage.removeItem('token');
  }
};

export const removeToken = () => {
  if (isNode) return;
  storage.removeItem('nebula_access_token');
  storage.removeItem('token');
};

