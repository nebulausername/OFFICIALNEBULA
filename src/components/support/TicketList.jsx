import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';
import PremiumTicketCard from './PremiumTicketCard';

export default function TicketList({ tickets, loading }) {
  const { t } = useI18n();
  
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i} 
            className="h-24 rounded-2xl animate-pulse"
            style={{ background: 'rgba(255, 255, 255, 0.04)' }}
          />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
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
        <p style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{t('support.createFirst')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.map((ticket, index) => (
        <PremiumTicketCard key={ticket.id} ticket={ticket} index={index} />
      ))}
    </div>
  );
}