import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

const categories = [
  { value: 'order', label: 'Bestellung' },
  { value: 'payment', label: 'Zahlung' },
  { value: 'product', label: 'Produkt' },
  { value: 'return', label: 'Retoure' },
  { value: 'other', label: 'Sonstiges' }
];

export default function CreateTicketModal({ isOpen, onClose, onSuccess, userId, isVip }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    category: 'other',
    subject: '',
    message: '',
    orderId: ''
  });
  const [attachments, setAttachments] = useState([]);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      toast({ title: 'Fehler', description: 'Bitte alle Pflichtfelder ausfüllen', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Create ticket
      const ticket = await base44.entities.Ticket.create({
        user_id: userId,
        subject: form.subject,
        category: form.category,
        order_id: form.orderId || null,
        priority: isVip ? 'vip' : 'normal',
        last_message_at: new Date().toISOString(),
        unread_by_admin: true,
        unread_by_user: false
      });

      // Create first message
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        sender_id: userId,
        sender_role: 'user',
        body: form.message,
        attachments: attachments,
        read_by_user: true,
        read_by_admin: false
      });

      toast({ title: '✓ Ticket erstellt', description: 'Wir melden uns bald bei dir' });
      setForm({ category: 'other', subject: '', message: '', orderId: '' });
      setAttachments([]);
      onSuccess?.(ticket);
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({ title: 'Fehler', description: 'Ticket konnte nicht erstellt werden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setAttachments([...attachments, { url: file_url, name: file.name, type: file.type }]);
    } catch (error) {
      toast({ title: 'Upload fehlgeschlagen', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-3xl max-w-lg p-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
        
        <DialogHeader className="p-6 pb-0 relative">
          <DialogTitle className="text-xl font-black text-white">Neues Ticket erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-5 relative">
          <div>
            <Label className="text-zinc-300 text-sm font-semibold mb-2 block">Kategorie</Label>
            <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
              <SelectTrigger className="h-12 bg-white/[0.03] border-white/[0.1] text-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-300 text-sm font-semibold mb-2 block">Betreff *</Label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({...form, subject: e.target.value})}
              placeholder="Kurze Beschreibung..."
              className="h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl focus:border-purple-400/60"
            />
          </div>

          <div>
            <Label className="text-zinc-300 text-sm font-semibold mb-2 block">Bestellnummer (optional)</Label>
            <Input
              value={form.orderId}
              onChange={(e) => setForm({...form, orderId: e.target.value})}
              placeholder="z.B. #12345"
              className="h-12 bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl focus:border-purple-400/60"
            />
          </div>

          <div>
            <Label className="text-zinc-300 text-sm font-semibold mb-2 block">Nachricht *</Label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
              placeholder="Beschreibe dein Anliegen..."
              className="min-h-[120px] bg-white/[0.03] border-white/[0.1] text-white placeholder:text-zinc-500 rounded-xl resize-none focus:border-purple-400/60"
            />
          </div>

          {/* Attachments */}
          <div>
            <Label className="text-zinc-300 text-sm font-semibold mb-2 block">Anhänge</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((att, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-zinc-300">
                  <span className="truncate max-w-[120px]">{att.name}</span>
                  <button type="button" onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}>
                    <X className="w-3 h-3 text-zinc-400 hover:text-white" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border border-dashed border-white/[0.15] rounded-xl cursor-pointer hover:bg-white/[0.05] transition-colors">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-sm text-zinc-400">Datei hochladen</span>
              <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:shadow-xl hover:shadow-purple-500/40 font-black text-base rounded-xl"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Erstellen...</>
            ) : (
              <><Send className="w-5 h-5 mr-2" /> Ticket erstellen</>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}