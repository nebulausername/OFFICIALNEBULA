import api from './client';
import { setToken, removeToken } from './config';

export const auth = {
  // Get current authenticated user
  me: async () => {
    return await api.get('/auth/me');
  },

  // Logout current user
  logout: async (redirectUrl = null) => {
    try {
      await api.post('/auth/logout');
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
    return await api.patch('/auth/me', data);
  },

  // Redirect to login page
  redirectToLogin: (returnUrl = null) => {
    const url = returnUrl || window.location.href;
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
  },

  // Telegram WebApp authentication
  telegramWebApp: async (initData) => {
    return await api.post('/auth/telegram-webapp', { initData });
  },
};

export default auth;

