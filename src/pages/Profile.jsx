import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '@/api';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { useWishlist } from '../components/wishlist/WishlistContext';
import { useI18n } from '../components/i18n/I18nProvider';
import {
  User,
  ShoppingBag,
  HelpCircle,
  MessageCircle,
  Crown,
  LogOut,
  ArrowRight,
  Star,
  Package,
  Sparkles,
  Shield,
  Zap,
  Heart
} from 'lucide-react';
import RankCard from './Profile/RankCard';

export default function Profile() {
  const { t } = useI18n();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    requestCount: 0,
    cartCount: 0,
    ticketCount: 0,
    openTicketCount: 0
  });

  const isDark = useMemo(() =>
    document.documentElement.getAttribute('data-theme') === 'dark',
    []
  );

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = await api.auth.me();
      setUser(userData);

      // Load stats in parallel for better performance
      const [requests, cartItems, tickets] = await Promise.all([
        api.entities.Request.filter({ user_id: userData.id }).catch(() => []),
        api.entities.StarCartItem.filter({ user_id: userData.id }).catch(() => []),
        api.entities.Ticket.filter({ user_id: userData.id }).catch(() => [])
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
      // Don't show error if it's just a network issue - user might be offline
      if (error.networkError) {
        // Set default user for offline mode
        setUser({
          full_name: 'Gast',
          email: 'offline@nebula.supply',
          role: 'user'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleLogout = useCallback(() => {
    api.auth.logout();
    navigate(createPageUrl('Home'));
  }, [navigate]);

  // Memoize menuItems to prevent unnecessary re-renders
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        title: t('profile.myAccount'),
        description: t('profile.accountDescription'),
        icon: User,
        color: 'from-purple-500 to-pink-500',
        link: createPageUrl('ProfileSettings'),
        stat: null,
        adminOnly: false
      },
      {
        title: t('profile.orders'),
        description: t('profile.ordersDescription'),
        icon: Package,
        color: 'from-blue-500 to-cyan-500',
        link: createPageUrl('Requests'),
        stat: stats.requestCount,
        adminOnly: false
      },
      {
        title: t('profile.supportTickets'),
        description: t('profile.supportTicketsDescription'),
        icon: MessageCircle,
        color: 'from-cyan-500 to-blue-600',
        link: createPageUrl('Support'),
        stat: stats.openTicketCount,
        badge: stats.openTicketCount > 0 ? `${stats.openTicketCount} ${t('profile.open')}` : null,
        adminOnly: false
      },
      {
        title: t('nav.wishlist'),
        description: t('profile.wishlistDescription'),
        icon: Heart,
        color: 'from-red-500 to-pink-500',
        link: createPageUrl('Wishlist'),
        stat: wishlistCount,
        adminOnly: false
      },
      {
        title: t('profile.vipProgram'),
        description: t('profile.vipDescription'),
        icon: Crown,
        color: 'from-yellow-400 to-amber-500',
        link: createPageUrl('VIP'),
        badge: 'Premium',
        adminOnly: false
      },
      {
        title: t('profile.faq'),
        description: t('profile.faqDescription'),
        icon: MessageCircle,
        color: 'from-green-500 to-emerald-500',
        link: createPageUrl('FAQ'),
        stat: null,
        adminOnly: false
      },
      {
        title: t('profile.helpSupport'),
        description: t('profile.helpDescription'),
        icon: HelpCircle,
        color: 'from-orange-500 to-red-500',
        link: createPageUrl('Help'),
        stat: null,
        adminOnly: false
      }
    ];

    // Add Admin Dashboard link only for admins - at the top for visibility
    // SECURITY: This ensures only users with role 'admin' can see this link
    if (user?.role === 'admin') {
      return [
        {
          title: 'Admin Dashboard',
          description: 'Verwalte Produkte, Bestellungen und Einstellungen',
          icon: Shield,
          color: 'from-red-500 via-orange-500 to-amber-500',
          link: createPageUrl('Admin'),
          badge: 'Admin',
          adminOnly: true
        },
        ...baseItems
      ];
    }

    return baseItems;
  }, [t, stats, wishlistCount, user?.role]);

  if (loading) {
    return (
      <div className={`min-h-screen pb-24 md:pb-8 transition-colors duration-300 flex items-center justify-center ${isDark
        ? 'bg-gradient-to-br from-zinc-950 to-zinc-900'
        : 'bg-gradient-to-br from-zinc-50 to-white'
        }`}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 md:pb-8 transition-colors duration-300 ${isDark
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
          <div className={`absolute inset-0 rounded-full blur-3xl -z-10 ${isDark
            ? 'bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-purple-600/20'
            : 'bg-gradient-to-br from-purple-200/40 via-pink-200/40 to-purple-200/20'
            }`} />

          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 inline-block"
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-3xl shadow-2xl ${isDark ? 'shadow-purple-600/50' : 'shadow-purple-400/40'
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}
            className={`text-4xl sm:text-5xl md:text-6xl font-black mb-3 ${isDark
              ? 'bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent'
              : 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent'
              }`}
            style={{ textShadow: isDark ? '0 0 30px rgba(168, 85, 247, 0.3)' : 'none' }}
          >
            {user?.full_name || t('profile.title') || 'Profil'}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 100 }}
            className={`text-base md:text-lg flex items-center justify-center gap-2 flex-wrap font-semibold ${isDark ? 'text-zinc-300' : 'text-zinc-600'
              }`}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
            </motion.div>
            <span className="truncate max-w-xs">{user?.email || 'Keine Email'}</span>
          </motion.div>

          {user?.role === 'admin' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className={`mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border-2 ${isDark
                ? 'bg-red-500/15 border-red-500/40 text-red-300'
                : 'bg-red-500/10 border-red-500/30 text-red-600'
                }`}
            >
              <Shield className="w-4 h-4" />
              {t('profile.administrator')}
            </motion.div>
          )}
        </motion.div>

        {/* 🌟 Nebula Rank Progression Card */}
        <div className="mb-12">
          <RankCard user={user} />
        </div>

        {/* Quick Stats - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
          className="grid grid-cols-2 gap-4 mb-12"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.03, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-2xl p-6 text-center border-2 transition-all overflow-hidden group ${isDark
              ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30 hover:border-purple-400/60 hover:shadow-xl hover:shadow-purple-600/30'
              : 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-300/40'
              }`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="relative z-10"
            >
              <Package className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className={`text-4xl font-black mb-1 relative z-10 ${isDark ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gradient-to-r from-purple-600 to-pink-600'} bg-clip-text text-transparent`}
            >
              {stats.requestCount}
            </motion.div>
            <p className={`text-sm font-bold relative z-10 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {t('profile.orders') || 'Bestellungen'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.03, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            className={`relative rounded-2xl p-6 text-center border-2 transition-all overflow-hidden group ${isDark
              ? 'bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border-blue-500/30 hover:border-blue-400/60 hover:shadow-xl hover:shadow-blue-600/30'
              : 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-300/40'
              }`}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="relative z-10"
            >
              <ShoppingBag className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </motion.div>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
              className={`text-4xl font-black mb-1 relative z-10 ${isDark ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : 'bg-gradient-to-r from-blue-600 to-cyan-600'} bg-clip-text text-transparent`}
            >
              {stats.cartCount}
            </motion.div>
            <p className={`text-sm font-bold relative z-10 ${isDark ? 'text-zinc-300' : 'text-zinc-600'}`}>
              {t('profile.inCart') || 'Im Warenkorb'}
            </p>
          </motion.div>
        </motion.div>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isAdminItem = Boolean(item.adminOnly);
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
                  className={`block glass backdrop-blur-xl border-2 rounded-2xl p-6 transition-all group relative overflow-hidden ${isAdminItem
                    ? 'border-red-500/40 hover:border-red-400/80 hover:shadow-2xl hover:shadow-red-500/40'
                    : 'border-zinc-800/50 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30'
                    }`}
                >
                  <motion.div
                    className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity ${isAdminItem
                      ? 'bg-gradient-to-br from-red-500/15 via-orange-500/10 to-amber-500/15'
                      : 'bg-gradient-to-br from-purple-500/8 to-pink-500/8'
                      }`}
                    animate={isAdminItem ? {
                      background: [
                        'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.15), transparent 50%)',
                        'radial-gradient(circle at 100% 100%, rgba(251, 146, 60, 0.15), transparent 50%)',
                        'radial-gradient(circle at 0% 0%, rgba(239, 68, 68, 0.15), transparent 50%)',
                      ]
                    } : {}}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
                        transition={{ duration: 0.6, type: 'spring' }}
                        className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all relative overflow-hidden`}
                      >
                        {isAdminItem && (
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                          />
                        )}
                        <Icon className="w-8 h-8 text-white relative z-10" />
                      </motion.div>

                      {item.badge ? (
                        <motion.span
                          animate={isAdminItem ? {
                            scale: [1, 1.1, 1],
                            boxShadow: [
                              '0 0 0px rgba(239, 68, 68, 0)',
                              '0 0 15px rgba(239, 68, 68, 0.5)',
                              '0 0 0px rgba(239, 68, 68, 0)',
                            ]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg ${isAdminItem
                            ? isDark
                              ? 'bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 border border-red-500/50'
                              : 'bg-gradient-to-r from-red-100 to-orange-100 text-red-700 border border-red-300'
                            : `bg-gradient-to-r ${item.color} text-white`
                            }`}
                        >
                          {item.badge}
                        </motion.span>
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

                    <h3 className="font-black text-xl mb-2 text-white group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-zinc-300 leading-relaxed font-medium group-hover:text-zinc-200 transition-colors duration-300">
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
            {t('auth.logout')}
          </span>
        </motion.button>

        {/* Info Cards - Premium Redesign */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-12 grid md:grid-cols-3 gap-4"
        >
          <motion.div
            whileHover={{ y: -8, scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            className="relative glass backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/30 transition-all group overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="relative z-10"
            >
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4 group-hover:text-purple-300 transition-colors" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold relative z-10 group-hover:text-purple-300 transition-colors">
              {t('profile.fastSupport') || 'Schneller Support'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.05, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            className="relative glass backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-green-500/60 hover:shadow-2xl hover:shadow-green-500/30 transition-all group overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="relative z-10"
            >
              <Shield className="w-12 h-12 text-green-400 mx-auto mb-4 group-hover:text-green-300 transition-colors" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold relative z-10 group-hover:text-green-300 transition-colors">
              {t('profile.secure') || 'Sicher & Geschützt'}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.98 }}
            className="relative glass backdrop-blur-xl border-2 border-zinc-800/50 rounded-2xl p-6 text-center hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/30 transition-all group overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="relative z-10"
            >
              <Star className="w-12 h-12 text-yellow-400 mx-auto mb-4 group-hover:text-yellow-300 transition-colors" fill="currentColor" />
            </motion.div>
            <p className="text-sm text-zinc-300 font-bold relative z-10 group-hover:text-yellow-300 transition-colors">
              {t('profile.premiumQuality') || 'Premium Qualität'}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}