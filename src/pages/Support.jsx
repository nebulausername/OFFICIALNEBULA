import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Crown, MessageSquare, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
      setShowVipModal(true);
    } else {
      loadData();
      navigate(createPageUrl('SupportTicketDetail') + `?id=${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
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
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.08] rounded-xl p-4">
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
                <p className="text-2xl font-black text-white">
                  {openTicketCount} / 2
                </p>
              )}
            </div>
            <Button
              onClick={handleCreateTicket}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40 font-black"
            >
              <Plus className="w-5 h-5 mr-2" />
              Neues Ticket
            </Button>
          </div>
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
            <div className="text-center py-16">
              <HelpCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">FAQ Coming Soon</h3>
              <p className="text-zinc-400 mb-6">Häufig gestellte Fragen werden hier angezeigt</p>
              <Button onClick={handleCreateTicket} className="bg-gradient-to-r from-purple-500 to-pink-500">
                Direkt Ticket erstellen
              </Button>
            </div>
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