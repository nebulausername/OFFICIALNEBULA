import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Crown, MessageSquare, HelpCircle, ChevronDown, Package, CreditCard, Truck, RotateCcw, Shield, Zap, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TicketList from '../components/support/TicketList';
import CreateTicketModal from '../components/support/CreateTicketModal';
import VipUpgradeModal from '../components/support/VipUpgradeModal';

export default function Support() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openTicketCount, setOpenTicketCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqCategory, setFaqCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchQuery, statusFilter, categoryFilter]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const userTickets = await base44.entities.Ticket.filter(
        { user_id: userData.id },
        '-last_message_at'
      );
      setTickets(userTickets);

      const openCount = userTickets.filter(t => 
        t.status === 'open' || t.status === 'in_progress'
      ).length;
      setOpenTicketCount(openCount);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];

    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    setFilteredTickets(filtered);
  };

  const handleCreateTicket = () => {
    if (openTicketCount >= 2 && !user?.is_vip) {
      setShowVipModal(true);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleTicketCreated = (result) => {
    if (result === 'LIMIT_REACHED') {
      setTimeout(() => setShowVipModal(true), 300);
    } else {
      loadData();
      setTimeout(() => {
        navigate(createPageUrl('SupportTicketDetail') + `?id=${result.id}`);
      }, 400);
    }
  };

  const getFaqItems = () => [
    {
      category: 'orders',
      question: 'Wie lange dauert die Bearbeitung meiner Bestellung?',
      answer: 'Bestellungen werden in der Regel innerhalb von 24-48 Stunden bearbeitet. Nach Bestätigung erhältst du eine E-Mail mit Tracking-Informationen. VIP-Mitglieder erhalten Prioritätsbearbeitung.'
    },
    {
      category: 'orders',
      question: 'Kann ich meine Bestellung noch ändern?',
      answer: 'Solange deine Bestellung noch nicht versendet wurde, können wir Änderungen vornehmen. Erstelle dafür bitte ein Support-Ticket mit deiner Bestellnummer und den gewünschten Änderungen.'
    },
    {
      category: 'payment',
      question: 'Welche Zahlungsmethoden akzeptiert ihr?',
      answer: 'Wir akzeptieren Kreditkarten, PayPal, Sofortüberweisung und Klarna. Alle Zahlungen werden sicher über verschlüsselte Verbindungen abgewickelt.'
    },
    {
      category: 'payment',
      question: 'Ist meine Zahlung sicher?',
      answer: 'Ja, alle Zahlungen werden über sichere SSL-verschlüsselte Verbindungen abgewickelt. Wir speichern keine Kreditkartendaten auf unseren Servern.'
    },
    {
      category: 'shipping',
      question: 'Wie hoch sind die Versandkosten?',
      answer: 'Der Versand ist für alle Bestellungen kostenlos. Je nach Versandort (Deutschland oder China) variiert die Lieferzeit zwischen 1-5 bzw. 8-15 Werktagen.'
    },
    {
      category: 'shipping',
      question: 'Wie kann ich meine Bestellung verfolgen?',
      answer: 'Nach dem Versand erhältst du eine E-Mail mit der Tracking-Nummer. Du kannst deine Bestellung auch jederzeit unter "Meine Bestellungen" in deinem Profil verfolgen.'
    },
    {
      category: 'shipping',
      question: 'Versendet ihr international?',
      answer: 'Derzeit versenden wir hauptsächlich innerhalb Deutschlands und der EU. Für internationale Bestellungen kontaktiere bitte unser Support-Team.'
    },
    {
      category: 'returns',
      question: 'Wie funktioniert die Rückgabe?',
      answer: 'Du hast 14 Tage Rückgaberecht. Erstelle ein Support-Ticket mit deiner Bestellnummer und dem Rückgabegrund. Wir senden dir dann ein Retourenlabel zu.'
    },
    {
      category: 'returns',
      question: 'Wann erhalte ich meine Rückerstattung?',
      answer: 'Nach Erhalt und Prüfung der Rücksendung erfolgt die Rückerstattung innerhalb von 5-7 Werktagen auf deine ursprüngliche Zahlungsmethode.'
    },
    {
      category: 'account',
      question: 'Wie werde ich VIP-Mitglied?',
      answer: 'Du kannst VIP-Status durch Einladungen erreichen: Lade entweder 10 Personen ein oder 5 Premium-Käufer. VIP-Mitglieder erhalten unbegrenzte Tickets, Priority Support und exklusive Angebote.'
    },
    {
      category: 'account',
      question: 'Was ist das Ticket-Limit?',
      answer: 'Normale User können maximal 2 offene Support-Tickets gleichzeitig haben. VIP-Mitglieder haben unbegrenzten Zugang zu Support-Tickets und erhalten schnellere Antworten.'
    },
    {
      category: 'account',
      question: 'Wie ändere ich meine Profildaten?',
      answer: 'Gehe zu "Profil" → "Einstellungen" und bearbeite dort deine persönlichen Daten. Änderungen werden sofort gespeichert.'
    },
    {
      category: 'orders',
      question: 'Was bedeutet "Versand aus Deutschland" vs "Versand aus China"?',
      answer: 'Produkte aus Deutschland werden schneller geliefert (1-5 Tage) zum regulären Preis. China-Versand dauert länger (8-15 Tage), ist aber 15% günstiger.'
    },
    {
      category: 'account',
      question: 'Wie kontaktiere ich den Support am schnellsten?',
      answer: 'Erstelle ein Support-Ticket über "Neues Ticket". VIP-Mitglieder erhalten zusätzlich Zugang zu unserem exklusiven WhatsApp-Support für sofortige Hilfe.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(createPageUrl('Profile'))}
            variant="outline"
            className="mb-4 bg-white/[0.02] border-white/[0.08] text-white hover:bg-white/[0.05]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Profil
          </Button>
          
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-[20px] flex items-center justify-center shadow-xl shadow-blue-500/40"
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-2">Support Center</h1>
              <p className="text-zinc-400 font-medium">Wir helfen dir weiter</p>
            </div>
          </div>

          {/* Ticket Counter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-center justify-between bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.12] transition-all"
          >
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-1">Offene Tickets</p>
              {user?.is_vip ? (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  <span className="text-xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                    VIP: Unbegrenzt
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-white">
                    {openTicketCount} / 2
                  </p>
                  {openTicketCount >= 2 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5"
                    >
                      Limit erreicht
                    </motion.span>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={handleCreateTicket}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40 hover:scale-105 font-black transition-all"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neues Ticket
            </Button>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="mb-6 bg-white/[0.02] border-2 border-white/[0.08]">
            <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold">
              Meine Tickets
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold">
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            {/* Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tickets durchsuchen..."
                  className="pl-12 bg-white/[0.02] border-white/[0.08] text-white h-12"
                />
              </div>

              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1 bg-white/[0.02] border-white/[0.08] text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="open">Offen</SelectItem>
                    <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                    <SelectItem value="solved">Gelöst</SelectItem>
                    <SelectItem value="closed">Geschlossen</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="flex-1 bg-white/[0.02] border-white/[0.08] text-white">
                    <SelectValue placeholder="Kategorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Kategorien</SelectItem>
                    <SelectItem value="order">Bestellung</SelectItem>
                    <SelectItem value="payment">Zahlung</SelectItem>
                    <SelectItem value="product">Produkt</SelectItem>
                    <SelectItem value="return">Retoure</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket List */}
            <TicketList tickets={filteredTickets} loading={loading} />
          </TabsContent>

          <TabsContent value="faq">
            {/* FAQ Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-black text-white mb-2">Häufige Fragen</h2>
              <p className="text-zinc-400">Schnelle Antworten auf die wichtigsten Fragen</p>
            </motion.div>

            {/* FAQ Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Frage durchsuchen..."
                  className="pl-12 bg-white/[0.02] border-white/[0.08] text-white h-12"
                />
              </div>
            </div>

            {/* FAQ Categories */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {[
                { key: 'all', label: 'Alle', icon: HelpCircle },
                { key: 'orders', label: 'Bestellungen', icon: Package },
                { key: 'payment', label: 'Zahlung', icon: CreditCard },
                { key: 'shipping', label: 'Versand', icon: Truck },
                { key: 'returns', label: 'Retouren', icon: RotateCcw },
                { key: 'account', label: 'Konto', icon: Shield }
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFaqCategory(cat.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                      faqCategory === cat.key
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] border border-white/[0.08]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {getFaqItems()
                .filter(item => 
                  (faqCategory === 'all' || item.category === faqCategory) &&
                  (faqSearch === '' || 
                   item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                   item.answer.toLowerCase().includes(faqSearch.toLowerCase()))
                )
                .map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                      className="w-full text-left bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">{item.question}</h3>
                          <AnimatePresence>
                            {expandedFaq === index && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <p className="text-zinc-400 text-sm leading-relaxed mt-3 pt-3 border-t border-white/[0.08]">
                                  {item.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                        </motion.div>
                      </div>
                    </button>
                  </motion.div>
                ))}
            </div>

            {/* No Results */}
            {getFaqItems().filter(item => 
              (faqCategory === 'all' || item.category === faqCategory) &&
              (faqSearch === '' || 
               item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
               item.answer.toLowerCase().includes(faqSearch.toLowerCase()))
            ).length === 0 && (
              <div className="text-center py-16">
                <HelpCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Keine Ergebnisse</h3>
                <p className="text-zinc-400 mb-6">Versuche einen anderen Suchbegriff oder erstelle ein Ticket</p>
                <Button onClick={handleCreateTicket} className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Ticket erstellen
                </Button>
              </div>
            )}

            {/* Quick Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6 text-center"
            >
              <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Nicht gefunden?</h3>
              <p className="text-zinc-400 mb-4">Erstelle ein Ticket und wir helfen dir weiter</p>
              <Button onClick={handleCreateTicket} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40">
                <Plus className="w-5 h-5 mr-2" />
                Neues Ticket
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTicketCreated}
      />

      <VipUpgradeModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
      />
    </div>
  );
}