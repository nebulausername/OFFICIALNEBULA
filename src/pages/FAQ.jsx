import React, { useState } from 'react';
import { MessageCircle, ChevronDown, Sparkles, Package, CreditCard, Truck, Shield, Crown, ArrowRight, Zap, Gift, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Bestellung',
      icon: Package,
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          q: 'Wie funktioniert die Bestellung?',
          a: 'Lege Produkte in den Warenkorb, fülle das Kontaktformular aus und sende deine Bestellung ab. Du erhältst umgehend eine Bestellbestätigung per Email und wir melden uns bei dir.'
        },
        {
          q: 'Wie lange dauert die Bearbeitung?',
          a: 'In der Regel melden wir uns innerhalb von 24 Stunden bei dir. Bei hohem Aufkommen kann es etwas länger dauern.'
        },
        {
          q: 'Kann ich meine Bestellung ändern?',
          a: 'Ja! Solange wir die Bestellung noch nicht bestätigt haben, kannst du jederzeit Änderungen vornehmen. Kontaktiere uns einfach.'
        }
      ]
    },
    {
      category: 'Zahlung',
      icon: CreditCard,
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          q: 'Welche Zahlungsmethoden akzeptiert ihr?',
          a: 'Wir akzeptieren PayPal, Banküberweisung und bei Absprache auch andere Zahlungsmethoden. Details besprechen wir individuell.'
        },
        {
          q: 'Wann muss ich bezahlen?',
          a: 'Die Zahlung erfolgt nach unserer Bestätigung und vor dem Versand. Wir senden dir alle Details per E-Mail oder Telegram.'
        },
        {
          q: 'Gibt es eine Anzahlung?',
          a: 'Bei höherwertigen Produkten können wir eine Anzahlung vereinbaren. Das klären wir individuell mit dir.'
        }
      ]
    },
    {
      category: 'Versand',
      icon: Truck,
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          q: 'Wie lange dauert der Versand?',
          a: 'Nach Zahlungseingang versenden wir in der Regel innerhalb von 2-5 Werktagen. Die Lieferzeit beträgt dann weitere 1-3 Tage.'
        },
        {
          q: 'Wohin liefert ihr?',
          a: 'Aktuell liefern wir nur innerhalb Deutschlands. Internationale Lieferungen sind in Planung.'
        },
        {
          q: 'Wie hoch sind die Versandkosten?',
          a: 'Die Versandkosten besprechen wir individuell und sind abhängig von Größe und Gewicht der Bestellung.'
        }
      ]
    },
    {
      category: 'Sicherheit & Qualität',
      icon: Shield,
      color: 'from-orange-500 to-red-500',
      questions: [
        {
          q: 'Sind alle Produkte authentisch?',
          a: 'Ja, wir garantieren 100% Authentizität. Alle Produkte werden vor dem Versand geprüft.'
        },
        {
          q: 'Was ist, wenn ein Produkt defekt ist?',
          a: 'Bei Defekten oder Beschädigungen bieten wir selbstverständlich Ersatz oder Rückerstattung an.'
        },
        {
          q: 'Gibt es eine Garantie?',
          a: 'Wir bieten Käuferschutz und besprechen individuell passende Garantielösungen mit dir.'
        }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 glow-effect">
          <MessageCircle className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Häufige Fragen
        </h1>
        <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          Alles, was du über Nebula Supply wissen musst
        </p>
      </motion.div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {faqs.map((category, categoryIndex) => {
          const Icon = category.icon;
          return (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="glass backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 bg-zinc-900/50 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                </div>
              </div>

              {/* Questions */}
              <div className="divide-y divide-zinc-800">
                {category.questions.map((faq, faqIndex) => {
                  const isOpen = openIndex === `${categoryIndex}-${faqIndex}`;
                  return (
                    <div key={faqIndex}>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : `${categoryIndex}-${faqIndex}`)}
                        className="w-full p-6 text-left hover:bg-zinc-900/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-semibold text-lg text-white">{faq.q}</span>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          </motion.div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 text-zinc-300 leading-relaxed">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* VIP Premium Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-16"
      >
        <div className="relative overflow-hidden glass backdrop-blur-xl border-2 border-yellow-500/30 rounded-3xl p-8 md:p-12 bg-gradient-to-br from-yellow-500/5 via-amber-500/5 to-yellow-500/5">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 opacity-30 overflow-hidden">
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360],
                x: [0, 50, 0],
                y: [0, 30, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-yellow-500/30 to-amber-500/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1.3, 1, 1.3],
                rotate: [360, 180, 0],
                x: [0, -50, 0],
                y: [0, -30, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-pink-500/30 to-purple-500/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -180, -360]
              }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl"
            />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/60 relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-transparent opacity-50 rounded-2xl" />
                <Crown className="w-12 h-12 text-white relative z-10" />
                
                {/* Floating sparkles */}
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-yellow-300" />
                </motion.div>
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-2 -left-2"
                >
                  <Star className="w-5 h-5 text-amber-300" />
                </motion.div>
              </motion.div>
              
              <motion.h2 
                className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-200 bg-clip-text text-transparent animate-gradient"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                VIP Premium Zugang
              </motion.h2>
              <p className="text-zinc-200 text-xl font-bold mb-3">
                Erlebe Nebula Supply auf einem neuen Level
              </p>
              <p className="text-zinc-400 text-base">
                Exklusiver WhatsApp-Support • Priority-Service • Spezial-Angebote • VIP-Benefits
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              {[
                {
                  icon: Zap,
                  title: 'Sofort-Support',
                  desc: 'Antworten in Minuten',
                  color: 'from-yellow-400 to-orange-500'
                },
                {
                  icon: Crown,
                  title: 'WhatsApp VIP',
                  desc: 'Direkter Draht',
                  color: 'from-amber-400 to-yellow-500'
                },
                {
                  icon: Gift,
                  title: 'Exklusive Deals',
                  desc: 'Nur für VIPs',
                  color: 'from-pink-500 to-rose-500'
                },
                {
                  icon: Star,
                  title: 'Priorität',
                  desc: 'First Class',
                  color: 'from-purple-500 to-pink-500'
                }
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, type: 'spring', bounce: 0.5 }}
                  whileHover={{ y: -8, scale: 1.05 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-zinc-900/70 border-2 border-yellow-500/30 group-hover:border-yellow-400/60 rounded-xl p-6 text-center transition-all">
                    <div className={`w-14 h-14 bg-gradient-to-br ${benefit.color} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h4 className="font-black text-lg text-yellow-400 mb-2">{benefit.title}</h4>
                    <p className="text-sm text-zinc-400 font-semibold">{benefit.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* VIP Features List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="mb-10 p-6 bg-zinc-900/40 border border-yellow-500/20 rounded-2xl"
            >
              <h3 className="font-black text-xl text-yellow-400 mb-5 text-center">Was du als VIP bekommst:</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'WhatsApp-Direktzugang für Support',
                  'Antworten innerhalb von 5 Minuten',
                  'Priorität bei Bestellabwicklung',
                  'Exklusive VIP-Rabatte & Deals',
                  'Early Access zu neuen Produkten',
                  'Persönlicher VIP-Ansprechpartner',
                  'Bevorzugte Versandoptionen',
                  'Spezial-Produkte nur für VIPs'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + index * 0.05 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.2 + index * 0.05, type: 'spring' }}
                      >
                        ✓
                      </motion.div>
                    </div>
                    <span className="text-sm text-zinc-200 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                className="text-center p-5 bg-zinc-900/50 border-2 border-yellow-500/30 rounded-xl hover:border-yellow-400/60 transition-all"
              >
                <motion.div 
                  className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  &lt;5min
                </motion.div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Antwortzeit</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                className="text-center p-5 bg-zinc-900/50 border-2 border-yellow-500/30 rounded-xl hover:border-yellow-400/60 transition-all"
              >
                <motion.div 
                  className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                >
                  24/7
                </motion.div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Support</p>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                className="text-center p-5 bg-zinc-900/50 border-2 border-yellow-500/30 rounded-xl hover:border-yellow-400/60 transition-all"
              >
                <motion.div 
                  className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                >
                  100%
                </motion.div>
                <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Premium</p>
              </motion.div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Link to={createPageUrl('VIP')}>
                <motion.button
                  whileHover={{ scale: 1.08, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="inline-flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 rounded-2xl font-black text-xl text-zinc-900 shadow-2xl shadow-yellow-500/60 hover:shadow-yellow-500/80 transition-all group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Crown className="w-7 h-7 group-hover:rotate-12 transition-transform relative z-10" />
                  <span className="relative z-10">Jetzt VIP werden</span>
                  <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform relative z-10" />
                </motion.button>
              </Link>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-6 text-base text-zinc-300 font-medium"
              >
                Lade <span className="text-yellow-400 font-black">3 Freunde</span> ein oder erfülle die VIP-Anforderungen
              </motion.p>
              
              <Link to={createPageUrl('VIP')}>
                <motion.p
                  whileHover={{ scale: 1.05 }}
                  className="inline-block mt-2 text-sm text-yellow-400 hover:text-yellow-300 underline font-bold transition-colors"
                >
                  Alle Details & Vorteile ansehen →
                </motion.p>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Still have questions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        className="mt-12 p-8 glass border border-zinc-800 rounded-2xl text-center"
      >
        <h3 className="text-2xl font-bold mb-3 text-white">Noch Fragen?</h3>
        <p className="text-zinc-300 mb-6">
          Wir helfen dir gerne weiter! Kontaktiere uns über Telegram, E-Mail oder WhatsApp.
        </p>
        <Link to={createPageUrl('Help')}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neon-button px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold shadow-xl shadow-purple-500/50"
          >
            Zum Support
          </motion.button>
        </Link>
      </motion.div>
    </div>
  );
}