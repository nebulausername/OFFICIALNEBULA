import { useState, useEffect } from 'react';
import { api } from '@/api';

export const useAdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try admin stats endpoint first
      try {
        const data = await api.get('/admin/stats');
        setStats(data);
      } catch {
        // Fallback to individual calls
        const [products, requests, categories, brands, tickets, users] = await Promise.all([
          api.entities.Product.list(),
          api.entities.Request.list('-created_date', 100),
          api.entities.Category.list(),
          api.entities.Brand.list(),
          api.entities.Ticket.list(),
          api.entities.User.list()
        ]);

        const vipUsers = users.filter(u => u.is_vip).length;
        const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

        setStats({
          overview: {
            products: products.length,
            orders: requests.length,
            categories: categories.length,
            brands: brands.length,
            tickets: openTickets,
            users: users.length,
            vipUsers,
            openTickets,
            pendingOrders: requests.filter(r => r.status === 'pending').length,
          },
          revenue: {
            total: 0,
            today: 0,
            week: 0,
            month: 0,
          },
          recentOrders: requests.slice(0, 5),
          topProducts: [],
        });
      }
    } catch (err) {
      console.error('Error loading admin stats:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: loadStats };
};

export default useAdminStats;

