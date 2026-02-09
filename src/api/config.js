/**
 * API Configuration & Token Management
 */

// Key for storing the auth token
const TOKEN_KEY = 'nebula_auth_token';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
    if (typeof window === 'undefined') return;
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const removeToken = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
};

export default {
    getToken,
    setToken,
    removeToken,
    API_BASE_URL
};
