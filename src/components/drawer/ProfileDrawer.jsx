import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { api } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronLeft, User, Package, Heart, 
  MessageCircle, Bell, Shield, LogOut, Crown, Settings, ChevronRight 
} from 'lucide-react';

export default function ProfileDrawer({ isOpen, onClose, onBack, user }) {
  const handleLogout = () => {
    api.auth.logout();
  };

  const profileItems = [
    { icon: Settings, label: 'Mein Konto', to: 'ProfileSettings', gradient: 'from-blue-500 to-cyan-500' },
    { icon: Package, label: 'Bestellungen', to: 'Requests', gradient: 'from-purple-500 to-pink-500' },
    { icon: Heart, label: 'Merkliste', to: 'Wishlist', gradient: 'from-pink-500 to-rose-500' },
    { icon: MessageCircle, label: 'Support / Tickets', to: 'Support', gradient: 'from-orange-500 to-red-500' },
    { icon: Bell, label: 'Benachrichtigungen', to: 'ProfileSettings', gradient: 'from-green-500 to-emerald-500' },
    { icon: Shield, label: 'Datenschutz', to: 'ProfileSettings', gradient: 'from-indigo-500 to-purple-500' }
  ];

  if (user?.role === 'admin') {
    profileItems.splice(1, 0, {
      icon: Crown,
      label: 'Admin Dashboard',
      to: 'Admin',
      gradient: 'from-red-500 to-orange-500',
      admin: true
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[70]"
          />

          {/* Nested Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 380 }}
            className="fixed top-0 right-0 bottom-0 w-[92%] max-w-lg z-[70] overflow-hidden shadow-2xl flex flex-col"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 15, 20, 0.98), rgba(8, 8, 12, 0.98))',
              backdropFilter: 'blur(50px)',
              borderLeft: '2px solid rgba(168, 85, 247, 0.3)'
            }}
          >
            {/* Header */}
            <div className="relative p-5 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <motion.button
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onBack}
                  className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-black"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Menü</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-all"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>
              </div>

              <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-5">
                Profil
              </h2>

              {/* User Info Card */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/15 to-pink-500/15 border-2 border-purple-500/25"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-white text-lg truncate">{user.full_name}</div>
                      <div className="text-xs text-zinc-400 font-semibold truncate">{user.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {user.is_vip && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg">
                        <Crown className="w-3.5 h-3.5 text-zinc-900" />
                        <span className="text-xs font-black text-zinc-900">VIP</span>
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
                        <Crown className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-black text-white">ADMIN</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <nav className="p-4 space-y-2">
                {profileItems.map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link to={createPageUrl(item.to)} onClick={onClose}>
                      <motion.div
                        whileHover={{ x: 6, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center justify-between p-4 rounded-xl glass-panel-hover min-h-[68px] relative overflow-hidden ${
                          item.admin ? 'border-2 border-red-500/30' : ''
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 hover:opacity-10 transition-opacity`} />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg`}>
                            <item.icon className="w-5 h-5 text-white" />
                          </div>
                          <span className="font-black text-white text-base">{item.label}</span>
                        </div>

                        <ChevronRight className="w-5 h-5 text-zinc-500 relative z-10" />
                      </motion.div>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="p-4 mt-4 border-t border-white/10">
                <motion.button
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full p-4 min-h-[64px] bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border-2 border-red-500/30 rounded-2xl font-black text-red-400 text-base transition-all shadow-lg flex items-center justify-center gap-3"
                >
                  <LogOut className="w-5 h-5" />
                  Abmelden
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}