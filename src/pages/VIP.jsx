import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Crown, Star, Users, ShoppingBag, Sparkles, CheckCircle2, ArrowRight, Gift, Zap } from 'lucide-react';
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

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <Button className="h-16 px-12 text-lg font-bold bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 hover:scale-105 transition-transform shadow-2xl shadow-yellow-500/50">
              <Users className="w-6 h-6 mr-2" />
              Jetzt Freunde einladen
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
            <p className="text-zinc-500 text-sm mt-4">
              Teile deinen persönlichen Einladungslink und sammle VIP-Punkte
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}