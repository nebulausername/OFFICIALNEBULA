import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import StatusChip from '../components/support/StatusChip';
import GlassCard from '../components/settings/GlassCard';

export default function AdminSupport() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    open: 0,
    inProgress: 0,
    solved: 0,
    unanswered: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadTickets();
    const interval = setInterval(loadTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, searchQuery, statusFilter]);

  const checkAdmin = async () => {
    try {
      const userData = await api.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  const loadTickets = async () => {
    try {
      const allTickets = await api.entities.Ticket.list('-last_message_at', 100);
      setTickets(allTickets);

      // Calculate metrics
      const open = allTickets.filter(t => t.status === 'open').length;
      const inProgress = allTickets.filter(t => t.status === 'in_progress').length;
      const solved = allTickets.filter(t => t.status === 'solved').length;
      const unanswered = allTickets.filter(t => t.unread_by_admin).length;

      setMetrics({ open, inProgress, solved, unanswered });
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
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.includes(searchQuery)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    setFilteredTickets(filtered);
  };

  const metricCards = [
    { label: 'Offen', value: metrics.open, icon: AlertCircle, color: 'from-blue-500 to-cyan-500' },
    { label: 'In Bearbeitung', value: metrics.inProgress, icon: Clock, color: 'from-purple-500 to-pink-500' },
    { label: 'Gelöst', value: metrics.solved, icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
    { label: 'Unbeantwortet', value: metrics.unanswered, icon: XCircle, color: 'from-red-500 to-rose-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2">Admin Support Dashboard</h1>
          <p className="text-zinc-400 font-medium">Verwaltung aller Support-Tickets</p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-5">
                  <div className={`w-10 h-10 bg-gradient-to-br ${metric.color} bg-opacity-20 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-3xl font-black text-white mb-1">{metric.value}</div>
                  <div className="text-sm text-zinc-400 font-medium">{metric.label}</div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tickets durchsuchen..."
              className="pl-12 bg-white/[0.02] border-white/[0.08] text-white h-12"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-white/[0.02] border-white/[0.08] text-white h-12">
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
        </div>

        {/* Ticket List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))}
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Keine Tickets gefunden</h3>
            <p className="text-zinc-400">Versuche einen anderen Filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <button
                  onClick={() => navigate(createPageUrl('SupportTicketDetail') + `?id=${ticket.id}`)}
                  className="w-full text-left"
                >
                  <GlassCard hover className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusChip status={ticket.status} />
                          {ticket.priority === 'vip' && (
                            <span className="text-xs font-black text-yellow-400">VIP</span>
                          )}
                          {ticket.unread_by_admin && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <h3 className="font-bold text-white text-base mb-1 truncate">{ticket.subject}</h3>
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                          <span>#{ticket.id.slice(0, 8)}</span>
                          <span>•</span>
                          <span>{getCategoryLabel(ticket.category)}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs text-zinc-500">
                        {ticket.last_message_at && formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: true, locale: de })}
                      </div>
                    </div>
                  </GlassCard>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getCategoryLabel(category) {
  const labels = {
    order: 'Bestellung',
    payment: 'Zahlung',
    product: 'Produkt',
    return: 'Retoure',
    other: 'Sonstiges'
  };
  return labels[category] || category;
}