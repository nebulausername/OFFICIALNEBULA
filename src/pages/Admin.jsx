import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Star,
  Plus,
  Settings,
  Sparkles,
  Activity,
  ArrowUpRight,
  Clock,
  MessageCircle,
  Mail,
  Users,
  Crown,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Admin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    products: 0,
    requests: 0,
    categories: 0,
    brands: 0,
    tickets: 0,
    vipUsers: 0
  });
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    loadStats();
  }, []);

  const checkAdmin = async () => {
    try {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);
    } catch (error) {
      window.location.href = createPageUrl('Home');
    }
  };

  const loadStats = async () => {
    try {
      const [products, requests, categories, brands, tickets, users] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.Request.list('-created_date', 100),
        base44.entities.Category.list(),
        base44.entities.Brand.list(),
        base44.entities.Ticket.list(),
        base44.entities.User.list()
      ]);

      const vipUsers = users.filter(u => u.is_vip).length;
      const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

      setStats({
        products: products.length,
        requests: requests.length,
        categories: categories.length,
        brands: brands.length,
        tickets: openTickets,
        vipUsers: vipUsers
      });

      setRecentRequests(requests.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-gold to-gold2 rounded-2xl flex items-center justify-center"
        >
          <Settings className="w-8 h-8 text-black" />
        </motion.div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
    shipped: { label: 'Versendet', color: 'bg-green-500/15 text-green-400 border-green-500/30' },
    completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/15 text-red-400 border-red-500/30' }
  };

  const adminSections = [
    {
      title: 'Produkte',
      icon: Package,
      count: stats.products,
      description: 'Produkte verwalten',
      color: 'from-purple-500 to-pink-500',
      link: 'AdminProducts'
    },
    {
      title: 'Bestellungen',
      icon: ShoppingBag,
      count: stats.requests,
      description: 'Kundenanfragen bearbeiten',
      color: 'from-blue-500 to-cyan-500',
      link: 'AdminRequests'
    },
    {
      title: 'Kategorien',
      icon: Tag,
      count: stats.categories,
      description: 'Kategorien & Departments',
      color: 'from-green-500 to-emerald-500',
      link: 'AdminCategories'
    },
    {
      title: 'Marken',
      icon: Star,
      count: stats.brands,
      description: 'Marken verwalten',
      color: 'from-orange-500 to-amber-500',
      link: 'AdminBrands'
    },
    {
      title: 'Support',
      icon: MessageCircle,
      count: stats.tickets,
      description: 'Offene Tickets',
      color: 'from-cyan-500 to-blue-500',
      link: 'AdminSupport'
    },
    {
      title: 'VIP User',
      icon: Crown,
      count: stats.vipUsers,
      description: 'Premium Mitglieder',
      color: 'from-yellow-500 to-amber-500',
      link: 'AdminSupport'
    }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 md:mb-16"
        >
          <div className="relative z-10 text-center">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center mb-6"
            >
              <div className="relative">
                <motion.div 
                  animate={{ 
                    boxShadow: [
                      '0 0 30px rgba(214, 178, 94, 0.3)',
                      '0 0 50px rgba(214, 178, 94, 0.5)',
                      '0 0 30px rgba(214, 178, 94, 0.3)',
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gold to-gold2 rounded-2xl flex items-center justify-center shadow-2xl"
                >
                  <Settings className="w-10 h-10 md:w-12 md:h-12 text-black" />
                </motion.div>
              </div>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
              Admin Panel
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl font-bold flex items-center justify-center gap-2 flex-wrap"
              style={{ color: 'rgba(255, 255, 255, 0.70)' }}
            >
              <Sparkles className="w-5 h-5 text-gold flex-shrink-0" />
              <span>Willkommen zurück, <span className="text-gold font-black">{user.full_name}</span></span>
            </motion.p>
          </div>

          {/* Status Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-6 px-6 py-4 rounded-xl max-w-2xl mx-auto mt-8"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(214, 178, 94, 0.2)'
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
              />
              <span className="font-bold text-base" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>System aktiv</span>
            </div>
            <div className="w-px h-5 bg-white/20" />
            <div className="flex items-center gap-2 font-semibold text-base" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
              <Clock className="w-4 h-4" />
              {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-12 md:mb-16">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={createPageUrl(section.link)}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className="group relative overflow-hidden rounded-2xl p-5 md:p-6 cursor-pointer transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-[0.12] transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center shadow-xl`}
                      >
                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                      </motion.div>
                      <motion.span 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.15 }}
                        className="text-3xl md:text-4xl font-black text-gold"
                      >
                        {section.count}
                      </motion.span>
                    </div>
                    <h3 className="font-black text-lg md:text-xl mb-1 group-hover:text-gold2 transition-colors" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                      {section.title}
                    </h3>
                    <p className="text-sm md:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                      {section.description}
                    </p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden mb-12 md:mb-16"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(214, 178, 94, 0.2)'
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="w-14 h-14 bg-gradient-to-br from-gold to-gold2 rounded-xl flex items-center justify-center shadow-xl"
              >
                <Plus className="w-7 h-7 text-black" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                Schnellzugriff
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Link to={createPageUrl('AdminProducts') + '?action=new'}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-16 md:h-18 bg-gradient-to-r from-gold to-gold2 text-black font-black rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-gold/30"
                >
                  <Plus className="w-6 h-6" />
                  Neues Produkt
                </motion.button>
              </Link>
              
              <Link to={createPageUrl('AdminCategories') + '?action=new'}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-16 md:h-18 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-green-500/30"
                >
                  <Plus className="w-6 h-6" />
                  Kategorie
                </motion.button>
              </Link>
              
              <Link to={createPageUrl('AdminRequests')}>
                <motion.button
                  whileHover={{ scale: 1.03, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-16 md:h-18 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3 text-lg shadow-xl shadow-purple-500/30"
                >
                  <TrendingUp className="w-6 h-6" />
                  Bestellungen
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.10)'
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl"
                >
                  <Activity className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                    Letzte Aktivität
                  </h2>
                  <p className="text-sm md:text-base font-semibold mt-0.5" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                    Neueste Bestellungen
                  </p>
                </div>
              </div>
              <Link to={createPageUrl('AdminRequests')}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-base"
                  style={{
                    background: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    color: 'rgba(147, 197, 253, 1)'
                  }}
                >
                  <span>Alle anzeigen</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255, 255, 255, 0.06)' }}>
                  <ShoppingBag className="w-10 h-10" style={{ color: 'rgba(255, 255, 255, 0.40)' }} />
                </div>
                <p className="font-semibold text-lg" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                  Noch keine Bestellungen vorhanden
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {recentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      whileHover={{ x: 4 }}
                      className="rounded-xl p-4 md:p-5 transition-all cursor-pointer group"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                      onClick={() => window.location.href = createPageUrl('AdminRequests')}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-base md:text-lg truncate" style={{ color: 'rgba(255, 255, 255, 0.95)' }}>
                                #{request.id.slice(0, 8)}
                              </h3>
                              <span className={`px-2.5 py-1 rounded-lg text-sm font-bold border ${statusConfig[request.status]?.color || 'bg-zinc-500/20 text-zinc-400'}`}>
                                {statusConfig[request.status]?.label || request.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm md:text-base font-semibold" style={{ color: 'rgba(255, 255, 255, 0.60)' }}>
                              <span className="truncate">{request.contact_info?.name || 'Unbekannt'}</span>
                              <span style={{ color: 'rgba(255, 255, 255, 0.30)' }}>•</span>
                              <span>{new Date(request.created_date).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xl md:text-2xl font-black text-gold">
                              {request.total_sum?.toFixed(2)}€
                            </div>
                          </div>
                          <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" style={{ color: 'rgba(255, 255, 255, 0.40)' }} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}