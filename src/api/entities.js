import { db } from '@/lib/insforge';
// Removed api import as we are bypassing the proxy

// Map entity names to table names
const TABLE_MAP = {
  'product': 'products',
  'product-image': 'product_images',
  'category': 'categories',
  'brand': 'brands',
  'department': 'departments',
  'user': 'users', // Public users table
  'cart-item': 'cart_items',
  'request': 'requests',
  'request-item': 'request_items',
  'ticket': 'tickets',
  'ticket-message': 'ticket_messages',
  'vip-plan': 'vip_plans',
  'notification-template': 'notification_templates',
  'wishlist-item': 'wishlist_items',
  'verification-request': 'verification_requests'
};

// Generic entity factory - optimized for InsForge
const createEntity = (entityName, customBasePath = null) => {
  const tableName = TABLE_MAP[entityName] || entityName + 's';

  return {
    // List all items with optional sort and limit
    list: async (sort = null, limit = null) => {
      let query = db.from(tableName).select('*');

      // Sorting
      if (sort) {
        // "price_asc" -> column: price, ascending: true
        // "created_at_desc" -> column: created_at, ascending: false
        const parts = sort.split('_');
        const direction = parts.pop(); // 'asc' or 'desc'
        const column = parts.join('_');
        query = query.order(column, { ascending: direction === 'asc' });
      } else {
        // Default sort
        if (tableName === 'products' || tableName === 'requests') {
          query = query.order('created_at', { ascending: false });
        } else if (['categories', 'departments', 'brands'].includes(tableName)) {
          query = query.order('sort_order', { ascending: true });
        }
      }

      // Limit
      if (limit) {
        query = query.limit(Number(limit));
      }

      const { data, error } = await query;

      if (error) {
        console.error(`InsForge List Error (${tableName}):`, error);
        throw error; // Or return []
      }
      return data || [];
    },

    // Filter items with optional sort and limit
    filter: async (filters = {}, sort = null, limit = null) => {
      let query = db.from(tableName).select('*');

      // Apply Filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          // Check for helpers like "min_price" or ranges?
          // For now, assume direct equality or simple mapping
          // Special handling for legacy filters might be needed
          query = query.eq(key, value);
        }
      });

      // Sorting (Same as list)
      if (sort) {
        const parts = sort.split('_');
        const direction = parts.pop();
        const column = parts.join('_');
        query = query.order(column, { ascending: direction === 'asc' });
      }

      // Limit
      if (limit) {
        query = query.limit(Number(limit));
      }

      const { data, error } = await query;

      if (error) {
        console.error(`InsForge Filter Error (${tableName}):`, error);
        throw error;
      }
      return data || [];
    },

    // Get single item by ID
    get: async (id) => {
      const { data, error } = await db
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },

    // Create new item
    create: async (data) => {
      const { data: created, error } = await db
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return created;
    },

    // Update item
    update: async (id, data) => {
      const { data: updated, error } = await db
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },

    // Delete item
    delete: async (id) => {
      const { error } = await db
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
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
  VerificationRequest: createEntity('verification-request'),
};

export default entities;

