import { apiClient } from './config';

// Map entity names to API endpoints
const ENDPOINT_MAP = {
  'product': '/products',
  'product-image': '/product-images', // Might need specific handling
  'category': '/categories',
  'brand': '/brands',
  'department': '/departments',
  'user': '/users',
  'cart-item': '/cart-items',
  'request': '/requests', // Orders
  'request-item': '/request-items',
  'ticket': '/tickets',
  'ticket-message': '/ticket-messages',
  'vip-plan': '/vip-plans',
  'notification-template': '/notification-templates',
  'wishlist-item': '/wishlist-items',
  'verification-request': '/verification',
};

// Generic entity factory - optimized for Express Backend
const createEntity = (entityName, customBasePath = null) => {
  const basePath = customBasePath || ENDPOINT_MAP[entityName] || `/${entityName}s`;

  return {
    // List all items (Flexible params support)
    list: async (arg1 = null, arg2 = null) => {
      try {
        let params = {};
        if (arg1 && typeof arg1 === 'object') {
          params = arg1;
        } else {
          if (arg1) params.sort = arg1;
          if (arg2) params.limit = arg2;
        }

        const response = await apiClient.get(basePath, { params });
        // Backend returns { data: [], total: ... } or just [] depending on endpoint
        // Normalizing to return array or pagination object?
        // AdminTable needs metadata (total, pages).
        // If response.data has 'data' prop, return full response.data (so valid pagination works)
        // If just array, return { data: array, total: array.length }

        if (Array.isArray(response.data)) {
          return { data: response.data, total: response.data.length };
        }
        return response.data; // Assumes { data, total, page, ... }
      } catch (error) {
        console.error(`API List Error (${entityName}):`, error);
        throw error;
      }
    },

    // Filter items (Backend support for filters varies, passing as query params)
    filter: async (filters = {}, sort = null, limit = null) => {
      try {
        const params = { ...filters };
        if (sort) params.sort = sort;
        if (limit) params.limit = limit;

        const response = await apiClient.get(basePath, { params });
        return Array.isArray(response.data) ? response.data : (response.data.data || []);
      } catch (error) {
        console.error(`API Filter Error (${entityName}):`, error);
        throw error;
      }
    },

    // Get single item by ID
    get: async (id) => {
      try {
        const response = await apiClient.get(`${basePath}/${id}`);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Create new item
    create: async (data) => {
      try {
        const response = await apiClient.post(basePath, data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Update item
    update: async (id, data) => {
      try {
        const response = await apiClient.patch(`${basePath}/${id}`, data);
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    // Delete item
    delete: async (id) => {
      try {
        await apiClient.delete(`${basePath}/${id}`);
        return true;
      } catch (error) {
        throw error;
      }
    },
  };
};


const createExtendedEntity = (name, methods) => ({
  ...createEntity(name),
  ...methods
});

export const entities = {
  Product: createExtendedEntity('product', {
    getImages: async (id) => {
      const response = await apiClient.get(`/products/${id}/images`);
      return response.data;
    }
  }),
  // ProductImage: createEntity('product-image'), // Redundant, use Product.getImages
  Category: createEntity('category'),
  Brand: createEntity('brand'),
  Department: createEntity('department'),
  User: createEntity('user'),
  StarCartItem: createEntity('cart-item'),
  Request: createEntity('request'), // Orders
  RequestItem: createEntity('request-item'),
  Ticket: createExtendedEntity('ticket', {
    sendMessage: async (id, messageData) => {
      const response = await apiClient.post(`/tickets/${id}/messages`, messageData);
      return response.data;
    }
  }),
  // TicketMessage: createEntity('ticket-message'), // Nested in Ticket
  VIPPlan: createEntity('vip-plan'), // Check backend implementation
  NotificationTemplate: createEntity('notification-template'), // Check backend implementation
  WishlistItem: createEntity('wishlist-item'),
  VerificationRequest: createEntity('verification-request'),
};

export default entities;

