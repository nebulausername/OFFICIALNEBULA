import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useWishlist } from '../components/wishlist/WishlistContext';
import { 
  User, 
  ShoppingBag, 
  HelpCircle, 
  MessageCircle, 
  Crown, 
  Settings, 
  LogOut,
  ArrowRight,
  Star,
  Package,
  Sparkles,
  Shield,
  Zap,
  Heart
} from 'lucide-react';

export default function Profile() {
  const { count: wishlistCount } = useWishlist();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    requestCount: 0,
    cartCount: 0,
    ticketCount: 0,
    openTicketCount: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Load stats
      const [requests, cartItems, tickets] = await Promise.all([
        base44.entities.Request.filter({ user_id: userData.id }),
        base44.entities.StarCartItem.filter({ user_id: userData.id }),
        base44.entities.Ticket.filter({ user_id: userData.id })
      ]);

      const openTickets = tickets.filter(t => 
        t.status === 'open' || t.status === 'in_progress'
      ).length;
      
      setStats({
        requestCount: requests.length,
        cartCount: cartItems.length,
        ticketCount: tickets.length,
        openTicketCount: openTickets
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const menuItems = [
    {
      title: 'Mein Konto',
      description: 'Persönliche Daten verwalten',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      link: createPageUrl('ProfileSettings'),
      stat: null
    },
    {
      title: 'Meine Bestellungen',
      description: 'Bestellungen & Status verfolgen',
      icon: Package,
      color: 'from-blue-500 to-cyan-500',
      link: createPageUrl('Requests'),
      stat: stats.requestCount
    },
    {
      title: 'Support Tickets',
      description: 'Deine Anfragen & Chat',
      icon: MessageCircle,
      color: 'from-cyan-500 to-blue-600',
      link: createPageUrl('Support'),
      stat: stats.openTicketCount,
      badge: stats.openTicketCount > 0 ? `${stats.openTicketCount} offen` : null
    },
    {
      title: 'Merkliste',
      description: 'Deine Favoriten',
      icon: Heart,
      color: 'from-red-500 to-pink-500',
      link: createPageUrl('Wishlist'),
      stat: wishlistCount
    },
    {
      title: 'VIP Programm',
      description: 'Exklusive Vorteile freischalten',
      icon: Crown,
      color: 'from-yellow-400 to-amber-500',
      link: createPageUrl('VIP'),
      badge: 'Premium'
    },
    {
      title: 'FAQ',
      description: 'Häufig gestellte Fragen',
      icon: MessageCircle,
      color: 'from-green-500 to-emerald-500',
      link: createPageUrl('FAQ'),
      stat: null
    },
    {
      title: 'Hilfe & Support',
      description: 'Wir helfen dir weiter',
      icon: HelpCircle,
      color: 'from-orange-500 to-red-500',
      link: createPageUrl('Help'),
      stat: null
    }
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      title: 'Admin Dashboard',
      description: 'Verwaltung & Einstellungen',
      icon: Settings,
      color: 'from-red-500 to-pink-500',
      link: createPageUrl('Admin'),
      badge: 'Admin'
    });
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <div className={`min-h-screen pb-24 md:pb-8 transition-colors duration-300 ${
      isDark
        ? 'bg-gradient-to-br from-zinc-950 to-zinc-900'
        : 'bg-gradient-to-br from-zinc-50 to-white'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center relative"
        >
          <div className={`absolute inset-0 rounded-full blur-3xl -z-10 ${
            isDark 
              ? 'bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/20'
              : 'bg-gradient-to-br from-purple-200/40 via-pink-200/40 to-purple-200/20'
          }`} />
          
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 inline-block"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl shadow-2xl ${
              isDark ? 'shadow-purple-600/50' : 'shadow-purple-400/40'
            }`} />
            <div className="relative w-full h-full flex items-center justify-center rounded-3xl">
              <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Star className="w-4 h-4 md:w-5 md:h-5 text-white" fill="white" />
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-black mb-3 ${
              isDark
                ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
            }`}
          >
            {user?.full_name || 'Mein Profil'}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-base md:text-lg flex items-center justify-center gap-2 flex-wrap font-semibold ${
              isDark ? 'text-zinc-300' : 'text-zinc-600'
            }`}
          >
            <Sparkles className="w-5 h-5 text-purple-500" />
            {user?.email}
          </motion.div>

          {user?.role === 'admin' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 ${
                isDark
                  ? 'bg-red-500/15 border-red-500/40 text-red-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-600'
              }`}
            >
              <Shield className="w-4 h-4" />
              Administrator
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`rounded-2xl p-6 text-center border-2 transition-all ${
              isDark
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-600/20'
                : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-300/30'
            }`}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Package className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </motion.div>
            <div className={`text-4xl font-black mb-1 ${isDark ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
              {stats.requestCount}
            </div>
            <p className={`text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Bestellungen</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className={`rounded-2xl p-6 text-center border-2 transition-all ${
              isDark
                ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-600/20'
                : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-300/30'
            }`}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className={`w-8 h-8 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </motion.div>
            <div className={`text-4xl font-black mb-1 ${isDark ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} bg-clip-text text-transparent`}>
              {stats.cartCount}
            </div>
            <p className={`text-sm font-bold ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>Im Warenkorb</p>
          </motion.div>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Link
                  to={item.link}
                  className="block glass backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-6 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/8 to-pink-500/8 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      {item.badge ? (
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className={`px-3.5 py-1.5 bg-gradient-to-r ${item.color} rounded-full text-xs font-black shadow-lg text-white`}
                        >
                          {item.badge}
                        </motion.div>
                      ) : item.stat !== null && item.stat > 0 ? (
                        <motion.div 
                          whileHover={{ scale: 1.15 }}
                          className="px-3.5 py-1.5 bg-purple-500/30 border-2 border-purple-500/50 rounded-full text-xs font-black text-purple-300 shadow-lg"
                        >
                          {item.stat}
                        </motion.div>
                      ) : (
                        <ArrowRight className="w-6 h-6 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-2 transition-all" />
                      )}
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-white group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Logout Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full glass backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-5 hover:border-red-500/60 hover:bg-red-500/10 hover:shadow-xl hover:shadow-red-500/20 transition-all group flex items-center justify-center gap-3"
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut className="w-6 h-6 text-zinc-400 group-hover:text-red-400 transition-colors" />
          </motion.div>
          <span className="font-black text-lg text-zinc-200 group-hover:text-red-400 transition-colors">
            Abmelden
          </span>
        </motion.button>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass backdrop-blur border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-500/20 transition-all group"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-10 h-10 text-purple-400 mx-auto mb-3 group-hover:text-purple-300" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold">Schneller Support</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass backdrop-blur border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-green-500/40 hover:shadow-xl hover:shadow-green-500/20 transition-all group"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-10 h-10 text-green-400 mx-auto mb-3 group-hover:text-green-300" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold">100% Sicher</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="glass backdrop-blur border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-yellow-500/40 hover:shadow-xl hover:shadow-yellow-500/20 transition-all group"
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-10 h-10 text-yellow-400 mx-auto mb-3 group-hover:text-yellow-300" fill="currentColor" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold">Premium Qualität</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}