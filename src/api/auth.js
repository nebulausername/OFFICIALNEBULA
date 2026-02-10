import { apiClient, setToken, removeToken } from './config';

export const auth = {
  // Get current authenticated user
  me: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      // console.error('Auth Check Error:', error);
      throw error;
    }
  },

  // Login (Email/Password or Telegram) - supports legacy
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token, user } = response.data;
      if (token) setToken(token);
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Register
  register: async (data) => {
    try {
      const response = await apiClient.post('/auth/register', data);
      const { token, user } = response.data;
      if (token) setToken(token);
      return user;
    } catch (error) {
      throw error;
    }
  },

  // Logout
  logout: async (redirectUrl = null) => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  },

  // Update current user
  updateMe: async (data) => {
    try {
      const response = await apiClient.put('/auth/me', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Redirect to login page
  redirectToLogin: (returnUrl = null) => {
    const url = returnUrl || window.location.href;
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
  },

  // Telegram WebApp authentication
  telegramWebApp: async (initData) => {
    try {
      const response = await apiClient.post('/auth/telegram-webapp', { initData });
      const { token, user } = response.data;
      if (token) setToken(token);
      return user;
    } catch (error) {
      console.error('Telegram Auth Error:', error);
      return { error: 'Authentication failed' };
    }
  },
};

export default auth;

