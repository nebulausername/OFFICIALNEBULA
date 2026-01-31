import api from './client';
import { API_BASE_URL } from './config';

// Helper to build query params for list/filter operations
const buildQueryParams = (filters = {}, sort = null, limit = null) => {
  const params = {};

  // Add filters
  Object.keys(filters).forEach(key => {
    if (filters[key] !== undefined && filters[key] !== null) {
      params[key] = String(filters[key]);
    }
  });

  // Add sort
  if (sort) {
    params.sort = String(sort);
  }

  // Add limit
  if (limit) {
    params.limit = String(limit);
  }

  return params;
};

// Generic entity factory - optimized
const createEntity = (entityName, customBasePath = null) => {
  const basePath = customBasePath || `/${entityName.toLowerCase()}s`;

  // Normalize response to always return array for list/filter
  const normalizeArray = (result) => {
    // Handle Array directly
    if (Array.isArray(result)) return result;

    // Handle Object with data property (most common case for paginated responses)
    if (result?.data !== undefined) {
      return Array.isArray(result.data) ? result.data : (result.data ? [result.data] : []);
    }

    // Handle Object with products property (fallback)
    if (result?.products && Array.isArray(result.products)) {
      return result.products;
    }

    // Handle empty/null/undefined
    if (!result || result === null || result === undefined) {
      return [];
    }

    // Last resort: if it's an object but not an array, wrap it
    // This handles cases where a single object is returned instead of array
    if (typeof result === 'object' && !Array.isArray(result)) {
      // Only wrap if it looks like a product/item object (has id or similar)
      if (result.id || result.sku || result.name) {
        return [result];
      }
    }

    return [];
  };

  return {
    // List all items with optional sort and limit
    list: async (sort = null, limit = null) => {
      const params = buildQueryParams({}, sort, limit);
      const fullUrl = `${API_BASE_URL}${basePath}?${new URLSearchParams(params).toString()}`;

      console.log(`🌐 API List Request:`, {
        entity: entityName,
        url: fullUrl,
        sort,
        limit,
        params
      });

      try {
        const result = await api.get(basePath, params);
        console.log(`📥 API List Response (${entityName}):`, {
          type: typeof result,
          isArray: Array.isArray(result),
          hasData: !!result?.data,
          length: Array.isArray(result) ? result.length : (result?.data?.length || 0),
          raw: result
        });

        const normalized = normalizeArray(result);
        return normalized;
      } catch (error) {
        console.error(`❌ API List Error (${entityName}):`, {
          url: fullUrl,
          error: error.message,
          status: error.status,
          stack: error.stack
        });
        throw error;
      }
    },

    // Filter items with optional sort and limit
    filter: async (filters = {}, sort = null, limit = null) => {
      const params = buildQueryParams(filters, sort, limit);

      try {
        const result = await api.get(basePath, params);
        return normalizeArray(result);
      } catch (error) {
        throw error;
      }
    },

    // Get single item by ID
    get: async (id) => {
      return await api.get(`${basePath}/${id}`);
    },

    // Create new item
    create: async (data) => {
      return await api.post(basePath, data);
    },

    // Update item
    update: async (id, data) => {
      return await api.patch(`${basePath}/${id}`, data);
    },

    // Delete item
    delete: async (id) => {
      return await api.delete(`${basePath}/${id}`);
    },
  };
};

// Create entity instances for all entities used in the app
export const entities = {
  Product: createEntity('product'),
  ProductImage: createEntity('product-image'),
  Category: createEntity('category', '/categories'), // Fix pluralization
  Brand: createEntity('brand'),
  Department: createEntity('department'),
  User: createEntity('user'),
  StarCartItem: createEntity('cart-item'),
  Request: createEntity('request'),
  RequestItem: createEntity('request-item'),
  Ticket: createEntity('ticket'),
  TicketMessage: createEntity('ticket-message'),
  VIPPlan: createEntity('vip-plan'),
  NotificationTemplate: createEntity('notification-template'),
  WishlistItem: createEntity('wishlist-item'),
};

export default entities;

