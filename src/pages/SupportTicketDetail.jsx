import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Paperclip, FileText, Image as ImageIcon, X, CheckCircle, ThumbsUp } from 'lucide-react';
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
      const userData = await base44.auth.me();
      setUser(userData);

      const tickets = await base44.entities.Ticket.filter({ id: ticketId });
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
        await base44.entities.Ticket.update(ticketId, { unread_by_user: false });
      }

      await loadMessages();
    } catch (error) {
      console.error('Error loading ticket:', error);
      toast({ title: 'Fehler', description: 'Laden fehlgeschlagen', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await base44.entities.TicketMessage.filter(
        { ticket_id: ticketId },
        'created_date'
      );
      setMessages(msgs);

      // Mark messages as read
      const unreadMsgs = msgs.filter(m => m.sender_role === 'admin' && !m.read_by_user);
      for (const msg of unreadMsgs) {
        await base44.entities.TicketMessage.update(msg.id, { read_by_user: true });
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
      created_date: new Date().toISOString(),
      read_by_admin: false
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      await base44.entities.TicketMessage.create({
        ticket_id: ticketId,
        sender_id: user.id,
        sender_role: user.role,
        body: tempMessage,
        attachments: [],
        read_by_admin: false
      });

      await base44.entities.Ticket.update(ticketId, {
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      await loadMessages();
      toast({ title: '✓ Gesendet', duration: 1500 });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ title: 'Fehler', description: 'Nachricht konnte nicht gesendet werden', variant: 'destructive' });
      setNewMessage(tempMessage);
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id));
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      setTicket({ ...ticket, status: 'closed' });
      await base44.entities.Ticket.update(ticketId, { status: 'closed' });
      toast({ title: '✓ Ticket geschlossen', description: 'Du kannst es jederzeit wieder öffnen', duration: 2000 });
    } catch (error) {
      setTicket({ ...ticket, status: ticket.status });
      toast({ title: 'Fehler', description: 'Aktion fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleReopenTicket = async () => {
    try {
      await base44.entities.Ticket.update(ticketId, { status: 'open' });
      setTicket({ ...ticket, status: 'open' });
      toast({ title: '✓ Ticket wiedereröffnet' });
    } catch (error) {
      toast({ title: 'Fehler', description: 'Aktion fehlgeschlagen', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12] flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a12] via-[#14141f] to-[#0a0a12]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/40 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(createPageUrl('Support'))}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Zurück</span>
            </button>
            <div className="flex items-center gap-3">
              <StatusChip status={ticket.status} />
              {ticket.status === 'solved' && (
                <Button onClick={handleCloseTicket} size="sm" variant="outline" className="bg-white/5">
                  Schließen
                </Button>
              )}
              {ticket.status === 'closed' && (
                <Button onClick={handleReopenTicket} size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500">
                  Erneut öffnen
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="px-4 py-6 border-b border-white/[0.06]">
          <h1 className="text-2xl font-black text-white mb-2">{ticket.subject}</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span>Kategorie: {getCategoryLabel(ticket.category)}</span>
            <span>•</span>
            <span>#{ticket.id.slice(0, 8)}</span>
            {ticket.order_id && (
              <>
                <span>•</span>
                <span>Bestellung: {ticket.order_id}</span>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="px-4 py-6 space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto">
          <AnimatePresence>
            {messages.map((msg, index) => {
              const isAdmin = msg.sender_role === 'admin';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] ${isAdmin ? 'bg-blue-500/15 border-blue-400/30' : 'bg-purple-500/15 border-purple-400/30'} border rounded-2xl p-4 backdrop-blur-sm transition-all hover:border-opacity-50`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white">
                        {isAdmin ? '🎧 Support Team' : '👤 Du'}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {format(new Date(msg.created_date), 'dd.MM.yyyy HH:mm', { locale: de })}
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
                            className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300"
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
        {ticket.status !== 'closed' && (
          <div className="sticky bottom-0 bg-black/40 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nachricht schreiben..."
                rows={2}
                className="flex-1 bg-white/[0.03] border-white/[0.1] text-white resize-none"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-gradient-to-r from-purple-500 to-pink-500 px-6"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </form>
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