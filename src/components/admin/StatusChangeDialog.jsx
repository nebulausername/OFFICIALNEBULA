import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function StatusChangeDialog({ 
  open, 
  onOpenChange, 
  request, 
  newStatus, 
  onConfirm,
  statusConfig 
}) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && newStatus) {
      loadTemplate();
    }
  }, [open, newStatus]);

  const loadTemplate = async () => {
    try {
      const templates = await api.entities.NotificationTemplate.filter({
        trigger_status: newStatus,
        is_active: true
      });

      if (templates.length > 0) {
        setTemplate(templates[0]);
        setMessage(templates[0].message_template);
      } else {
        // Default messages
        const defaults = {
          confirmed: '✅ Deine Bestellung wurde bestätigt!\n\nWir bearbeiten deine Anfrage und melden uns bald bei dir.\n\nBestellung: #{order_id}\nGesamtsumme: {total}€\n\n🌟 Nebula Supply',
          processing: '⚙️ Deine Bestellung wird bearbeitet!\n\nWir kümmern uns gerade um deine Artikel.\n\nBestellung: #{order_id}\n\n🌟 Nebula Supply',
          shipped: '🚚 Deine Bestellung wurde versandt!\n\nDein Paket ist unterwegs zu dir.\n\nBestellung: #{order_id}\nGesamtsumme: {total}€\n\n🌟 Nebula Supply',
          completed: '🎉 Bestellung abgeschlossen!\n\nVielen Dank für deinen Einkauf bei Nebula Supply!\n\nBestellung: #{order_id}\n\n🌟 Nebula Supply',
          cancelled: '❌ Bestellung storniert\n\nDeine Bestellung wurde storniert.\n\nBestellung: #{order_id}\n\nBei Fragen melde dich gerne!\n\n🌟 Nebula Supply'
        };
        setMessage(defaults[newStatus] || '');
      }
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  const replacePlaceholders = (text) => {
    if (!request) return text;

    return text
      .replace(/{customer_name}/g, request.contact_info?.name || 'Kunde')
      .replace(/{order_id}/g, request.id.slice(0, 8))
      .replace(/{total}/g, request.total_sum.toFixed(2));
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      // Update status
      await api.entities.Request.update(request.id, { status: newStatus });

      // Send notification via email (simulating Telegram)
      if (message.trim()) {
        const finalMessage = replacePlaceholders(message);
        
        try {
          await api.integrations.sendEmail({
            to: request.contact_info?.telegram || 'noreply@nebulasupply.com',
            subject: `📦 Status Update - Bestellung #${request.id.slice(0, 8)}`,
            body: finalMessage
          });
        } catch (notifError) {
          console.error('Notification error:', notifError);
        }
      }

      toast({
        title: '✓ Status aktualisiert',
        description: 'Kunde wurde benachrichtigt'
      });

      onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Fehler',
        description: 'Status konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!request || !newStatus) return null;

  const oldStatus = statusConfig[request.status];
  const targetStatus = statusConfig[newStatus];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl glass backdrop-blur-xl border-2 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Status ändern
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Change Preview */}
          <div className="flex items-center justify-center gap-4 p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl">
            <Badge className={`${oldStatus.color} border-2 px-4 py-2 text-base font-black`}>
              {oldStatus.label}
            </Badge>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-purple-400" />
            </motion.div>
            <Badge className={`${targetStatus.color} border-2 px-4 py-2 text-base font-black`}>
              {targetStatus.label}
            </Badge>
          </div>

          {/* Order Info */}
          <div className="p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 font-semibold">Bestellung:</span>
              <span className="font-bold text-zinc-100">#{request.id.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 font-semibold">Kunde:</span>
              <span className="font-bold text-zinc-100">{request.contact_info?.name || 'Unbekannt'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400 font-semibold">Telegram:</span>
              <span className="font-bold text-purple-400">{request.contact_info?.telegram || '--'}</span>
            </div>
          </div>

          {/* Message Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-bold text-zinc-200">Nachricht an Kunden</Label>
              <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                <Send className="w-3 h-3 mr-1" />
                Per Email
              </Badge>
            </div>

            <div className="p-3 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300 font-medium">
                <strong>Platzhalter:</strong> {'{customer_name}'}, {'{order_id}'}, {'{total}'}
              </div>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 font-mono text-sm"
              placeholder="Nachricht an den Kunden..."
            />

            {/* Preview */}
            {message && (
              <div className="p-4 bg-zinc-900/50 border-2 border-zinc-800 rounded-xl">
                <div className="text-xs font-bold text-zinc-400 mb-2">Vorschau:</div>
                <div className="text-sm text-zinc-100 whitespace-pre-wrap font-medium leading-relaxed">
                  {replacePlaceholders(message)}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 font-bold"
          >
            Abbrechen
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                />
                Sende...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Status ändern & Benachrichtigen
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}