import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Crown, HelpCircle, Search, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import TicketList from '../components/support/TicketList';
import TicketChat from '../components/support/TicketChat';
import CreateTicketModal from '../components/support/CreateTicketModal';
import VipUpgradeModal from '../components/support/VipUpgradeModal';

const TICKET_LIMIT = 2;

export default function Support() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVipModal, setShowVipModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Polling for realtime updates (every 10s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) loadTickets();
    }, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      await loadTickets(userData.id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async (userId) => {
    const uid = userId || user?.id;
    if (!uid) return;
    const t = await base44.entities.Ticket.filter({ user_id: uid }, '-last_message_at');
    setTickets(t);
  };

  const openTicketCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const isVip = user?.is_vip === true;
  const canCreateTicket = isVip || openTicketCount < TICKET_LIMIT;

  const handleNewTicket = () => {
    if (canCreateTicket) {
      setShowCreateModal(true);
    } else {
      setShowVipModal(true);
    }
  };

  const handleTicketCreated = (ticket) => {
    loadTickets();
    setSelectedTicket(ticket);
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] relative">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Support Center</h1>
              <p className="text-zinc-400">Wir helfen dir bei allen Fragen</p>
            </div>
            <Button
              onClick={handleNewTicket}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:shadow-xl hover:shadow-purple-500/40 font-bold h-12 px-6 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neues Ticket
            </Button>
          </div>

          {/* Ticket Limit Indicator */}
          <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/[0.06] rounded-2xl">
            {isVip ? (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">VIP: Unbegrenzte Tickets</p>
                  <p className="text-zinc-500 text-xs">Prioritäts-Support aktiviert</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">
                    Offene Tickets: <span className={openTicketCount >= TICKET_LIMIT ? 'text-amber-400' : 'text-purple-400'}>{openTicketCount}/{TICKET_LIMIT}</span>
                  </p>
                  <p className="text-zinc-500 text-xs">
                    {openTicketCount >= TICKET_LIMIT ? 'Limit erreicht – Upgrade auf VIP' : 'Noch Tickets verfügbar'}
                  </p>
                </div>
                {openTicketCount >= TICKET_LIMIT && (
                  <Button
                    onClick={() => setShowVipModal(true)}
                    size="sm"
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold h-9"
                  >
                    <Crown className="w-4 h-4 mr-1" />
                    VIP
                  </Button>
                )}
              </>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="mb-6 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl">
            <TabsTrigger value="tickets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-bold px-6">
              <MessageCircle className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg font-bold px-6">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Ticket List */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${selectedTicket && 'hidden lg:block'} lg:w-96 flex-shrink-0`}
              >
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
                  {/* Filters */}
                  <div className="flex gap-2 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Suchen..."
                        className="pl-9 h-10 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32 h-10 bg-white/[0.03] border-white/[0.1] text-white rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="all">Alle</SelectItem>
                        <SelectItem value="open">Offen</SelectItem>
                        <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                        <SelectItem value="solved">Gelöst</SelectItem>
                        <SelectItem value="closed">Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <TicketList
                    tickets={filteredTickets}
                    onSelectTicket={setSelectedTicket}
                    selectedId={selectedTicket?.id}
                  />
                </div>
              </motion.div>

              {/* Ticket Detail / Chat */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`${!selectedTicket && 'hidden lg:flex'} flex-1 min-h-[600px]`}
              >
                <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
                  {selectedTicket ? (
                    <TicketChat
                      ticket={selectedTicket}
                      userId={user.id}
                      onBack={() => setSelectedTicket(null)}
                      onStatusChange={loadTickets}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="w-20 h-20 bg-white/[0.03] border border-white/[0.08] rounded-3xl flex items-center justify-center mb-4">
                        <MessageCircle className="w-10 h-10 text-zinc-600" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">Wähle ein Ticket</h3>
                      <p className="text-zinc-500 text-sm mb-6">Oder erstelle ein neues Ticket</p>
                      <Button onClick={handleNewTicket} variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5">
                        <Plus className="w-4 h-4 mr-2" />
                        Neues Ticket
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="faq">
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center">
              <HelpCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Häufig gestellte Fragen</h3>
              <p className="text-zinc-400 mb-6">Finde schnell Antworten auf deine Fragen</p>
              <Link to={createPageUrl('FAQ')}>
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 font-bold">
                  Zu den FAQ
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleTicketCreated}
        userId={user?.id}
        isVip={isVip}
      />

      <VipUpgradeModal
        isOpen={showVipModal}
        onClose={() => setShowVipModal(false)}
        currentTickets={openTicketCount}
      />
    </div>
  );
}