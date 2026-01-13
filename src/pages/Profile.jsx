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
  Heart,
  ChevronRight
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
      color: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Meine Bestellungen',
      description: 'Bestellungen & Status verfolgen',
      icon: Package,
      link: createPageUrl('Requests'),
      stat: stats.requestCount,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Support Tickets',
      description: 'Deine Anfragen & Chat',
      icon: MessageCircle,
      link: createPageUrl('Support'),
      stat: stats.openTicketCount,
      badge: stats.openTicketCount > 0 ? `${stats.openTicketCount} offen` : null,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Merkliste',
      description: 'Deine Favoriten',
      icon: Heart,
      link: createPageUrl('Wishlist'),
      stat: wishlistCount,
      color: 'from-pink-500 to-rose-500'
    },
    {
      title: 'VIP Programm',
      description: 'Exklusive Vorteile freischalten',
      icon: Crown,
      link: createPageUrl('VIP'),
      badge: 'Premium',
      color: 'from-amber-500 to-yellow-500'
    },
    {
      title: 'Hilfe & FAQ',
      description: 'Häufige Fragen & Support',
      icon: HelpCircle,
      link: createPageUrl('Help'),
      color: 'from-slate-500 to-slate-600'
    }
  ];

  if (user?.role === 'admin') {
    menuItems.push({
      title: 'Admin Dashboard',
      description: 'Verwaltung & Einstellungen',
      icon: Settings,
      link: createPageUrl('Admin'),
      badge: 'Admin',
      color: 'from-red-500 to-orange-500'
    });
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Background with subtle gradient */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: 'linear-gradient(180deg, #0A0C10 0%, #12151C 50%, #0A0C10 100%)'
        }}
      />
      <div 
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(var(--gold-rgb), 0.08) 0%, transparent 60%)'
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative mb-8 p-6 md:p-8 rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(var(--gold-rgb), 0.12), rgba(var(--gold-rgb), 0.04))',
            border: '1px solid rgba(var(--gold-rgb), 0.25)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl" style={{ background: 'rgba(var(--gold-rgb), 0.15)' }} />
          
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <div 
                className="w-24 h-24 md:w-28 md:h-28 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--gold), var(--gold2))',
                  boxShadow: '0 8px 32px rgba(var(--gold-rgb), 0.4)'
                }}
              >
                <User className="w-12 h-12 md:w-14 md:h-14 text-black" />
              </div>
              {user?.role === 'admin' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(135deg, #8B5CF6, #A855F7)',
                    boxShadow: '0 4px 16px rgba(139, 92, 246, 0.5)'
                  }}
                >
                  <Shield className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </motion.div>
            
            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                {user?.full_name || 'Mein Profil'}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-base font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                <Sparkles className="w-4 h-4 text-gold" />
                {user?.email}
              </div>
              {user?.role === 'admin' && (
                <div 
                  className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-sm font-bold"
                  style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#A78BFA' }}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Administrator
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div 
            className="p-5 rounded-2xl text-center"
            style={{
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.25)'
            }}
          >
            <Package className="w-7 h-7 mx-auto mb-2" style={{ color: '#60A5FA' }} />
            <div className="text-3xl font-black text-white mb-1">{stats.requestCount}</div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Bestellungen</p>
          </div>

          <div 
            className="p-5 rounded-2xl text-center"
            style={{
              background: 'rgba(var(--gold-rgb), 0.1)',
              border: '1px solid rgba(var(--gold-rgb), 0.25)'
            }}
          >
            <ShoppingBag className="w-7 h-7 mx-auto mb-2 text-gold" />
            <div className="text-3xl font-black text-gold2 mb-1">{stats.cartCount}</div>
            <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Im Warenkorb</p>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-3 mb-8">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
              >
                <Link
                  to={item.link}
                  className="flex items-center gap-4 p-4 rounded-2xl transition-all group"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Icon */}
                  <div 
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${item.color} group-hover:scale-105 transition-transform`}
                    style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-white group-hover:text-gold transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Badge/Stat/Arrow */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {item.badge ? (
                      <span 
                        className="px-3 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          background: item.badge === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(var(--gold-rgb), 0.2)',
                          color: item.badge === 'Admin' ? '#F87171' : 'var(--gold)'
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : item.stat !== null && item.stat > 0 ? (
                      <span 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{ background: 'rgba(var(--gold-rgb), 0.2)', color: 'var(--gold)' }}
                      >
                        {item.stat}
                      </span>
                    ) : null}
                    <ChevronRight 
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                      style={{ color: 'rgba(255,255,255,0.4)' }}
                    />
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
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl transition-all group"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}
        >
          <LogOut className="w-5 h-5" style={{ color: '#F87171' }} />
          <span className="font-bold text-base" style={{ color: '#F87171' }}>
            Abmelden
          </span>
        </motion.button>

        {/* Bottom Info Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center justify-center gap-6 flex-wrap"
        >
          {[
            { icon: Zap, text: '24/7 Support' },
            { icon: Shield, text: '100% Sicher' },
            { icon: Star, text: 'Premium' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <item.icon className="w-4 h-4 text-gold" />
              <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.text}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}