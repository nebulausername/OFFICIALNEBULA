import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Star, Users, ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Gift, Zap, MessageCircle, Send, CreditCard, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import VipPlanModal from '../components/vip/VipPlanModal';
import { useToast } from '@/components/ui/use-toast';

export default function VIP() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    normalInvites: 0,
    premiumInvites: 0,
    isVIP: false
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const vipPlans = [
    {
      type: 'lifetime',
      name: 'Lifetime VIP',
      price: 50,
      period: 'einmalig',
      features: [
        'Lebenslanger VIP-Status',
        'Alle Premium-Features',
        'Exklusiver WhatsApp Support',
        'Priority Bearbeitung'
      ]
    },
    {
      type: 'weekly',
      name: 'Wöchentliches VIP',
      price: 5,
      period: '/Woche',
      features: [
        'Flexibel kündbar',
        'Alle Premium-Features',
        'WhatsApp Support',
        'Priority Zugang'
      ]
    },
    {
      type: 'monthly',
      name: 'Monatliches VIP',
      price: 20,
      period: '/Monat',
      features: [
        'Bester Preis',
        'Alle Premium-Features',
        'WhatsApp Support',
        'Exklusive Deals'
      ]
    }
  ];

  const handlePlanClick = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan || !user) return;

    try {
      // Create a special VIP cart item
      await base44.entities.StarCartItem.create({
        user_id: user.id,
        product_id: 'vip-plan', // Special identifier
        quantity: 1,
        selected_options: {
          plan_type: selectedPlan.type,
          plan_name: selectedPlan.name,
          price: selectedPlan.price,
          period: selectedPlan.period
        }
      });

      toast({
        title: '✨ VIP Plan hinzugefügt!',
        description: `${selectedPlan.name} wurde zu deinem Warenkorb hinzugefügt.`,
      });

      setIsModalOpen(false);
      
      // Navigate to cart after a short delay
      setTimeout(() => {
        navigate(createPageUrl('Cart'));
      }, 1000);
    } catch (error) {
      console.error('Error adding VIP plan:', error);
      toast({
        title: 'Fehler',
        description: 'VIP Plan konnte nicht hinzugefügt werden.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 md:mb-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-amber-500/20 to-yellow-500/20 blur-3xl -z-10" />
        
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-3xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-yellow-500/50"
        >
          <Crown className="w-10 h-10 md:w-14 md:h-14 text-white" />
        </motion.div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 px-4">
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent animate-gradient">
            VIP Programm
          </span>
        </h1>
        <p className="text-zinc-300 text-base sm:text-lg md:text-xl flex flex-wrap items-center justify-center gap-2 px-4">
          <Sparkles className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <span>Werde Teil der Elite - Genieße exklusive Vorteile</span>
        </p>

        {stats.isVIP && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full font-bold shadow-2xl shadow-yellow-500/50 text-sm md:text-base"
          >
            <Crown className="w-5 h-5" />
            Du bist VIP Member!
          </motion.div>
        )}
      </motion.div>

      {/* VIP Benefits */}
      <div className="mb-12 md:mb-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-8 md:mb-12 text-center px-4">
          <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
            VIP Vorteile
          </span>
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {vipBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 md:p-8 hover:border-yellow-500/60 hover:shadow-2xl hover:shadow-yellow-500/20 transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${benefit.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                  <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                </div>
                <h3 className="font-black text-lg md:text-xl mb-3 text-zinc-100 relative z-10">{benefit.title}</h3>
                <p className="text-zinc-400 text-sm md:text-base leading-relaxed relative z-10">{benefit.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Direct VIP Purchase Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 md:mt-16"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              Oder direkt VIP werden
            </h3>
            <p className="text-zinc-400 text-sm md:text-base">Wähle dein bevorzugtes Zahlungsmodell</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Lifetime */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative glass backdrop-blur-xl border-2 border-purple-500/50 rounded-2xl p-6 md:p-8 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/30 transition-all group overflow-hidden"
            >
              <div className="absolute top-4 right-4 px-3 py-1 bg-purple-500/20 border border-purple-400/50 rounded-full">
                <span className="text-xs font-black text-purple-300">BELIEBT</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-white" />
                </div>

                <h4 className="text-xl md:text-2xl font-black text-white mb-2">Lifetime</h4>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">50€</span>
                  <span className="text-zinc-500 text-sm ml-2">einmalig</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Zahle einmal und bleibe für immer VIP</p>

                <Button 
                  onClick={() => handlePlanClick(vipPlans[0])}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 font-bold"
                >
                  Jetzt anfragen
                </Button>
              </div>
            </motion.div>

            {/* Weekly */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 md:p-8 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8 text-white" />
                </div>

                <h4 className="text-xl md:text-2xl font-black text-white mb-2">Wöchentlich</h4>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">5€</span>
                  <span className="text-zinc-500 text-sm ml-2">/Woche</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Flexibel und jederzeit kündbar</p>

                <Button 
                  onClick={() => handlePlanClick(vipPlans[1])}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 font-bold"
                >
                  Jetzt anfragen
                </Button>
              </div>
            </motion.div>

            {/* Monthly */}
            <motion.div
              whileHover={{ y: -8, scale: 1.02 }}
              className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 md:p-8 hover:border-amber-500/50 hover:shadow-2xl hover:shadow-amber-500/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>

                <h4 className="text-xl md:text-2xl font-black text-white mb-2">Monatlich</h4>
                <div className="mb-4">
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-amber-300 to-yellow-300 bg-clip-text text-transparent">20€</span>
                  <span className="text-zinc-500 text-sm ml-2">/Monat</span>
                </div>
                <p className="text-zinc-400 text-sm mb-6">Günstigster Abo-Preis</p>

                <Button 
                  onClick={() => handlePlanClick(vipPlans[2])}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 font-bold"
                >
                  Jetzt anfragen
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Requirements */}
      {!stats.isVIP && (
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-8 md:mb-12 text-center px-4">
            <span className="bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
              So wirst du VIP
            </span>
          </h2>
          
          <div className="glass backdrop-blur-xl border-2 border-zinc-700 rounded-2xl p-6 md:p-10 mb-8">
            <p className="text-center text-zinc-300 mb-8 md:mb-10 text-base md:text-lg font-medium">
              Erfülle <strong className="text-yellow-400">eine</strong> der folgenden Bedingungen:
            </p>

            <div className="space-y-6 md:space-y-8">
              {vipRequirements.map((req, index) => {
                const Icon = req.icon;
                const progress = (req.current / req.target) * 100;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative glass backdrop-blur border border-zinc-800 rounded-xl p-5 md:p-6 hover:border-yellow-500/30 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${req.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                      </div>
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                          <h3 className="font-black text-base md:text-lg text-zinc-100">{req.title}</h3>
                          <span className="text-2xl md:text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                            {req.current}/{req.target}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm md:text-base mb-4 leading-relaxed">{req.description}</p>
                        
                        <div className="relative">
                          <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 relative overflow-hidden"
                            >
                              <motion.div
                                animate={{ x: ['0%', '100%'] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                              />
                            </motion.div>
                          </div>
                        </div>
                        
                        {progress >= 100 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center gap-2 mt-3 text-green-400"
                          >
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold">Geschafft!</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 md:mt-8 p-4 md:p-5 bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl">
              <p className="text-sm md:text-base text-yellow-200 text-center font-semibold">
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
            <div className="glass backdrop-blur-xl border-2 border-yellow-500/30 rounded-2xl p-6 md:p-10 bg-gradient-to-br from-yellow-500/5 to-amber-500/5 shadow-2xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent">
                  Dein Einladungslink
                </h3>
                <p className="text-zinc-300 text-sm md:text-base font-medium">Teile diesen Link und sammle VIP-Punkte</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="flex-1 px-4 py-3 bg-zinc-900/70 border-2 border-zinc-700 rounded-xl font-mono text-xs md:text-sm truncate text-zinc-200">
                  {user ? `https://nebulasupply.com/invite/${user.id}` : 'Lädt...'}
                </div>
                <Button
                  onClick={() => {
                    if (user) {
                      navigator.clipboard.writeText(`https://nebulasupply.com/invite/${user.id}`);
                    }
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 hover:scale-105 transition-transform font-bold shadow-lg whitespace-nowrap"
                >
                  Kopieren
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user) {
                      window.open(`https://wa.me/?text=${encodeURIComponent(`Schau dir Nebula Supply an! 🌟 https://nebulasupply.com/invite/${user.id}`)}`, '_blank');
                    }
                  }}
                  className="p-4 md:p-5 glass border-2 border-zinc-800 rounded-xl hover:border-green-500/50 transition-all group"
                >
                  <MessageCircle className="w-8 h-8 md:w-9 md:h-9 mx-auto mb-2 text-green-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-bold text-zinc-200">WhatsApp</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (user) {
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://nebulasupply.com/invite/${user.id}`)}&text=${encodeURIComponent('Schau dir Nebula Supply an! 🌟')}`, '_blank');
                    }
                  }}
                  className="p-4 md:p-5 glass border-2 border-zinc-800 rounded-xl hover:border-blue-500/50 transition-all group"
                >
                  <Send className="w-8 h-8 md:w-9 md:h-9 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-bold text-zinc-200">Telegram</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    if (!user) return;
                    
                    const shareData = {
                      title: 'Nebula Supply',
                      text: 'Schau dir Nebula Supply an! 🌟',
                      url: `https://nebulasupply.com/invite/${user.id}`
                    };

                    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        if (err.name !== 'AbortError') {
                          navigator.clipboard.writeText(`https://nebulasupply.com/invite/${user.id}`);
                        }
                      }
                    } else {
                      navigator.clipboard.writeText(`https://nebulasupply.com/invite/${user.id}`);
                    }
                  }}
                  className="p-4 md:p-5 glass border-2 border-zinc-800 rounded-xl hover:border-purple-500/50 transition-all group"
                >
                  <Sparkles className="w-8 h-8 md:w-9 md:h-9 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <p className="text-xs md:text-sm font-bold text-zinc-200">Mehr</p>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-5 md:p-6 glass border-2 border-zinc-800 rounded-xl hover:border-purple-500/30 transition-all"
              >
                <div className="text-3xl md:text-4xl font-black text-purple-400 mb-2">{stats.normalInvites}</div>
                <p className="text-xs md:text-sm text-zinc-300 font-semibold">Einladungen</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-5 md:p-6 glass border-2 border-zinc-800 rounded-xl hover:border-green-500/30 transition-all"
              >
                <div className="text-3xl md:text-4xl font-black text-green-400 mb-2">{stats.premiumInvites}</div>
                <p className="text-xs md:text-sm text-zinc-300 font-semibold">Premium</p>
              </motion.div>
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-5 md:p-6 glass border-2 border-zinc-800 rounded-xl hover:border-yellow-500/30 transition-all"
              >
                <div className="text-3xl md:text-4xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent mb-2">
                  {stats.normalInvites >= 10 || stats.premiumInvites >= 5 || stats.normalInvites >= 2 ? '100%' : '0%'}
                </div>
                <p className="text-xs md:text-sm text-zinc-300 font-semibold">Fortschritt</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}


      <VipPlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        onConfirm={handleConfirmPlan}
      />
    </div>
  );
}