import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, User, Shield, Loader2, Image as ImageIcon, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/api';
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
      const msgs = await api.entities.TicketMessage.filter({ ticket_id: ticket.id }, 'created_at');
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (ticket.unread_by_user) {
      await api.entities.Ticket.update(ticket.id, { unread_by_user: false });
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
      created_at: new Date().toISOString(),
      pending: true
    };
    setMessages([...messages, tempMessage]);

    try {
      const msg = await api.entities.TicketMessage.create({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_role: 'user',
        body: messageText,
        read_by_user: true,
        read_by_admin: false
      });

      // Update ticket
      await api.entities.Ticket.update(ticket.id, {
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
      await api.entities.Ticket.update(ticket.id, { status: 'closed' });
      toast.success(t('support.chat.ticketClosed'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleMarkSolved = async () => {
    try {
      await api.entities.Ticket.update(ticket.id, { status: 'solved' });
      toast.success(t('support.chat.problemSolved'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  const handleReopenTicket = async () => {
    try {
      await api.entities.Ticket.update(ticket.id, { status: 'open' });
      toast.success(t('support.chat.ticketReopened'));
      onStatusChange?.();
    } catch (error) {
      toast.error(t('support.chat.sendFailed'));
    }
  };

  if (!ticket) return null;

  const statusConfig = getStatusConfig();
  const status = statusConfig[ticket.status];
  const isClosed = ticket.status === 'closed' || ticket.status === 'solved';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div 
        className="flex-shrink-0 p-4 border-b"
        style={{ 
          borderColor: 'rgba(255, 255, 255, 0.06)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button 
            onClick={onBack} 
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255, 255, 255, 0.05)' }}
          >
            <ArrowLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate">{ticket.subject}</h3>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Ticket #{ticket.id.slice(0, 8)}
            </p>
          </div>
          <Badge className={`${status.color} border`}>{status.label}</Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          {isClosed ? (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleReopenTicket} 
              className="text-xs"
              style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {t('support.chat.reopenTicket')}
            </Button>
          ) : (
            <>
              <Button 
                size="sm" 
                onClick={handleMarkSolved} 
                className="text-xs"
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.3)',
                  color: '#4ADE80'
                }}
              >
                <ThumbsUp className="w-3.5 h-3.5 me-1" />
                {t('support.chat.problemSolved')}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleCloseTicket} 
                className="text-xs"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.7)'
                }}
              >
                {t('support.chat.closeTicket')}
              </Button>
            </>
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
                    <p className={`text-xs mt-1 ${isUser ? (isRTL ? 'text-start ms-10' : 'text-end me-10') : (isRTL ? 'me-10' : 'ms-10')}`} style={{ color: 'rgba(255, 255, 255, 0.35)' }}>
                      {format(new Date(msg.created_at), 'dd.MM. HH:mm', { locale: dateLocale })}
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
        <form 
          onSubmit={handleSend} 
          className="flex-shrink-0 p-4 border-t"
          style={{
            borderColor: 'rgba(255, 255, 255, 0.06)',
            background: 'rgba(255, 255, 255, 0.02)'
          }}
        >
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('support.chat.writeMessage')}
              className="flex-1 h-12 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#FFFFFF'
              }}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              className="h-12 w-12 rounded-xl p-0"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
              }}
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}