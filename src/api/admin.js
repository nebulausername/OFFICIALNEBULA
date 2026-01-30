import apiClient from './client';

export const admin = {
  // Get dashboard statistics
  getStats: async () => {
    return await apiClient.get('/admin/stats');
  },

  // User management
  listUsers: async (params = {}) => {
    return await apiClient.get('/admin/users', params);
  },

  toggleVIP: async (userId, data) => {
    return await apiClient.patch(`/admin/users/${userId}/vip`, data);
  },

  getChatSessions: async () => {
    return await apiClient.get('/admin/chats');
  },

  getChatHistory: async (sessionId) => {
    return await apiClient.get(`/admin/chats/${sessionId}/messages`);
  },

  getTopProducts: async (limit = 10) => {
    return await apiClient.get('/admin/top-products', { limit });
  },

  getRecentActivity: async () => {
    return await apiClient.get('/admin/recent-activity');
  },

  getSalesData: async (days = 30) => {
    return await apiClient.get('/admin/sales-data', { period: days });
  },

  getCategoryRevenue: async (days = 30) => {
    return await apiClient.get('/admin/category-revenue', { period: days });
  },

  getUserGrowth: async (days = 30) => {
    return await apiClient.get('/admin/user-growth', { period: days });
  },
};

export default admin;

