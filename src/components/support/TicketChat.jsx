import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, ArrowLeft, CheckCircle, XCircle, User, Shield, Loader2, Image as ImageIcon, ThumbsUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { de, enUS, sk, ar } from 'date-fns/locale';
import { useI18n } from '../i18n/I18nProvider';

export default function TicketChat({ ticket, onBack, userId, onStatusChange }) {
  const { t, locale, isRTL } = useI18n();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  const localeMap = { de, en: enUS, sk, ar };
  const dateLocale = localeMap[locale] || de;
  
  const getStatusConfig = () => ({
    open: { label: t('support.status.open'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    in_progress: { label: t('support.status.inProgress'), color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    solved: { label: t('support.status.solved'), color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    closed: { label: t('support.status.closed'), color: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30' }
  });

  useEffect(() => {
    if (ticket) {
      loadMessages();
      markAsRead();
    }
  }, [ticket?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const msgs = await base44.entities.TicketMessage.filter({ ticket_id: ticket.id }, 'created_date');
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (ticket.unread_by_user) {
      await base44.entities.Ticket.update(ticket.id, { unread_by_user: false });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage;
    setNewMessage('');
    setSending(true);

    // Optimistic update
    const tempMessage = {
      id: 'temp-' + Date.now(),
      ticket_id: ticket.id,
      sender_id: userId,
      sender_role: 'user',
      body: messageText,
      created_date: new Date().toISOString(),
      pending: true
    };
    setMessages([...messages, tempMessage]);

    try {
      const msg = await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_role: 'user',
        body: messageText,
        read_by_user: true,
        read_by_admin: false
      });

      // Update ticket
      await base44.entities.Ticket.update(ticket.id, {
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      // Replace temp message
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? msg : m));
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleCloseTicket = async () => {
    try {
      await base44.entities.Ticket.update(ticket.id, { status: 'closed' });
      toast.success(t('support.chat.ticketClosed'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleMarkSolved = async () => {
    try {
      await base44.entities.Ticket.update(ticket.id, { status: 'solved' });
      toast.success(t('support.chat.problemSolved'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleReopenTicket = async () => {
    try {
      await base44.entities.Ticket.update(ticket.id, { status: 'open' });
      toast.success(t('support.chat.ticketReopened'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  if (!ticket) return null;

  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === 'closed' || ticket.status === 'solved';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/[0.06] bg-white/[0.02]">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="lg:hidden w-9 h-9 bg-white/[0.05] rounded-xl flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate">{ticket.subject}</h3>
            <p className="text-zinc-500 text-xs">Ticket #{ticket.id.slice(0, 8)}</p>
          </div>
          <Badge className={`${status.color} border`}>{status.label}</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {isClosed ? (
            <Button size="sm" variant="outline" onClick={handleReopenTicket} className="text-xs bg-transparent border-white/10 text-zinc-300 hover:bg-white/5">
              Erneut öffnen
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={handleCloseTicket} className="text-xs bg-transparent border-white/10 text-zinc-300 hover:bg-white/5">
              Ticket schließen
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, i) => {
              const isUser = msg.sender_role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isUser 
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                          : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                      }`}>
                        {isUser ? <User className="w-4 h-4 text-white" /> : <Shield className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`px-4 py-3 rounded-2xl ${
                        isUser 
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20' 
                          : 'bg-white/[0.05] border border-white/[0.08]'
                      } ${msg.pending ? 'opacity-60' : ''}`}>
                        <p className="text-white text-sm whitespace-pre-wrap">{msg.body}</p>
                        {msg.attachments?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {msg.attachments.map((att, j) => (
                              <a key={j} href={att.url} target="_blank" rel="noopener noreferrer" 
                                className="flex items-center gap-1 px-2 py-1 bg-white/[0.05] rounded-lg text-xs text-zinc-300 hover:bg-white/[0.1]">
                                <ImageIcon className="w-3 h-3" />
                                {att.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className={`text-xs text-zinc-600 mt-1 ${isUser ? 'text-right mr-10' : 'ml-10'}`}>
                      {format(new Date(msg.created_date), 'dd.MM. HH:mm', { locale: de })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isClosed && (
        <form onSubmit={handleSend} className="flex-shrink-0 p-4 border-t border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Nachricht schreiben..."
              className="flex-1 h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 rounded-xl p-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}