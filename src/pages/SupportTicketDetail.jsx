import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, FileText, ThumbsUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de, enUS, sk, ar } from 'date-fns/locale';
import StatusChip from '../components/support/StatusChip';
import { useI18n } from '../components/i18n/I18nProvider';

export default function SupportTicketDetail() {
  const { t, locale, isRTL } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticketId = searchParams.get('id');
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const localeMap = { de, en: enUS, sk, ar };
  const dateLocale = localeMap[locale] || de;

  const getCategoryLabel = (category) => {
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
    return labels[category] || category;
    return labels[category] || category;
  };

  const QUICK_REPLIES = [
    { label: 'Hallo & Empfang', text: 'Hallo, danke für deine Nachricht. Wir schauen uns das sofort an.' },
    { label: 'Status Update', text: 'Wir arbeiten aktuell an deinem Anliegen und melden uns in Kürze wieder.' },
    { label: 'Erstattung', text: 'Wir haben die Erstattung veranlasst. Das Geld sollte innerhalb von 3-5 Werktagen bei dir sein.' },
    { label: 'Versand', text: 'Deine Bestellung wurde versandt und ist auf dem Weg zu dir.' },
    { label: 'Abschluss', text: 'Freut mich, dass wir helfen konnten. Melde dich gerne, falls noch etwas ist.' }
  ];

  const handleQuickReply = (value) => {
    setNewMessage(prev => prev ? prev + '\n' + value : value);
  };

  useEffect(() => {
    if (ticketId) {
      loadTicket();
      const interval = setInterval(loadMessages, 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadTicket = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const tickets = await api.entities.Ticket.filter({ id: ticketId });
      if (tickets.length === 0) {
        toast.error('Ticket nicht gefunden');
        navigate(createPageUrl('Support'));
        return;
      }

      const ticketData = tickets[0];
      if (ticketData.user_id !== userData.id && userData.role !== 'admin') {
        toast.error('Keine Berechtigung');
        navigate(createPageUrl('Support'));
        return;
      }

      setTicket(ticketData);

      // Mark as read by user
      if (ticketData.unread_by_user) {
        await api.entities.Ticket.update(ticketId, { unread_by_user: false });
      }

      await loadMessages();
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast.error(t('support.chat.sendFailed'));
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await api.entities.TicketMessage.filter(
        { ticket_id: ticketId },
        'created_at'
      );
      setMessages(msgs);

      // Mark messages as read
      const unreadMsgs = msgs.filter(m => m.sender_role === 'admin' && !m.read_by_user);
      for (const msg of unreadMsgs) {
        await api.entities.TicketMessage.update(msg.id, { read_by_user: true });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const tempMessage = newMessage;
    setNewMessage('');

    // Optimistic UI update
    const optimisticMsg = {
      id: 'temp-' + Date.now(),
      ticket_id: ticketId,
      sender_id: user.id,
      sender_role: user.role,
      body: tempMessage,
      attachments: [],
      created_at: new Date().toISOString(),
      read_by_admin: false
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await api.entities.TicketMessage.create({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: user.role,
        body: tempMessage,
        attachments: [],
        read_by_admin: false
      });

      await api.entities.Ticket.update(ticketId, {
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      await loadMessages();
      toast.success('✓ Gesendet');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t('support.chat.sendFailed'));
      setNewMessage(tempMessage);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleMarkSolved = async () => {
    try {
      setTicket({ ...ticket, status: 'solved' });
      await api.entities.Ticket.update(ticketId, { status: 'solved' });
      toast.success(t('support.chat.problemSolved'));
    } catch (error) {
      setTicket({ ...ticket, status: ticket.status });
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleCloseTicket = async () => {
    try {
      setTicket({ ...ticket, status: 'closed' });
      await api.entities.Ticket.update(ticketId, { status: 'closed' });
      toast.success(t('support.chat.ticketClosed'));
    } catch (error) {
      setTicket({ ...ticket, status: ticket.status });
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleReopenTicket = async () => {
    try {
      await api.entities.Ticket.update(ticketId, { status: 'open' });
      setTicket({ ...ticket, status: 'open' });
      toast.success(t('support.chat.ticketReopened'));
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="animate-spin w-12 h-12 border-4 rounded-full"
          style={{ borderColor: 'rgba(139, 92, 246, 0.3)', borderTopColor: '#8B5CF6' }}
        />
      </div>
    );
  }

  const isClosed = ticket.status === 'closed' || ticket.status === 'solved';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-4 py-4"
          style={{
            background: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
          }}
        >
          <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={() => navigate(createPageUrl('Support'))}
              className="flex items-center gap-2 transition-colors"
              style={{ color: 'rgba(255, 255, 255, 0.7)' }}
            >
              <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
              <span className="font-semibold">{t('common.back')}</span>
            </button>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusChip status={ticket.status} />
              {!isClosed && (
                <Button
                  onClick={handleMarkSolved}
                  size="sm"
                  style={{
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '1px solid rgba(52, 211, 153, 0.3)',
                    color: '#4ADE80'
                  }}
                >
                  <ThumbsUp className="w-4 h-4 me-1" />
                  {t('support.chat.problemSolved')}
                </Button>
              )}
              {ticket.status === 'solved' && (
                <Button
                  onClick={handleCloseTicket}
                  size="sm"
                  variant="outline"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  {t('support.chat.closeTicket')}
                </Button>
              )}
              {ticket.status === 'closed' && (
                <Button
                  onClick={handleReopenTicket}
                  size="sm"
                  style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
                >
                  {t('support.chat.reopenTicket')}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div
          className="px-4 py-6"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}
        >
          <h1 className="text-2xl font-black text-white mb-2">{ticket.subject}</h1>
          <div
            className={`flex items-center gap-4 text-sm flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ color: 'rgba(255, 255, 255, 0.5)' }}
          >
            <span>{t('support.form.category')}: {getCategoryLabel(ticket.category)}</span>
            <span>•</span>
            <span>#{ticket.id.slice(0, 8)}</span>
            {ticket.order_id && (
              <>
                <span>•</span>
                <span>{t('support.form.orderNumber')}: {ticket.order_id}</span>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isAdmin = msg.sender_role === 'admin';
              const isUserMessage = !isAdmin;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isUserMessage ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                >
                  <div
                    className="max-w-[80%] border rounded-2xl p-4 backdrop-blur-sm transition-all"
                    style={{
                      background: isAdmin ? 'rgba(59, 130, 246, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                      borderColor: isAdmin ? 'rgba(59, 130, 246, 0.3)' : 'rgba(139, 92, 246, 0.3)'
                    }}
                  >
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-bold text-white">
                        {isAdmin ? `🎧 ${t('support.chat.supportTeam')}` : `👤 ${t('support.chat.you')}`}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
                        {format(new Date(msg.created_at), 'dd.MM.yyyy HH:mm', { locale: dateLocale })}
                      </span>
                    </div>
                    <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{msg.body}</p>
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.attachments.map((att, i) => (
                          <a
                            key={i}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs transition-colors"
                            style={{ color: '#A78BFA' }}
                          >
                            <FileText className="w-4 h-4" />
                            {att.name}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {!isClosed && (
          <div
            className="sticky bottom-0 px-4 py-4"
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)'
            }}
          >
            {user?.role === 'admin' && (
              <div className="mb-3 px-1">
                <Select onValueChange={handleQuickReply}>
                  <SelectTrigger className="w-full md:w-[250px] bg-zinc-900/50 border-zinc-700 h-8 text-xs text-zinc-300">
                    <SelectValue placeholder="⚡ Quick Reply wählen..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {QUICK_REPLIES.map((reply, i) => (
                      <SelectItem key={i} value={reply.text} className="focus:bg-zinc-800 focus:text-white cursor-pointer text-xs">
                        <span className="font-bold text-purple-400 mr-2">[{reply.label}]</span>
                        {reply.text.substring(0, 30)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={t('support.chat.writeMessage')}
                rows={2}
                className="flex-1 resize-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF'
                }}
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
              >
                {sending ? (
                  <div
                    className="w-5 h-5 border-2 rounded-full animate-spin"
                    style={{ borderColor: 'rgba(255, 255, 255, 0.3)', borderTopColor: '#FFFFFF' }}
                  />
                ) : (
                  <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}