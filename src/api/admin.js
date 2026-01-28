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
};

export default admin;

