import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Search, Filter, Clock, User, Shield, Send, 
  Loader2, ArrowLeft, AlertCircle, CheckCircle, XCircle, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const statusConfig = {
  open: { label: 'Offen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle },
  in_progress: { label: 'In Bearbeitung', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Clock },
  solved: { label: 'Gelöst', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
  closed: { label: 'Geschlossen', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30', icon: XCircle }
};

export default function AdminSupport() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
      markAsRead(selectedTicket);
    }
  }, [selectedTicket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      if (userData.role !== 'admin') {
        window.location.href = createPageUrl('Home');
        return;
      }
      setUser(userData);
      await loadTickets();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    const t = await base44.entities.Ticket.list('-last_message_at', 100);
    setTickets(t);
  };

  const loadMessages = async (ticketId) => {
    const msgs = await base44.entities.TicketMessage.filter({ ticket_id: ticketId }, 'created_date');
    setMessages(msgs);
  };

  const markAsRead = async (ticket) => {
    if (ticket.unread_by_admin) {
      await base44.entities.Ticket.update(ticket.id, { unread_by_admin: false });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedTicket) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const msg = await base44.entities.TicketMessage.create({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        sender_role: 'admin',
        body: messageText,
        read_by_admin: true,
        read_by_user: false
      });

      await base44.entities.Ticket.update(selectedTicket.id, {
        last_message_at: new Date().toISOString(),
        unread_by_user: true
      });

      setMessages([...messages, msg]);
      loadTickets();
    } catch (error) {
      toast({ title: 'Senden fehlgeschlagen', variant: 'destructive' });
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await base44.entities.Ticket.update(ticketId, { status: newStatus });
      setSelectedTicket({ ...selectedTicket, status: newStatus });
      loadTickets();
      toast({ title: `Status: ${statusConfig[newStatus].label}` });
    } catch (error) {
      toast({ title: 'Fehler', variant: 'destructive' });
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery && !t.subject.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    unread: tickets.filter(t => t.unread_by_admin).length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Admin')} className="w-10 h-10 bg-white/[0.05] hover:bg-white/[0.1] rounded-xl flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-zinc-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-white">Support Inbox</h1>
              <p className="text-zinc-400 text-sm">Alle Kundenanfragen</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-blue-400">{stats.open}</p>
            <p className="text-zinc-500 text-xs font-medium">Offen</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{stats.inProgress}</p>
            <p className="text-zinc-500 text-xs font-medium">In Bearbeitung</p>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-purple-400">{stats.unread}</p>
            <p className="text-zinc-500 text-xs font-medium">Ungelesen</p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex gap-6">
          {/* Ticket List */}
          <div className={`${selectedTicket && 'hidden lg:block'} lg:w-96 flex-shrink-0`}>
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4">
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
                  <SelectTrigger className="w-28 h-10 bg-white/[0.03] border-white/[0.1] text-white rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="open">Offen</SelectItem>
                    <SelectItem value="in_progress">In Bearb.</SelectItem>
                    <SelectItem value="solved">Gelöst</SelectItem>
                    <SelectItem value="closed">Geschlossen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredTickets.map((ticket) => {
                  const status = statusConfig[ticket.status];
                  const isSelected = selectedTicket?.id === ticket.id;
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        isSelected ? 'bg-purple-500/10 border-purple-500/30' : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${status.color} border text-xs px-2 py-0`}>{status.label}</Badge>
                        {ticket.unread_by_admin && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                        {ticket.priority === 'vip' && <Crown className="w-3 h-3 text-amber-400" />}
                      </div>
                      <h4 className="text-white font-bold text-sm truncate">{ticket.subject}</h4>
                      <p className="text-zinc-500 text-xs mt-1">
                        {formatDistanceToNow(new Date(ticket.last_message_at || ticket.created_date), { addSuffix: true, locale: de })}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat */}
          <div className={`${!selectedTicket && 'hidden lg:flex'} flex-1`}>
            <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col min-h-[600px]">
              {selectedTicket ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-3 mb-3">
                      <button onClick={() => setSelectedTicket(null)} className="lg:hidden w-9 h-9 bg-white/[0.05] rounded-xl flex items-center justify-center">
                        <ArrowLeft className="w-5 h-5 text-zinc-400" />
                      </button>
                      <div className="flex-1">
                        <h3 className="text-white font-bold">{selectedTicket.subject}</h3>
                        <p className="text-zinc-500 text-xs">#{selectedTicket.id.slice(0, 8)} • User: {selectedTicket.user_id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <Select value={selectedTicket.status} onValueChange={(v) => handleStatusChange(selectedTicket.id, v)}>
                      <SelectTrigger className="w-40 h-9 bg-white/[0.03] border-white/[0.1] text-white rounded-lg text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        <SelectItem value="open">Offen</SelectItem>
                        <SelectItem value="in_progress">In Bearbeitung</SelectItem>
                        <SelectItem value="solved">Gelöst</SelectItem>
                        <SelectItem value="closed">Geschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isAdmin = msg.sender_role === 'admin';
                      return (
                        <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                          <div className="max-w-[80%]">
                            <div className={`flex items-end gap-2 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                isAdmin ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
                              }`}>
                                {isAdmin ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                              </div>
                              <div className={`px-4 py-3 rounded-2xl ${
                                isAdmin ? 'bg-blue-500/20 border border-blue-500/20' : 'bg-white/[0.05] border border-white/[0.08]'
                              }`}>
                                <p className="text-white text-sm whitespace-pre-wrap">{msg.body}</p>
                              </div>
                            </div>
                            <p className={`text-xs text-zinc-600 mt-1 ${isAdmin ? 'text-right mr-10' : 'ml-10'}`}>
                              {format(new Date(msg.created_date), 'dd.MM. HH:mm')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSend} className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Antwort schreiben..."
                        className="flex-1 h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl"
                      />
                      <Button type="submit" disabled={!newMessage.trim() || sending} className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-0">
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-500">Wähle ein Ticket aus der Liste</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}