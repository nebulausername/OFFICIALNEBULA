import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Star, Users, ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Gift, Zap, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function VIP() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    normalInvites: 0,
    premiumInvites: 0,
    isVIP: false
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // TODO: Load actual invite stats from your database
      // For now using placeholder data
      setStats({
        normalInvites: 0,
        premiumInvites: 0,
        isVIP: false
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const vipBenefits = [
    {
      icon: Crown,
      title: 'Exklusiver WhatsApp Zugang',
      description: 'Direkter WhatsApp Support - schnellste Bearbeitung',
      color: 'from-yellow-500 to-amber-600'
    },
    {
      icon: Zap,
      title: 'Priority Support',
      description: 'Bevorzugte Bearbeitung deiner Anfragen',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Gift,
      title: 'Exklusive Deals',
      description: 'Zugang zu VIP-only Produkten und Sonderangeboten',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Star,
      title: 'Early Access',
      description: 'Erste Infos zu neuen Drops und Releases',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const vipRequirements = [
    {
      title: '10 Erfolgreiche Einladungen',
      description: 'Lade 10 Personen ein, die mit unserem Bot interagieren',
      current: stats.normalInvites,
      target: 10,
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: '5 Premium Einladungen',
      description: 'Lade 5 Personen ein, die eine Bestellung aufgeben',
      current: stats.premiumInvites,
      target: 5,
      icon: ShoppingBag,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const normalProgress = (stats.normalInvites / 10) * 100;
  const premiumProgress = (stats.premiumInvites / 5) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 blur-3xl -z-10" />
        
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-yellow-500/50"
        >
          <Crown className="w-12 h-12 text-white" />
        </motion.div>
        
        <h1 className="text-6xl font-black mb-4">
          <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent animate-gradient">
            VIP Programm
          </span>
        </h1>
        <p className="text-zinc-400 text-xl flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          Werde Teil der Elite - Genieße exklusive Vorteile
        </p>

        {stats.isVIP && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full font-bold shadow-2xl shadow-yellow-500/50"
          >
            <Crown className="w-5 h-5" />
            Du bist VIP Member!
          </motion.div>
        )}
      </motion.div>

      {/* VIP Benefits */}
      <div className="mb-16">
        <h2 className="text-3xl font-black mb-8 text-center">
          <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
            VIP Vorteile
          </span>
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {vipBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-yellow-500/50 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all group"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-2">{benefit.title}</h3>
                <p className="text-zinc-400">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Requirements */}
      {!stats.isVIP && (
        <div>
          <h2 className="text-3xl font-black mb-8 text-center">
            <span className="bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
              So wirst du VIP
            </span>
          </h2>
          
          <div className="glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 mb-8">
            <p className="text-center text-zinc-400 mb-8 text-lg">
              Erfülle <strong className="text-yellow-500">eine</strong> der folgenden Bedingungen:
            </p>

            <div className="space-y-8">
              {vipRequirements.map((req, index) => {
                const Icon = req.icon;
                const progress = (req.current / req.target) * 100;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${req.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-lg">{req.title}</h3>
                          <span className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                            {req.current}/{req.target}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm mb-4">{req.description}</p>
                        
                        <div className="relative">
                          <Progress 
                            value={progress} 
                            className="h-3 bg-zinc-800"
                          />
                          <div 
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        
                        {progress >= 100 && (
                          <div className="flex items-center gap-2 mt-3 text-green-400">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Geschafft!</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-300 text-center">
                <strong>Alternativ:</strong> Lade mindestens 2 Personen ein, um dich für VIP zu qualifizieren
              </p>
            </div>
          </div>

          {/* Invite System */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="glass backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-8 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent">
                  Dein Einladungslink
                </h3>
                <p className="text-zinc-400">Teile diesen Link und sammle VIP-Punkte</p>
              </div>

              <div className="flex gap-3 mb-6">
                <div className="flex-1 px-4 py-3 bg-zinc-900/50 border border-zinc-700 rounded-xl font-mono text-sm truncate">
                  {user ? `https://nebulasupply.com/invite/${user.id}` : 'Lädt...'}
                </div>
                <Button
                  onClick={() => {
                    if (user) {
                      navigator.clipboard.writeText(`https://nebulasupply.com/invite/${user.id}`);
                      // Show toast notification
                    }
                  }}
                  className="px-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:scale-105 transition-transform"
                >
                  Kopieren
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user) {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Schau dir Nebula Supply an! 🌟 https://nebulasupply.com/invite/${user.id}`)}`, '_blank');
                    }
                  }}
                  className="p-4 glass border border-zinc-800 rounded-xl hover:border-green-500/50 transition-colors group"
                >
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold">WhatsApp</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user) {
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://nebulasupply.com/invite/${user.id}`)}&text=${encodeURIComponent('Schau dir Nebula Supply an! 🌟')}`, '_blank');
                    }
                  }}
                  className="p-4 glass border border-zinc-800 rounded-xl hover:border-blue-500/50 transition-colors group"
                >
                  <Send className="w-8 h-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold">Telegram</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user && navigator.share) {
                      navigator.share({
                        title: 'Nebula Supply',
                        text: 'Schau dir Nebula Supply an! 🌟',
                        url: `https://nebulasupply.com/invite/${user.id}`
                      });
                    }
                  }}
                  className="p-4 glass border border-zinc-800 rounded-xl hover:border-purple-500/50 transition-colors group"
                >
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-semibold">Mehr</p>
                </motion.button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="p-6 glass border border-zinc-800 rounded-xl">
                <div className="text-3xl font-black text-purple-400 mb-2">{stats.normalInvites}</div>
                <p className="text-sm text-zinc-400">Einladungen</p>
              </div>
              <div className="p-6 glass border border-zinc-800 rounded-xl">
                <div className="text-3xl font-black text-green-400 mb-2">{stats.premiumInvites}</div>
                <p className="text-sm text-zinc-400">Premium Einladungen</p>
              </div>
              <div className="p-6 glass border border-zinc-800 rounded-xl">
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent mb-2">
                  {stats.normalInvites >= 10 || stats.premiumInvites >= 5 || stats.normalInvites >= 2 ? '100%' : '0%'}
                </div>
                <p className="text-sm text-zinc-400">VIP Fortschritt</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-20 pt-12 border-t border-zinc-800"
      >
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-lg">Nebula Supply</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Premium Lifestyle & Fashion - Exklusiv für dich
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-zinc-300">Shop</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="/Products" className="hover:text-purple-400 transition-colors">Alle Produkte</a></li>
              <li><a href="/Products?new=true" className="hover:text-purple-400 transition-colors">Neu eingetroffen</a></li>
              <li><a href="/Products?sale=true" className="hover:text-purple-400 transition-colors">Sale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-zinc-300">Support</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="/Help" className="hover:text-purple-400 transition-colors">Hilfe & Support</a></li>
              <li><a href="/FAQ" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><a href="/Requests" className="hover:text-purple-400 transition-colors">Meine Anfragen</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-zinc-300">VIP</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="/VIP" className="hover:text-yellow-400 transition-colors">VIP Programm</a></li>
              <li><a href="/VIP#benefits" className="hover:text-yellow-400 transition-colors">Vorteile</a></li>
              <li><a href="/VIP#invite" className="hover:text-yellow-400 transition-colors">Freunde einladen</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-zinc-800">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Star className="w-4 h-4 text-purple-400" fill="currentColor" />
            <span className="text-sm text-zinc-500">© 2024 Nebula Supply. Premium Quality.</span>
          </div>
          <div className="flex gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Impressum</a>
            <a href="#" className="hover:text-white transition-colors">Datenschutz</a>
            <a href="#" className="hover:text-white transition-colors">AGB</a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}