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
      link: createPageUrl('ProfileSettings'),
      stat: null
    },
    {
      title: 'Meine Bestellungen',
      description: 'Bestellungen & Status verfolgen',
      icon: Package,
      link: createPageUrl('Requests'),
      stat: stats.requestCount
    },
    {
      title: 'Support Tickets',
      description: 'Deine Anfragen & Chat',
      icon: MessageCircle,
      link: createPageUrl('Support'),
      stat: stats.openTicketCount,
      badge: stats.openTicketCount > 0 ? `${stats.openTicketCount} offen` : null
    },
    {
      title: 'Merkliste',
      description: 'Deine Favoriten',
      icon: Heart,
      link: createPageUrl('Wishlist'),
      stat: wishlistCount
    },
    {
      title: 'VIP Programm',
      description: 'Exklusive Vorteile freischalten',
      icon: Crown,
      link: createPageUrl('VIP'),
      badge: 'Premium'
    },
    {
      title: 'FAQ',
      description: 'Häufig gestellte Fragen',
      icon: MessageCircle,
      link: createPageUrl('FAQ'),
      stat: null
    },
    {
      title: 'Hilfe & Support',
      description: 'Wir helfen dir weiter',
      icon: HelpCircle,
      link: createPageUrl('Help'),
      stat: null
    }
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      title: 'Admin Dashboard',
      description: 'Verwaltung & Einstellungen',
      icon: Settings,
      link: createPageUrl('Admin'),
      badge: 'Admin'
    });
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center relative"
        >
          <div 
            className="absolute inset-0 rounded-full blur-3xl -z-10"
            style={{ background: 'radial-gradient(circle, rgba(var(--gold-rgb), 0.15), transparent 70%)' }}
          />
          
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-8 inline-block rounded-3xl"
            style={{ 
              background: 'var(--surface2)',
              border: '1px solid rgba(var(--gold-rgb), 0.4)'
            }}
          >
            <div className="relative w-full h-full flex items-center justify-center rounded-3xl">
              <User className="w-12 h-12 md:w-16 md:h-16" style={{ color: 'var(--gold)' }} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.25, 1], rotate: [0, 360, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))' }}
            >
              <Star className="w-4 h-4 md:w-5 md:h-5 text-black" fill="black" />
            </motion.div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-3"
            style={{ color: '#FFFFFF' }}
          >
            {user?.full_name || 'Mein Profil'}
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-base md:text-lg flex items-center justify-center gap-2 flex-wrap font-semibold"
            style={{ color: 'var(--muted)' }}
          >
            <Sparkles className="w-5 h-5" style={{ color: 'var(--gold)' }} />
            {user?.email}
          </motion.div>

          {user?.role === 'admin' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
              style={{
                background: 'rgba(var(--gold-rgb), 0.15)',
                border: '1px solid rgba(var(--gold-rgb), 0.4)',
                color: 'var(--gold)'
              }}
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
            className="luxury-card p-6 text-center"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Package className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
            </motion.div>
            <div 
              className="text-4xl font-black mb-1"
              style={{ color: 'var(--gold2)' }}
            >
              {stats.requestCount}
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Bestellungen</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            className="luxury-card p-6 text-center"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <ShoppingBag className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
            </motion.div>
            <div 
              className="text-4xl font-black mb-1"
              style={{ color: 'var(--gold2)' }}
            >
              {stats.cartCount}
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Im Warenkorb</p>
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
                  className="block luxury-card p-6 transition-all group relative overflow-hidden"
                  style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
                >
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgba(var(--gold-rgb), 0.08), transparent)' }}
                  />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <motion.div 
                        whileHover={{ rotate: 360, scale: 1.15 }}
                        transition={{ duration: 0.6 }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl"
                        style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold2))' }}
                      >
                        <Icon className="w-8 h-8 text-black" />
                      </motion.div>
                      
                      {item.badge ? (
                        <motion.div 
                          whileHover={{ scale: 1.1 }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg"
                          style={{ 
                            background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                            color: '#000'
                          }}
                        >
                          {item.badge}
                        </motion.div>
                      ) : item.stat !== null && item.stat > 0 ? (
                        <motion.div 
                          whileHover={{ scale: 1.15 }}
                          className="px-3.5 py-1.5 rounded-full text-xs font-black shadow-lg"
                          style={{
                            background: 'rgba(var(--gold-rgb), 0.2)',
                            border: '1px solid rgba(var(--gold-rgb), 0.4)',
                            color: 'var(--gold)'
                          }}
                        >
                          {item.stat}
                        </motion.div>
                      ) : (
                        <ArrowRight 
                          className="w-6 h-6 group-hover:translate-x-2 transition-all"
                          style={{ color: 'var(--muted)' }}
                        />
                      )}
                    </div>
                    
                    <h3 
                      className="font-black text-xl mb-2 group-hover:text-gold transition-all"
                      style={{ color: '#FFFFFF' }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed font-medium" style={{ color: 'var(--muted)' }}>
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
          className="w-full luxury-card p-5 transition-all group flex items-center justify-center gap-3"
          style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
        >
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <LogOut className="w-6 h-6 group-hover:text-red-400 transition-colors" style={{ color: 'var(--muted)' }} />
          </motion.div>
          <span className="font-black text-lg group-hover:text-red-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>
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
            className="luxury-card p-6 text-center group"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Zap className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
            </motion.div>
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Schneller Support</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="luxury-card p-6 text-center group"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
            </motion.div>
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>100% Sicher</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ y: -5, scale: 1.03 }}
            className="luxury-card p-6 text-center group"
            style={{ border: '1px solid rgba(var(--gold-rgb), 0.3)' }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.5 }}
            >
              <Star className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--gold)' }} fill="currentColor" />
            </motion.div>
            <p className="text-sm font-bold" style={{ color: 'var(--muted)' }}>Premium Qualität</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}