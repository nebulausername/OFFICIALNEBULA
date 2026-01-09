import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
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
  Zap
} from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    requestCount: 0,
    cartCount: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Load stats
      const [requests, cartItems] = await Promise.all([
        base44.entities.Request.filter({ user_id: userData.id }),
        base44.entities.StarCartItem.filter({ user_id: userData.id })
      ]);
      
      setStats({
        requestCount: requests.length,
        cartCount: cartItems.length
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
      title: 'Meine Anfragen',
      description: 'Bestellungen & Status verfolgen',
      icon: ShoppingBag,
      color: 'from-blue-500 to-cyan-500',
      link: createPageUrl('Requests'),
      stat: stats.requestCount
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

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 blur-3xl -z-10" />
          
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-purple-500/50 relative"
          >
            <User className="w-12 h-12 md:w-16 md:h-16 text-white" />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full flex items-center justify-center"
            >
              <Star className="w-4 h-4 text-white" fill="white" />
            </motion.div>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-gradient">
            {user?.full_name || 'Mein Profil'}
          </h1>
          <p className="text-zinc-300 text-lg md:text-xl flex items-center justify-center gap-2 flex-wrap">
            <Sparkles className="w-5 h-5 text-purple-400" />
            {user?.email}
          </p>

          {user?.role === 'admin' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border border-red-500/30 rounded-full text-sm font-bold text-red-400"
            >
              <Shield className="w-4 h-4" />
              Administrator
            </motion.div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all"
          >
            <Package className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
              {stats.requestCount}
            </div>
            <p className="text-sm text-zinc-400 font-semibold">Anfragen</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 text-center hover:border-purple-500/50 transition-all"
          >
            <ShoppingBag className="w-8 h-8 text-pink-400 mx-auto mb-3" />
            <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {stats.cartCount}
            </div>
            <p className="text-sm text-zinc-400 font-semibold">Im Warenkorb</p>
          </motion.div>
        </div>

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
                  className="block glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      
                      {item.badge ? (
                        <div className={`px-3 py-1 bg-gradient-to-r ${item.color} rounded-full text-xs font-bold shadow-lg`}>
                          {item.badge}
                        </div>
                      ) : item.stat !== null && item.stat > 0 ? (
                        <div className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs font-bold text-purple-400">
                          {item.stat}
                        </div>
                      ) : (
                        <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      )}
                    </div>
                    
                    <h3 className="font-black text-xl mb-2 text-zinc-100 group-hover:text-purple-300 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">
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
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-5 hover:border-red-500/50 transition-all group flex items-center justify-center gap-3"
        >
          <LogOut className="w-5 h-5 text-zinc-400 group-hover:text-red-400 transition-colors" />
          <span className="font-bold text-zinc-300 group-hover:text-red-400 transition-colors">
            Abmelden
          </span>
        </motion.button>

        {/* Info Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass backdrop-blur border border-zinc-800 rounded-xl p-5 text-center"
          >
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-semibold">Schneller Support</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass backdrop-blur border border-zinc-800 rounded-xl p-5 text-center"
          >
            <Shield className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-semibold">100% Sicher</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass backdrop-blur border border-zinc-800 rounded-xl p-5 text-center"
          >
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-xs text-zinc-400 font-semibold">Premium Qualität</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}