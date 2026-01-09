import React, { useState } from 'react';
import { MessageCircle, ChevronDown, Sparkles, Package, CreditCard, Truck, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
          a: 'Wir befinden uns in der Open Beta. Lege Produkte in den Warenkorb, fülle das Kontaktformular aus und wir melden uns persönlich bei dir zur Bestellbestätigung.'
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
                  <h2 className="text-2xl font-bold">{category.category}</h2>
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
                          <span className="font-semibold text-lg">{faq.q}</span>
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
                            <div className="px-6 pb-6 text-zinc-400 leading-relaxed">
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

      {/* Still have questions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 p-8 glass border border-zinc-800 rounded-2xl text-center"
      >
        <h3 className="text-2xl font-bold mb-3">Noch Fragen?</h3>
        <p className="text-zinc-400 mb-6">
          Wir helfen dir gerne weiter! Kontaktiere uns über Telegram, E-Mail oder WhatsApp.
        </p>
        <a href="/Help">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="neon-button px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold shadow-xl shadow-purple-500/50"
          >
            Zum Support
          </motion.button>
        </a>
      </motion.div>
    </div>
  );
}