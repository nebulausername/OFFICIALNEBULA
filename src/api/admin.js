import { db, auth as insforgeAuth } from '@/lib/insforge';


export const admin = {
  // Get dashboard statistics
  getStats: async () => {
    try {
      // Parallel queries for efficiency
      const [users, requests, revenue] = await Promise.all([
        db.from('users').select('id', { count: 'exact', head: true }),
        db.from('requests').select('id', { count: 'exact', head: true }),
        db.from('requests').select('total_sum').neq('status', 'cancelled')
      ]);

      const totalRevenue = revenue.data?.reduce((sum, order) => sum + (Number(order.total_sum) || 0), 0) || 0;

      return {
        data: {
          usersCount: users.count || 0,
          ordersCount: requests.count || 0,
          revenue: totalRevenue,
          growth: { // Mock growth for now
            users: 5,
            orders: 12,
            revenue: 8
          }
        }
      };
    } catch (err) {
      console.error('Admin Stats Error:', err);
      return { data: { usersCount: 0, ordersCount: 0, revenue: 0 } };
    }
  },

  // User management
  listUsers: async (params = {}) => {
    let query = db.from('users').select('*');
    if (params.page && params.limit) {
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);
    }
    if (params.search) {
      query = query.or(`email.ilike.%${params.search}%,full_name.ilike.%${params.search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data };
  },

  toggleVIP: async (userId, data) => {
    // data = { is_vip: boolean } or similar
    // We update 'rank' or 'is_vip' depending on schema. Schema has both.
    const updates = {
      is_vip: data.is_vip,
      rank: data.is_vip ? 'vip' : 'nutzer'
    };
    const { data: user, error } = await db.from('users').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return { data: user };
  },

  getChatSessions: async () => {
    const { data, error } = await db.from('chat_sessions').select('*, user:users(*)').order('updated_at', { ascending: false });
    if (error) throw error;
    return { data };
  },

  getChatHistory: async (sessionId) => {
    const { data, error } = await db.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
    if (error) throw error;
    return { data };
  },

  getTopProducts: async (limit = 10) => {
    // 1. Get all request items from completed orders
    const { data, error } = await db.from('request_items').select('product_id, quantity_snapshot, product:products(name, cover_image, price)');
    if (error) throw error;

    // Aggregation
    const productStats = {};
    data.forEach(item => {
      if (!item.product) return;
      const pid = item.product_id;
      if (!productStats[pid]) {
        productStats[pid] = {
          id: pid,
          name: item.product.name,
          image: item.product.cover_image,
          price: item.product.price,
          sales: 0
        };
      }
      productStats[pid].sales += item.quantity_snapshot;
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);

    return topProducts; // Return array directly
  },

  getRecentActivity: async () => {
    const { data, error } = await db
      .from('requests')
      .select('id, user:users(full_name), total_sum, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Transform to activity format
    const activities = data.map(req => ({
      id: req.id,
      type: 'order',
      description: `Order ${req.id.slice(0, 8)} placed by ${req.user?.full_name || 'Guest'}`,
      timestamp: req.created_at,
      amount: req.total_sum,
      status: req.status,
      contact_info: { name: req.user?.full_name || 'Guest' } // For Admin.jsx
    }));

    return { orders: activities }; // Return { orders: ... }
  },

  getSalesData: async (days = 30) => {
    // Fetch last 30 days orders
    const date = new Date();
    date.setDate(date.getDate() - days);

    const { data, error } = await db
      .from('requests')
      .select('created_at, total_sum')
      .gte('created_at', date.toISOString())
      .neq('status', 'cancelled');

    if (error) throw error;

    // Aggregate by day
    const salesByDay = {};
    data.forEach(order => {
      const day = new Date(order.created_at).toLocaleDateString();
      salesByDay[day] = (salesByDay[day] || 0) + Number(order.total_sum);
    });

    const chartData = Object.keys(salesByDay).map(date => ({
      date,
      amount: salesByDay[date]
    }));

    return { data: chartData };
  },

  getCategoryRevenue: async (days = 30) => {
    // This implies joining requests -> request_items -> products -> categories
    // Too complex for simple query. Mock or approximate?
    // Or fetch all request_items in period and map.
    return { data: [] }; // Placeholder for now to avoid breaking
  },

  getUserGrowth: async (days = 30) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const { data, error } = await db
      .from('users')
      .select('created_at')
      .gte('created_at', date.toISOString());

    if (error) throw error;

    // Aggregate by day
    const growthByDay = {};
    data.forEach(user => {
      const day = new Date(user.created_at).toLocaleDateString();
      growthByDay[day] = (growthByDay[day] || 0) + 1;
    });

    const chartData = Object.keys(growthByDay).map(date => ({
      date,
      count: growthByDay[date]
    }));
    return { data: chartData };
  },
  // Telegram
  getTelegramConfig: async () => {
    try {
      const { data: { session } } = await insforgeAuth.getSession();
      const token = session?.access_token;

      const response = await fetch('http://localhost:8000/api/admin/telegram/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch config');
      const data = await response.json();
      return { data };
    } catch (e) {
      console.error('Telegram Config Error:', e);
      return { data: {} };
    }
  },

  sendTestNotification: async (data) => {
    try {
      const { data: { session } } = await insforgeAuth.getSession();
      const token = session?.access_token;

      const response = await fetch('http://localhost:8000/api/admin/telegram/test-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (e) {
      console.error('Test Notification Error:', e);
      return { success: false, message: e.message };
    }
  },
};

export default admin;

