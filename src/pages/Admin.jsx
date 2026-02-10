import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import {
  Package,
  ShoppingBag,
  Tag,
  Star,
  Plus,
  MessageCircle,
  Crown,
  TrendingUp,
  Users,
  DollarSign,
  Trophy,
  Activity,
  Server,
  ArrowRight,
  Zap,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NotificationCenter, { generateDemoNotifications } from '../components/admin/NotificationCenter';
import AccessDenied from '@/components/admin/AccessDenied';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { useRealtime } from '@/hooks/useRealtime';
import { toast } from 'sonner';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Admin() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [notifications, setNotifications] = useState(generateDemoNotifications());
  const [activeVisitors, setActiveVisitors] = useState(32);

  // Live Visitor Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVisitors(prev => Math.max(15, Math.min(65, prev + Math.floor(Math.random() * 5) - 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 📡 Initial Data Fetching
  const { data: stats, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const [
        products,
        requests,
        categories,
        brands,
        tickets,
        users,
        topProducts,
        recentActivity,
        salesData
      ] = await Promise.all([
        api.entities.Product.list(),
        api.entities.Request.list('-created_at', 100),
        api.entities.Category.list(),
        api.entities.Brand.list(),
        api.entities.Ticket.list(),
        api.entities.User.list(),
        api.admin.getTopProducts(5).catch(() => []),
        api.admin.getRecentActivity().catch(() => ({ orders: [] })),
        api.admin.getSalesData(7).catch(() => ({ data: [] }))
      ]);

      const vipUsers = users.filter(u => u.is_vip).length;
      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const totalRevenue = requests.reduce((sum, r) => sum + (parseFloat(r.total_sum) || 0), 0);
      const lowStock = products.filter(p => (p.stock ?? 0) < 10 && (p.stock ?? 0) > 0).slice(0, 5);

      // Chart Data
      let chartData = [{ name: 'Keine Daten', value: 0 }];
      if (salesData && Array.isArray(salesData.data)) {
        chartData = salesData.data.map(d => ({
          name: new Date(d.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
          value: parseFloat(d.amount) || 0
        }));
      }

      return {
        products: products.length,
        requests: requests.length,
        categories: categories.length,
        brands: brands.length,
        tickets: openTickets,
        vipUsers,
        revenue: totalRevenue,
        topProducts,
        recentRequests: recentActivity?.orders || [],
        lowStockProducts: lowStock,
        chartData
      };
    },
    staleTime: 60000,
  });

  // ⚡ Live Realtime Updates
  useRealtime('requests', (payload) => {
    // When a request changes (new order), refresh stats
    toast('New Activity detected', {
      description: `Order update: ${payload.eventType}`,
      icon: '🔔'
    });
    refetch();
  });

  if (isLoading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-transparent border-t-[#D6B25E] rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-[#D6B25E] rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const {
    products, requests, categories, brands, tickets, vipUsers, revenue,
    topProducts, recentRequests, lowStockProducts, chartData
  } = stats || {
    products: 0, requests: 0, categories: 0, brands: 0, tickets: 0, vipUsers: 0, revenue: 0,
    topProducts: [], recentRequests: [], lowStockProducts: [], chartData: []
  };

  const adminSections = [
    { title: 'Analytics', icon: TrendingUp, count: '📊', description: 'Statistiken & Charts', color: 'from-indigo-500 to-purple-500', link: 'AdminAnalytics' },
    { title: 'Produkte', icon: Package, count: products, description: 'Produkte verwalten', color: 'from-purple-500 to-pink-500', link: 'AdminProducts' },
    { title: 'Bestellungen', icon: ShoppingBag, count: requests, description: 'Offene Aufträge', color: 'from-blue-500 to-cyan-500', link: 'AdminRequests' },
    { title: 'Kategorien', icon: Tag, count: categories, description: 'Struktur verwalten', color: 'from-green-500 to-emerald-500', link: 'AdminCategories' },
    { title: 'Marken', icon: Star, count: brands, description: 'Marken Partner', color: 'from-orange-500 to-amber-500', link: 'AdminBrands' },
    { title: 'Support', icon: MessageCircle, count: tickets, description: 'Offene Tickets', color: 'from-cyan-500 to-blue-500', link: 'AdminSupport' },
    { title: 'Live Chat', icon: MessageCircle, count: '💬', description: 'Real-time', color: 'from-green-500 to-emerald-500', link: 'AdminLiveChat' },
    { title: 'VIP User', icon: Crown, count: vipUsers, description: 'Premium Mitglieder', color: 'from-yellow-500 to-amber-500', link: 'AdminSupport' },
    { title: 'Telegram', icon: MessageCircle, count: '🤖', description: 'Bot Settings', color: 'from-blue-500 to-indigo-500', link: 'AdminTelegramSettings' },
  ];

  // Show Access Denied if user is loaded but not admin
  if (!isLoading && user && user.role !== 'admin') {
    return <AccessDenied user={user} />;
  }

  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    shipped: { label: 'Versendet', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/15 text-red-400 border-red-500/30' }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-[#0A0C10] text-white overflow-hidden relative"
    >
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-10 bg-purple-600/50" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-10 bg-amber-600/50" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
        {/* 🚀 Cockpit Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <div className="px-3 py-1 rounded-full bg-[#D6B25E]/10 border border-[#D6B25E]/20 text-[#D6B25E] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6B25E] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D6B25E]"></span>
                </span>
                Nebula OS 2.0
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Command Center
            </h1>
            <p className="text-white/50 text-lg">Willkommen an Bord, <span className="text-white font-bold">{user?.full_name}</span>.</p>
          </motion.div>

          {/* Header Stats & Actions */}
          <motion.div variants={itemVariants} className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D6B25E]/50 text-white px-4 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 text-[#D6B25E] ${isRefetching ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isRefetching ? 'Updating...' : 'Refresh'}</span>
            </button>

            <NotificationCenter
              notifications={notifications}
              onClear={() => setNotifications([])}
              onMarkRead={(id) => {
                if (id === 'all') {
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                } else {
                  setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
                }
              }}
              onNotificationClick={(id) => console.log('Notification clicked:', id)}
            />

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 md:p-4 flex items-center gap-4 min-w-[140px]">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Live Visitors</span>
                <span className="text-2xl font-black text-emerald-400 tabular-nums">{activeVisitors}</span>
              </div>
              <div className="h-8 w-[1px] bg-white/10 mx-auto" />
              <div className="relative">
                <Users className="w-6 h-6 text-emerald-500/50" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#D6B25E]/20 to-[#D6B25E]/5 backdrop-blur-md border border-[#D6B25E]/20 rounded-2xl p-3 md:p-4 flex items-center gap-4 min-w-[180px]">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#D6B25E]/80 font-bold uppercase tracking-wider">Total Revenue</span>
                <span className="text-2xl font-black text-[#D6B25E] tabular-nums">
                  {revenue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              <DollarSign className="w-8 h-8 text-[#D6B25E]" />
            </div>
          </motion.div>
        </div>

        {/* 📉 Revenue Chart */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#D6B25E] to-[#b59142] rounded-xl shadow-lg shadow-[#D6B25E]/20">
                  <TrendingUp className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Revenue Overview</h3>
                  <p className="text-xs text-white/40">Performance der letzten 7 Tage</p>
                </div>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none focus:border-[#D6B25E]/50 transition-colors cursor-pointer hover:bg-white/10">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D6B25E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D6B25E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fontWeight: 'bold' }} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11, fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} dx={-10} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.8)' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value) => [`€ ${value}`, 'Umsatz']}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontSize: '12px' }}
                    cursor={{ stroke: '#D6B25E', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#D6B25E" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ⚡ Quick Actions Vertical */}
          <div className="space-y-4">
            <Link to={createPageUrl('AdminProductEditor')} className="block h-[48%] group">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full bg-gradient-to-br from-[#D6B25E] to-[#B59142] p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between shadow-xl shadow-[#D6B25E]/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/30 transition-colors" />
                <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <Plus className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-black text-black text-2xl leading-none mb-1">New Product</h3>
                  <p className="text-black/70 text-sm font-bold">Add to catalog</p>
                </div>
              </motion.div>
            </Link>

            <div className="h-[48%] grid grid-cols-2 gap-4">
              <Link to={createPageUrl('AdminRequests')} className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full bg-zinc-900 border border-zinc-800 hover:border-zinc-600 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-colors">
                  <ShoppingBag className="w-6 h-6 text-white mb-2" />
                  <div>
                    <h3 className="font-bold text-white text-lg leading-none">Orders</h3>
                    <p className="text-white/40 text-xs mt-1">Manage</p>
                  </div>
                </motion.div>
              </Link>
              <Link to={createPageUrl('AdminSystemMonitor')} className="block group">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="h-full bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-500/40 p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between transition-colors">
                  <div className="flex justify-between items-start">
                    <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-400 text-lg leading-none">System</h3>
                    <p className="text-emerald-500/50 text-xs mt-1">99.9% OK</p>
                  </div>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>


        {/* ⚠️ Low Stock Alerts */}
        <AnimatePresence>
          {lowStockProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 mb-6 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="p-1.5 bg-red-500/20 rounded-lg">
                  <Package className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400 text-sm">Low Stock Alert</h3>
                  <p className="text-[10px] text-red-300/60 uppercase tracking-wider font-bold">{lowStockProducts.length} Produkte kritisch</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 relative z-10">
                {lowStockProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={createPageUrl('AdminProductEditor') + `?id=${p.id}`}
                    className="flex items-center gap-2 bg-black/40 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors group"
                  >
                    <span className="text-xs text-white group-hover:text-red-200 transition-colors truncate max-w-[150px]">{p.name}</span>
                    <span className="text-[10px] font-mono bg-red-500/20 px-1.5 rounded text-red-400 font-bold">{p.stock ?? 0}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📊 Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {adminSections.map((section, i) => (
            <Link key={i} to={createPageUrl(section.link)} className="col-span-1">
              <motion.div
                whileHover={{ y: -5, backgroundColor: 'rgba(255,255,255,0.08)' }}
                className="bg-white/5 border border-white/5 rounded-2xl p-4 text-center transition-colors h-full flex flex-col items-center justify-center group"
              >
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${section.color} p-0.5 mb-2 shadow-lg opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <div className="w-full h-full bg-[#0A0C10] rounded-[10px] flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-xl font-black mb-0.5">{section.count}</div>
                <div className="text-[10px] text-white/40 font-bold uppercase truncate w-full">{section.title}</div>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* ⚡ Recent Activity & Top Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Live Activity */}
          <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black">Live Activity</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                REALTIME
              </div>
            </div>

            <div className="space-y-3">
              {recentRequests.map((req, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={req.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/5 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-400 group-hover:bg-[#D6B25E] group-hover:text-black transition-colors">
                        {req.id.slice(-2)}
                      </div>
                      {['processing', 'pending'].includes(req.status) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#18181b]" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        {req.contact_info?.name || 'Guest'}
                        <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold border ${statusConfig[req.status]?.color || 'border-zinc-700 bg-zinc-800 text-zinc-400'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-white/40 font-mono flex items-center gap-2">
                        <span className="opacity-50">#{req.id.slice(0, 6)}</span>
                        <span>•</span>
                        <Clock className="w-3 h-3" /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-[#D6B25E] font-mono">
                    +{req.total_sum?.toFixed(2)}€
                  </div>
                </motion.div>
              ))}
              {recentRequests.length === 0 && (
                <div className="text-center py-8 text-white/30 text-sm font-medium">Nothing happening yet...</div>
              )}
            </div>
          </motion.div>

          {/* Top Sellers */}
          <motion.div variants={itemVariants} className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-black text-2xl text-white">Top Sellers</h3>
                <p className="text-white/40 text-sm font-medium">Trending this week</p>
              </div>
              <div className="p-3 bg-[#D6B25E]/10 rounded-2xl">
                <Trophy className="w-6 h-6 text-[#D6B25E]" />
              </div>
            </div>
            <div className="space-y-4">
              {(topProducts && topProducts.length > 0 ? topProducts : [
                { product: { name: 'No sales yet' }, orderCount: 0 }
              ]).map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center font-black text-lg text-[#D6B25E] bg-[#D6B25E]/10 rounded-xl">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-bold text-sm text-white truncate max-w-[200px]">{item.product?.name || 'Unknown Item'}</div>
                      <div className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">{item.orderCount} sold</div>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.orderCount / (topProducts?.[0]?.orderCount || 1)) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-gradient-to-r from-[#D6B25E] to-[#FBF5E5]"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

      </div>
    </motion.div>
  );
}