import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HelpCircle, Mail, MessageCircle, Phone, Send, Sparkles, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function Help() {
  const [message, setMessage] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: '✨ Nachricht gesendet!',
      description: 'Wir melden uns schnellstmöglich bei dir'
    });
    
    setMessage('');
    setEmail('');
    setSending(false);
  };

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Telegram',
      value: '@NebulaSupportBot',
      description: 'Schnellste Antwortzeit',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Mail,
      title: 'E-Mail',
      value: 'support@nebulasupply.com',
      description: 'Für detaillierte Anfragen',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'WhatsApp',
      value: '+49 •••• ••••89',
      fullValue: '+49 123 456789',
      description: 'Täglich 10-20 Uhr',
      color: 'from-green-500 to-emerald-500',
      badge: 'VIP',
      locked: true
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
          <HelpCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Hilfe & Support
        </h1>
        <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Wir sind für dich da - 24/7 Support
        </p>
      </motion.div>

      {/* Contact Methods */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {contactMethods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/10 transition-all"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 text-white">{method.title}</h3>
              <div className="relative group/number mb-2">
                <p className="text-purple-400 font-mono text-sm">{method.value}</p>
                {method.locked && (
                  <div className="absolute inset-0 backdrop-blur-[2px] bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded flex items-center justify-center opacity-0 group-hover/number:opacity-100 transition-opacity">
                    <Link 
                      to={createPageUrl('VIP')}
                      className="text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent"
                    >
                      VIP freischalten
                    </Link>
                  </div>
                )}
              </div>
              <p className="text-zinc-300 text-sm mb-3">{method.description}</p>
              
              {method.badge && (
                <Link 
                  to={createPageUrl('VIP')} 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg hover:border-yellow-500/50 transition-colors group"
                >
                  <span className="text-xs font-black bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                    VIP
                  </span>
                  <span className="text-xs font-bold text-pink-500 group-hover:text-pink-400 transition-colors">
                    Mehr erfahren
                  </span>
                  <ArrowRight className="w-3 h-3 text-pink-500 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-8"
      >
        <h2 className="text-2xl font-black mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Schreib uns direkt
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-zinc-200 mb-2">Deine E-Mail</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.com"
              required
              className="h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors text-white placeholder:text-zinc-500"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-zinc-200 mb-2">Deine Nachricht</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Wie können wir dir helfen?"
              required
              rows={6}
              className="bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors text-white placeholder:text-zinc-500"
            />
          </div>

          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="neon-button w-full h-14 text-lg font-bold bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Wird gesendet...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Send className="w-5 h-5" />
                Nachricht senden
              </div>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-6 bg-purple-500/10 border border-purple-500/30 rounded-xl"
      >
        <h3 className="font-bold text-purple-400 mb-3">💡 Schnelle Hilfe:</h3>
        <ul className="space-y-2 text-sm text-zinc-300">
          <li>• <strong>Bestellstatus:</strong> Schau in deinen Anfragen nach</li>
          <li>• <strong>Zahlungsprobleme:</strong> Kontaktiere uns per Telegram</li>
          <li>• <strong>Produktfragen:</strong> Nutze die FAQ oder schreib uns</li>
          <li>• <strong>Support:</strong> Wir antworten innerhalb von 24h</li>
        </ul>
      </motion.div>

      {/* VIP Premium Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-16"
      >
        <div className="relative overflow-hidden glass backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 md:p-12 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-yellow-500/5">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-30">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/50"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent animate-gradient">
                VIP Premium Support
              </h2>
              <p className="text-zinc-300 text-lg font-medium mb-2">
                Upgrade dein Support-Erlebnis auf das nächste Level
              </p>
              <p className="text-zinc-400 text-sm">
                Exklusiver WhatsApp-Zugang • Sofort-Antworten • Premium-Service
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                {
                  icon: '⚡',
                  title: 'Blitzschnell',
                  desc: 'Antwort in Minuten'
                },
                {
                  icon: '💎',
                  title: 'WhatsApp',
                  desc: 'Direkter Kontakt'
                },
                {
                  icon: '🎯',
                  title: 'Priorität',
                  desc: 'VIP-Bearbeitung'
                },
                {
                  icon: '🎁',
                  title: 'Exklusiv',
                  desc: 'Sonder-Deals'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-zinc-900/60 border border-yellow-500/20 rounded-xl p-5 text-center hover:border-yellow-500/50 transition-all"
                >
                  <div className="text-4xl mb-3">{benefit.icon}</div>
                  <h4 className="font-black text-yellow-400 mb-1">{benefit.title}</h4>
                  <p className="text-xs text-zinc-400">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-zinc-900/40 border border-yellow-500/20 rounded-xl"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-1">
                  5 Min
                </div>
                <p className="text-xs text-zinc-400 font-semibold">Ø Antwortzeit</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-zinc-900/40 border border-yellow-500/20 rounded-xl"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-1">
                  24/7
                </div>
                <p className="text-xs text-zinc-400 font-semibold">Verfügbar</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-zinc-900/40 border border-yellow-500/20 rounded-xl"
              >
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent mb-1">
                  100%
                </div>
                <p className="text-xs text-zinc-400 font-semibold">Zufriedenheit</p>
              </motion.div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link to={createPageUrl('VIP')}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 rounded-2xl font-black text-lg text-zinc-900 shadow-2xl shadow-yellow-500/50 hover:shadow-yellow-500/70 transition-all group"
                >
                  <Crown className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                  <span>Jetzt VIP werden</span>
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
              </Link>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-4 text-sm text-zinc-400"
              >
                Lade Freunde ein oder erfülle die Anforderungen • <Link to={createPageUrl('VIP')} className="text-yellow-400 hover:text-yellow-300 underline font-bold">Mehr erfahren</Link>
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* FAQ Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-12 grid sm:grid-cols-2 gap-4"
      >
        <Link to={createPageUrl('FAQ')}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass backdrop-blur-xl border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-xl mb-2 text-white">FAQ</h3>
            <p className="text-zinc-400 text-sm">Antworten auf häufige Fragen</p>
          </motion.div>
        </Link>

        <Link to={createPageUrl('Requests')}>
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass backdrop-blur-xl border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="font-black text-xl mb-2 text-white">Meine Anfragen</h3>
            <p className="text-zinc-400 text-sm">Verfolge deine Bestellungen</p>
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}