import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: 'other',
    subject: '',
    body: '',
    order_id: ''
  });
  const [attachments, setAttachments] = useState([]);
  const { toast } = useToast();

  const categories = [
    { value: 'order', label: 'Bestellung' },
    { value: 'payment', label: 'Zahlung' },
    { value: 'product', label: 'Produkt' },
    { value: 'return', label: 'Retoure' },
    { value: 'other', label: 'Sonstiges' }
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setAttachments(prev => [...prev, { url: file_url, name: file.name, type: file.type }]);
      } catch (error) {
        toast({ title: 'Fehler', description: 'Upload fehlgeschlagen', variant: 'destructive' });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.body) {
      toast({ title: 'Fehler', description: 'Bitte alle Pflichtfelder ausfüllen', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Check limit
      const openTickets = await base44.entities.Ticket.filter({
        user_id: user.id,
        status: { $in: ['open', 'in_progress'] }
      });

      if (openTickets.length >= 2 && !user.is_vip) {
        toast({ 
          title: 'Limit erreicht', 
          description: 'Du hast bereits 2 offene Tickets. Upgrade auf VIP für mehr.', 
          variant: 'destructive' 
        });
        onClose();
        onSuccess('LIMIT_REACHED');
        return;
      }

      // Create ticket
      const ticket = await base44.entities.Ticket.create({
        user_id: user.id,
        subject: formData.subject,
        category: formData.category,
        order_id: formData.order_id || null,
        status: 'open',
        priority: user.is_vip ? 'vip' : 'normal',
        last_message_at: new Date().toISOString(),
        unread_by_admin: true
      });

      // Create first message
      await base44.entities.TicketMessage.create({
        ticket_id: ticket.id,
        sender_id: user.id,
        sender_role: 'user',
        body: formData.body,
        attachments: attachments,
        read_by_admin: false
      });

      toast({ title: '✓ Ticket erstellt', description: 'Wir melden uns in Kürze' });
      onClose();
      onSuccess(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({ title: 'Fehler', description: 'Ticket konnte nicht erstellt werden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-zinc-900 to-black border-2 border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-white">Neues Ticket erstellen</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label className="text-zinc-300 font-semibold mb-2 block">Kategorie</Label>
            <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-zinc-300 font-semibold mb-2 block">Betreff *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              placeholder="Worum geht es?"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-zinc-300 font-semibold mb-2 block">Nachricht *</Label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({...formData, body: e.target.value})}
              placeholder="Beschreibe dein Anliegen..."
              rows={5}
              className="bg-white/5 border-white/10 text-white resize-none"
            />
          </div>

          <div>
            <Label className="text-zinc-300 font-semibold mb-2 block">Bestellnummer (optional)</Label>
            <Input
              value={formData.order_id}
              onChange={(e) => setFormData({...formData, order_id: e.target.value})}
              placeholder="z.B. #12345"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <Label className="text-zinc-300 font-semibold mb-2 block">Anhänge (optional)</Label>
            <label className="flex items-center justify-center gap-2 h-20 bg-white/5 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <Upload className="w-5 h-5 text-zinc-400" />
              <span className="text-sm text-zinc-400 font-medium">Dateien hochladen</span>
              <input type="file" multiple className="hidden" onChange={handleFileUpload} />
            </label>
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-300">{att.name}</span>
                    <button type="button" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}>
                      <X className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 bg-white/5 border-white/10">
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 font-black">
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Erstellen...</> : 'Ticket erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}