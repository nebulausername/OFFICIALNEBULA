import axios from 'axios';

// Key for storing the auth token (legacy/fallback)
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

// Axios instance for Backend API
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token from localStorage if available (Double-submit pattern or fallback)
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Simple event emitter for auth events
export const authEvents = {
    listeners: [],
    on(event, callback) {
        if (event === 'unauthorized') this.listeners.push(callback);
    },
    off(event, callback) {
        if (event === 'unauthorized') this.listeners = this.listeners.filter(cb => cb !== callback);
    },
    emit(event) {
        if (event === 'unauthorized') this.listeners.forEach(cb => cb());
    }
};

// Response interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 (Unauthorized)
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Emit event so AuthContext can handle it
            authEvents.emit('unauthorized');
        }
        return Promise.reject(error);
    }
);

export default {
    getToken,
    setToken,
    removeToken,
    API_BASE_URL,
    client: apiClient
};
