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
    </div>
  );
}