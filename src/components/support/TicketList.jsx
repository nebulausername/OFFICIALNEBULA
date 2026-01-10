import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import StatusChip from './StatusChip';
import GlassCard from '../settings/GlassCard';

export default function TicketList({ tickets, loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 skeleton rounded-xl" />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-20">
        <MessageSquare className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Noch keine Tickets</h3>
        <p className="text-zinc-400">Erstelle dein erstes Support-Ticket</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket, index) => (
        <motion.div
          key={ticket.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link to={createPageUrl('SupportTicketDetail') + `?id=${ticket.id}`}>
            <GlassCard hover className="p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusChip status={ticket.status} />
                    {ticket.unread_by_user && (
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 truncate">{ticket.subject}</h3>
                  <p className="text-zinc-400 text-sm">
                    Kategorie: {getCategoryLabel(ticket.category)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {ticket.last_message_at && formatDistanceToNow(new Date(ticket.last_message_at), { addSuffix: true, locale: de })}
                </div>
                <span className="text-zinc-600">#{ticket.id.slice(0, 8)}</span>
              </div>
            </GlassCard>
          </Link>
        </motion.div>
      ))}
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