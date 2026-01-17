import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Crown, MessageSquare, HelpCircle, ChevronDown, 
  Package, CreditCard, Truck, RotateCcw, Shield, Zap, ArrowLeft,
  Inbox, Clock, CheckCircle, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import PremiumTicketCard from '../components/support/PremiumTicketCard';
import PremiumCreateTicketModal from '../components/support/PremiumCreateTicketModal';
import VipUpgradeModal from '../components/support/VipUpgradeModal';
import { useI18n } from '../components/i18n/I18nProvider';

export default function Support() {
  const { t, isRTL } = useI18n();
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
  const [preselectedCategory, setPreselectedCategory] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [faqSearch, setFaqSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [faqCategory, setFaqCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchQuery, statusFilter, categoryFilter, activeTab]);

  const loadData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const userTickets = await api.entities.Ticket.filter(
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

    // Tab filter
    if (activeTab === 'open') {
      filtered = filtered.filter(t => t.status === 'open' || t.status === 'in_progress');
    } else if (activeTab === 'waiting') {
      filtered = filtered.filter(t => t.unread_by_user);
    } else if (activeTab === 'solved') {
      filtered = filtered.filter(t => t.status === 'solved' || t.status === 'closed');
    }

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

  const handleCreateTicket = (category = null) => {
    if (openTicketCount >= 2 && !user?.is_vip) {
      setShowVipModal(true);
    } else {
      setPreselectedCategory(category);
      setShowCreateModal(true);
    }
  };

  const handleTicketCreated = (result) => {
    if (result === 'LIMIT_REACHED') {
      setTimeout(() => setShowVipModal(true), 300);
    } else if (result?.id) {
      loadData();
      setTimeout(() => {
        navigate(createPageUrl('SupportTicketDetail') + `?id=${result.id}`);
      }, 400);
    }
  };

  const getTabCounts = () => {
    const all = tickets.length;
    const open = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const waiting = tickets.filter(t => t.unread_by_user).length;
    const solved = tickets.filter(t => t.status === 'solved' || t.status === 'closed').length;
    return { all, open, waiting, solved };
  };

  const tabCounts = getTabCounts();

  const faqItems = [
    { category: 'orders', question: 'Wie lange dauert die Bearbeitung meiner Bestellung?', answer: 'Bestellungen werden in der Regel innerhalb von 24-48 Stunden bearbeitet.' },
    { category: 'payment', question: 'Welche Zahlungsmethoden akzeptiert ihr?', answer: 'Wir akzeptieren Kreditkarten, PayPal und Sofortüberweisung.' },
    { category: 'shipping', question: 'Wie hoch sind die Versandkosten?', answer: 'Der Versand ist für alle Bestellungen kostenlos.' },
    { category: 'returns', question: 'Wie funktioniert die Rückgabe?', answer: 'Du hast 14 Tage Rückgaberecht. Erstelle ein Support-Ticket.' },
    { category: 'account', question: 'Wie werde ich VIP-Mitglied?', answer: 'Lade 10 Freunde ein oder 5 Premium-Käufer.' }
  ];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate(createPageUrl('Profile'))}
            variant="outline"
            className="mb-4"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <ArrowLeft className={`w-4 h-4 ${isRTL ? 'ms-2 rotate-180' : 'me-2'}`} />
            {t('support.backToProfile')}
          </Button>
          
          <div className="flex items-start gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-16 h-16 rounded-[20px] flex items-center justify-center shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #06B6D4)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
              }}
            >
              <MessageSquare className="w-8 h-8 text-white" />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-2">{t('support.center')}</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }} className="font-medium">
                {t('support.helpText')}
              </p>
            </div>
          </div>

          {/* Ticket Counter Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between p-5 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {t('support.openTickets')}
              </p>
              {user?.is_vip ? (
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color: '#FBBF24' }} />
                  <span className="text-xl font-black" style={{ color: '#F2D27C' }}>
                    {t('support.vipUnlimited')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black text-white">
                    {openTicketCount} / 2
                  </p>
                  {openTicketCount >= 2 && (
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#F87171'
                      }}
                    >
                      {t('support.limitReached')}
                    </span>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleCreateTicket()}
              className="btn-gold font-black"
            >
              <Plus className={`w-5 h-5 ${isRTL ? 'ms-2' : 'me-2'}`} />
              {t('support.newTicket')}
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Tabs */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList 
            className="mb-6 p-1 rounded-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <TabsTrigger 
              value="tickets" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg"
            >
              {t('support.myTickets')}
            </TabsTrigger>
            <TabsTrigger 
              value="faq" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg"
            >
              {t('support.faq')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            {/* Ticket Status Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { key: 'all', label: t('common.all'), icon: Inbox, count: tabCounts.all },
                { key: 'open', label: t('support.status.open'), icon: MessageSquare, count: tabCounts.open },
                { key: 'waiting', label: t('support.status.waitingForYou'), icon: Clock, count: tabCounts.waiting },
                { key: 'solved', label: t('support.status.solved'), icon: CheckCircle, count: tabCounts.solved }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2"
                    style={{
                      background: isActive ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                      border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#A78BFA' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span 
                        className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          background: isActive ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          color: isActive ? '#C4B5FD' : 'rgba(255, 255, 255, 0.6)'
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Search & Filters */}
            <div className="mb-6 space-y-3">
              <div className="relative">
                <Search 
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${isRTL ? 'right-4' : 'left-4'}`}
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('support.searchTickets')}
                  className={`h-12 ${isRTL ? 'pr-12' : 'pl-12'}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF'
                  }}
                />
              </div>

              <div className="flex gap-3">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger 
                    className="flex-1 h-11"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#FFFFFF'
                    }}
                  >
                    <SelectValue placeholder={t('support.allCategories')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('support.allCategories')}</SelectItem>
                    <SelectItem value="order">{t('support.category.order')}</SelectItem>
                    <SelectItem value="payment">{t('support.category.payment')}</SelectItem>
                    <SelectItem value="delivery">{t('support.category.delivery')}</SelectItem>
                    <SelectItem value="product">{t('support.category.product')}</SelectItem>
                    <SelectItem value="return">{t('support.category.return')}</SelectItem>
                    <SelectItem value="technical">{t('support.category.technical')}</SelectItem>
                    <SelectItem value="language_request">{t('support.category.languageRequest')}</SelectItem>
                    <SelectItem value="other">{t('support.category.other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ticket List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div 
                    key={i} 
                    className="h-24 rounded-2xl animate-pulse"
                    style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                  />
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="text-center py-20">
                <div 
                  className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}
                >
                  <MessageSquare className="w-10 h-10" style={{ color: '#A78BFA' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{t('support.noTickets')}</h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="mb-6">
                  {t('support.createFirst')}
                </p>
                <Button onClick={() => handleCreateTicket()} className="btn-gold">
                  <Plus className="w-5 h-5 me-2" />
                  {t('support.newTicket')}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket, index) => (
                  <PremiumTicketCard key={ticket.id} ticket={ticket} index={index} />
                ))}
              </div>
            )}

            {/* Language Request Quick Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(139, 92, 246, 0.1))',
                border: '1px solid rgba(236, 72, 153, 0.2)'
              }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(236, 72, 153, 0.2)' }}
                >
                  <Globe className="w-6 h-6" style={{ color: '#F472B6' }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-1">{t('language.missing')}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {t('language.missingSubtitle')}
                  </p>
                </div>
                <Button
                  onClick={() => handleCreateTicket('language_request')}
                  variant="outline"
                  className="font-bold"
                  style={{
                    background: 'rgba(236, 72, 153, 0.15)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    color: '#F472B6'
                  }}
                >
                  {t('language.request')}
                </Button>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="faq">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <h2 className="text-2xl font-black text-white mb-2">{t('support.frequentQuestions')}</h2>
              <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t('support.quickAnswers')}</p>
            </motion.div>

            <div className="mb-6">
              <div className="relative">
                <Search 
                  className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 ${isRTL ? 'right-4' : 'left-4'}`}
                  style={{ color: 'rgba(255, 255, 255, 0.4)' }}
                />
                <Input
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder={t('support.searchQuestions')}
                  className={`h-12 ${isRTL ? 'pr-12' : 'pl-12'}`}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#FFFFFF'
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { key: 'all', label: t('support.faqCategory.all'), icon: HelpCircle },
                { key: 'orders', label: t('support.faqCategory.orders'), icon: Package },
                { key: 'payment', label: t('support.faqCategory.payment'), icon: CreditCard },
                { key: 'shipping', label: t('support.faqCategory.shipping'), icon: Truck },
                { key: 'returns', label: t('support.faqCategory.returns'), icon: RotateCcw },
                { key: 'account', label: t('support.faqCategory.account'), icon: Shield }
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFaqCategory(cat.key)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2`}
                    style={{
                      background: faqCategory === cat.key 
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: faqCategory === cat.key
                        ? '1px solid rgba(139, 92, 246, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      color: faqCategory === cat.key ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)'
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {faqItems
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
                      className="w-full text-start p-4 rounded-xl transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
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
                                className="overflow-hidden"
                              >
                                <p 
                                  className="text-sm leading-relaxed mt-3 pt-3"
                                  style={{ 
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                                  }}
                                >
                                  {item.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <motion.div animate={{ rotate: expandedFaq === index ? 180 : 0 }}>
                          <ChevronDown className="w-5 h-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                        </motion.div>
                      </div>
                    </button>
                  </motion.div>
                ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 p-6 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <Zap className="w-12 h-12 mx-auto mb-4" style={{ color: '#A78BFA' }} />
              <h3 className="text-xl font-black text-white mb-2">{t('support.notFound')}</h3>
              <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t('support.weHelpYou')}</p>
              <Button onClick={() => handleCreateTicket()} className="btn-gold">
                <Plus className="w-5 h-5 me-2" />
                {t('support.newTicket')}
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <PremiumCreateTicketModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setPreselectedCategory(null);
        }}
        onSuccess={handleTicketCreated}
        preselectedCategory={preselectedCategory}
      />

      <VipUpgradeModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
      />
    </div>
  );
}