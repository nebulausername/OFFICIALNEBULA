import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Package, CreditCard, Truck, RotateCcw, HelpCircle, Globe, Wrench, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de, enUS, sk, ar } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../i18n/I18nProvider';

const categoryIcons = {
  order: Package,
  payment: CreditCard,
  delivery: Truck,
  return: RotateCcw,
  product: Package,
  technical: Wrench,
  language_request: Globe,
  other: HelpCircle
};

const statusColors = {
  open: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.4)', text: '#60A5FA' },
  in_progress: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#FBBF24' },
  waiting: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', text: '#A855F7' },
  solved: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.4)', text: '#4ADE80' },
  closed: { bg: 'rgba(113, 113, 122, 0.15)', border: 'rgba(113, 113, 122, 0.4)', text: '#A1A1AA' }
};

export default function PremiumTicketCard({ ticket, index = 0 }) {
  const { t, locale, isRTL } = useI18n();
  
  const localeMap = { de, en: enUS, sk, ar };
  const dateLocale = localeMap[locale] || de;
  
  const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
  const status = statusColors[ticket.status] || statusColors.open;
  
  const getStatusLabel = (s) => {
    const labels = {
      open: t('support.status.open'),
      in_progress: t('support.status.inProgress'),
      waiting: t('support.status.waitingForYou'),
      solved: t('support.status.solved'),
      closed: t('support.status.closed')
    };
    return labels[s] || s;
  };
  
  const getCategoryLabel = (cat) => {
    const labels = {
      order: t('support.category.order'),
      payment: t('support.category.payment'),
      product: t('support.category.product'),
      return: t('support.category.return'),
      delivery: t('support.category.delivery'),
      technical: t('support.category.technical'),
      language_request: t('support.category.languageRequest'),
      other: t('support.category.other')
    };
    return labels[cat] || cat;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <Link to={createPageUrl('SupportTicketDetail') + `?id=${ticket.id}`}>
        <div 
          className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300"
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)'
          }}
        >
          {/* Unread Indicator */}
          {ticket.unread_by_user && (
            <div 
              className={`absolute top-0 ${isRTL ? 'left-0' : 'right-0'} w-1 h-full`}
              style={{ background: 'linear-gradient(180deg, #8B5CF6, #EC4899)' }}
            />
          )}
          
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Category Icon */}
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid rgba(139, 92, 246, 0.3)'
                }}
              >
                <CategoryIcon className="w-5 h-5" style={{ color: '#A78BFA' }} />
              </div>
              
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-base text-white truncate mb-1">
                  {ticket.subject}
                </h3>
                <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {getCategoryLabel(ticket.category)}
                </p>
              </div>
            </div>
            
            {/* Status Chip */}
            <div 
              className="px-3 py-1.5 rounded-full text-xs font-bold flex-shrink-0"
              style={{
                background: status.bg,
                border: `1px solid ${status.border}`,
                color: status.text
              }}
            >
              {getStatusLabel(ticket.status)}
            </div>
          </div>
          
          {/* Footer */}
          <div className={`flex items-center justify-between text-xs ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="flex items-center gap-1.5" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
              <Clock className="w-3.5 h-3.5" />
              <span>
                {ticket.last_message_at && formatDistanceToNow(new Date(ticket.last_message_at), { 
                  addSuffix: true, 
                  locale: dateLocale 
                })}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {ticket.unread_by_user && (
                <div className="flex items-center gap-1" style={{ color: '#A78BFA' }}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="font-semibold">Neu</span>
                </div>
              )}
              <span style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                #{ticket.id.slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}