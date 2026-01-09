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

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 md:mb-16 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-purple-500/20 blur-3xl -z-10" />
          
          <motion.div
            whileHover={{ scale: 1.05, rotate: -5 }}
            className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-red-500/50 relative overflow-hidden"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            />
            <Settings className="w-10 h-10 md:w-14 md:h-14 text-white relative z-10" />
          </motion.div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black mb-4 px-4 tracking-tight">
            <span className="bg-gradient-to-r from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
              Admin Dashboard
            </span>
          </h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-200 text-base sm:text-lg md:text-xl flex flex-wrap items-center justify-center gap-2 px-4 font-semibold"
          >
            <Sparkles className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
            <span>Willkommen zurück, <span className="font-black text-xl md:text-2xl bg-gradient-to-r from-red-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-gradient">{user.full_name}</span></span>
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex items-center justify-center gap-3 text-sm text-zinc-400"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="font-medium">System aktiv</span>
            </div>
            <span className="text-zinc-600">•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span className="font-medium">{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-16">
          {adminSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} to={createPageUrl(section.link)}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl md:rounded-3xl p-5 md:p-8 cursor-pointer hover:border-red-500/60 hover:shadow-2xl hover:shadow-red-500/30 transition-all"
                >
                  <motion.div 
                    className={`absolute inset-0 bg-gradient-to-br ${section.color} opacity-0 group-hover:opacity-20 transition-opacity`}
                    animate={{ 
                      backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex flex-col gap-4 mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${section.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}
                      >
                        <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                      </motion.div>
                      <motion.span 
                        initial={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        className="text-4xl md:text-5xl font-black bg-gradient-to-br from-red-300 via-pink-300 to-purple-300 bg-clip-text text-transparent"
                      >
                        {section.count}
                      </motion.span>
                    </div>
                    <h3 className="text-zinc-100 font-black mb-2 text-base md:text-xl tracking-tight group-hover:text-white transition-colors">{section.title}</h3>
                    <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-medium">{section.description}</p>
                  </div>

                  <motion.div
                    className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-30 transition-opacity blur-2xl"
                    style={{
                      background: `linear-gradient(135deg, ${section.color.includes('purple') ? '#a855f7' : section.color.includes('blue') ? '#3b82f6' : section.color.includes('green') ? '#10b981' : '#f97316'}, transparent)`
                    }}
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl p-6 md:p-10 relative overflow-hidden mb-12 md:mb-16"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-pink-500/5 to-purple-500/5" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
              <motion.div 
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
                className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-red-300 to-pink-300 bg-clip-text text-transparent tracking-tight">
                Schnellzugriff
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
              <Link to={createPageUrl('AdminProducts') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative overflow-hidden"
                >
                  <Button className="w-full h-16 md:h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 text-base md:text-xl font-black rounded-2xl transition-all relative overflow-hidden animate-gradient">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-200%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <Plus className="w-7 h-7 mr-2 relative z-10" />
                    <span className="relative z-10">Neues Produkt</span>
                  </Button>
                </motion.div>
              </Link>
              
              <Link to={createPageUrl('AdminCategories') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Button className="w-full h-16 md:h-24 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 hover:shadow-2xl hover:shadow-green-500/50 text-base md:text-xl font-black rounded-2xl transition-all animate-gradient">
                    <Plus className="w-7 h-7 mr-2" />
                    Neue Kategorie
                  </Button>
                </motion.div>
              </Link>
              
              <Link to={createPageUrl('AdminBrands') + '?action=new'}>
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Button className="w-full h-16 md:h-24 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 hover:shadow-2xl hover:shadow-red-500/50 text-base md:text-xl font-black rounded-2xl transition-all animate-gradient">
                    <Plus className="w-7 h-7 mr-2" />
                    Neue Marke
                  </Button>
                </motion.div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-3xl p-6 md:p-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-blue-500/5" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-xl"
                >
                  <Activity className="w-7 h-7 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-2xl md:text-4xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent tracking-tight">
                    Letzte Aktivität
                  </h2>
                  <p className="text-zinc-400 text-sm font-medium mt-1">Neueste Anfragen</p>
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
              <div className="space-y-3">
                <AnimatePresence>
                  {recentRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ x: 5 }}
                      className="glass backdrop-blur border border-zinc-800 rounded-2xl p-5 md:p-6 hover:border-blue-500/30 transition-all cursor-pointer group"
                      onClick={() => window.location.href = createPageUrl('AdminRequests')}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="w-6 h-6 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-bold text-base md:text-lg text-zinc-100 truncate">
                                Anfrage #{request.id.slice(0, 8)}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[request.status]?.color || 'bg-zinc-800 text-zinc-400'}`}>
                                {statusConfig[request.status]?.label || request.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400 font-medium">
                              <span className="truncate">{request.contact_info?.name || 'Unbekannt'}</span>
                              <span className="text-zinc-600">•</span>
                              <span>{new Date(request.created_date).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                              {request.total_sum?.toFixed(2)}€
                            </div>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
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