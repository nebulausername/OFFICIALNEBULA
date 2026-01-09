import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  ShoppingBag, 
  Tag, 
  Star,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  ArrowUpRight,
  Clock,
  CheckCircle2
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
    brands: 0
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
      const [products, requests, categories, brands] = await Promise.all([
        base44.entities.Product.list(),
        base44.entities.Request.list('-created_date', 100),
        base44.entities.Category.list(),
        base44.entities.Brand.list()
      ]);

      setStats({
        products: products.length,
        requests: requests.length,
        categories: categories.length,
        brands: brands.length
      });

      // Get recent requests (last 5)
      setRecentRequests(requests.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-red-500 to-purple-500 rounded-2xl flex items-center justify-center"
        >
          <Settings className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    shipped: { label: 'Versendet', color: 'bg-green-500/20 text-green-300 border-green-500/30' },
    completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-300 border-red-500/30' }
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
      title: 'Anfragen',
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
      color: 'from-orange-500 to-red-500',
      link: 'AdminBrands'
    }
  ];

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-b from-zinc-950 via-zinc-900 to-black'
        : 'bg-gradient-to-b from-white via-zinc-50 to-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative mb-12 md:mb-16"
        >
          {/* Gradient Background */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-purple-200/40 via-pink-200/40 to-red-200/40 rounded-full blur-3xl -z-10" />
          
          <div className="relative z-10">
            {/* Icon & Title */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-xl opacity-60" />
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/40">
                    <Settings className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mt-6 mb-3 text-zinc-900">
                Admin Panel
              </h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-zinc-600 font-bold flex items-center justify-center gap-2 flex-wrap"
              >
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0" />
                <span>Hallo, <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-black">{user.full_name}</span></span>
              </motion.p>
            </motion.div>

            {/* Status Bar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-6 px-6 py-4 bg-white border border-zinc-200 rounded-xl shadow-sm max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                />
                <span className="font-semibold text-zinc-700 text-sm">System aktiv</span>
              </div>
              <div className="w-px h-5 bg-zinc-300" />
              <div className="flex items-center gap-2 text-zinc-600 font-medium text-sm">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-12 md:mb-16">
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
                  className="group relative overflow-hidden bg-white border-2 border-zinc-200 rounded-2xl p-5 md:p-6 cursor-pointer hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-8 -mt-8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${section.color} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}
                      >
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </motion.div>
                      <motion.span 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.15 }}
                        className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                      >
                        {section.count}
                      </motion.span>
                    </div>
                    <h3 className="text-zinc-900 font-black text-sm md:text-base mb-1 group-hover:text-purple-700 transition-colors">{section.title}</h3>
                    <p className="text-zinc-500 text-xs font-medium">{section.description}</p>
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
          className="bg-gradient-to-br from-white to-zinc-50 border-2 border-zinc-200 rounded-2xl p-6 md:p-8 relative overflow-hidden mb-12 md:mb-16"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 via-pink-100 to-transparent rounded-full -mr-16 -mt-16 opacity-60" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.4 }}
                className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"
              >
                <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900">
                Schnellzugriff
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              <Link to={createPageUrl('AdminProducts') + '?action=new'}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  Produkt
                </motion.button>
              </Link>
              
              <Link to={createPageUrl('AdminCategories') + '?action=new'}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/40 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  Kategorie
                </motion.button>
              </Link>
              
              <Link to={createPageUrl('AdminBrands') + '?action=new'}>
                <motion.button
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-lg hover:shadow-orange-500/40 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  Marke
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
          className="bg-white border-2 border-zinc-200 rounded-2xl p-6 md:p-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-100 via-cyan-100 to-transparent rounded-full -mr-20 -mt-20 opacity-50" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg"
                >
                  <Activity className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-zinc-900">
                    Letzte Aktivität
                  </h2>
                  <p className="text-zinc-500 text-xs md:text-sm font-medium mt-0.5">Neueste Anfragen</p>
                </div>
              </div>
              <Link to={createPageUrl('AdminRequests')}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/30 rounded-xl transition-all text-blue-300 font-bold"
                >
                  <span>Alle anzeigen</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-10 h-10 text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium text-lg">Noch keine Anfragen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                <AnimatePresence>
                  {recentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08 }}
                      whileHover={{ x: 3 }}
                      className="bg-zinc-50 border border-zinc-200 rounded-lg md:rounded-xl p-4 md:p-5 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
                      onClick={() => window.location.href = createPageUrl('AdminRequests')}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <ShoppingBag className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-sm md:text-base text-zinc-900 truncate">
                                Anfrage #{request.id.slice(0, 8)}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${statusConfig[request.status]?.color || 'bg-zinc-200 text-zinc-600'}`}>
                                {statusConfig[request.status]?.label || request.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs md:text-sm text-zinc-600 font-medium">
                              <span className="truncate">{request.contact_info?.name || 'Unbekannt'}</span>
                              <span className="text-zinc-400">•</span>
                              <span>{new Date(request.created_date).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-lg md:text-xl font-black text-zinc-900">
                              {request.total_sum?.toFixed(2)}€
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
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