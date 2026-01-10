import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Clock, ChevronRight, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const statusConfig = {
  open: { label: 'Offen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'In Bearbeitung', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  solved: { label: 'Gelöst', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  closed: { label: 'Geschlossen', color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' }
};

const categoryLabels = {
  order: 'Bestellung',
  payment: 'Zahlung',
  product: 'Produkt',
  return: 'Retoure',
  other: 'Sonstiges'
};

export default function TicketList({ tickets, onSelectTicket, selectedId }) {
  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-zinc-600" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Keine Tickets</h3>
        <p className="text-zinc-500 text-sm">Du hast noch keine Support-Tickets erstellt</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket, i) => {
        const status = statusConfig[ticket.status] || statusConfig.open;
        const isSelected = selectedId === ticket.id;

        return (
          <motion.button
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelectTicket(ticket)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${
              isSelected 
                ? 'bg-purple-500/10 border-purple-500/30' 
                : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.1]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge className={`${status.color} border text-xs font-semibold px-2 py-0.5`}>
                    {status.label}
                  </Badge>
                  {ticket.unread_by_user && (
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                  )}
                  {ticket.priority === 'vip' && (
                    <Badge className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-amber-400 border-amber-500/30 text-xs">
                      VIP
                    </Badge>
                  )}
                </div>
                <h4 className="text-white font-bold text-sm truncate mb-1">
                  {ticket.subject}
                </h4>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{categoryLabels[ticket.category]}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(ticket.last_message_at || ticket.created_date), { 
                      addSuffix: true, 
                      locale: de 
                    })}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 flex-shrink-0 transition-colors ${
                isSelected ? 'text-purple-400' : 'text-zinc-600'
              }`} />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}