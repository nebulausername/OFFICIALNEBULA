import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function AdminNotificationTemplates() {
  const [templates, setTemplates] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger_status: 'confirmed',
    message_template: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await api.entities.NotificationTemplate.list();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const statusOptions = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-400' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-400' },
    shipped: { label: 'Versandt', color: 'bg-indigo-500/20 text-indigo-400' },
    completed: { label: 'Abgeschlossen', color: 'bg-green-500/20 text-green-400' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-400' }
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      trigger_status: 'confirmed',
      message_template: '',
      is_active: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      trigger_status: template.trigger_status,
      message_template: template.message_template,
      is_active: template.is_active
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await api.entities.NotificationTemplate.update(editingTemplate.id, formData);
        toast({ title: '✓ Vorlage aktualisiert' });
      } else {
        await api.entities.NotificationTemplate.create(formData);
        toast({ title: '✓ Vorlage erstellt' });
      }
      setDialogOpen(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ 
        title: 'Fehler', 
        description: 'Vorlage konnte nicht gespeichert werden',
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Vorlage wirklich löschen?')) return;
    
    try {
      await api.entities.NotificationTemplate.delete(id);
      toast({ title: '🗑️ Vorlage gelöscht' });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ 
        title: 'Fehler', 
        description: 'Vorlage konnte nicht gelöscht werden',
        variant: 'destructive' 
      });
    }
  };

  const handleToggleActive = async (template) => {
    try {
      await api.entities.NotificationTemplate.update(template.id, {
        is_active: !template.is_active
      });
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
            Benachrichtigungsvorlagen
          </h1>
          <p className="text-zinc-300 text-lg font-semibold flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-400" />
            {templates.length} Vorlagen konfiguriert
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Neue Vorlage
        </Button>
      </div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-5 bg-blue-500/10 border-2 border-blue-500/30 rounded-2xl"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-blue-300 mb-2 text-lg">Verwendbare Platzhalter</h3>
            <div className="text-sm text-blue-200 space-y-1 font-medium">
              <p><code className="bg-blue-500/20 px-2 py-0.5 rounded">{'{customer_name}'}</code> - Name des Kunden</p>
              <p><code className="bg-blue-500/20 px-2 py-0.5 rounded">{'{order_id}'}</code> - Bestellnummer (gekürzt)</p>
              <p><code className="bg-blue-500/20 px-2 py-0.5 rounded">{'{total}'}</code> - Gesamtsumme der Bestellung</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {templates.map((template, index) => {
          const statusInfo = statusOptions[template.trigger_status];
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-6 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all relative overflow-hidden group"
            >
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-zinc-100 mb-2">{template.name}</h3>
                    <Badge className={`${statusInfo.color} border-2 font-bold`}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() => handleToggleActive(template)}
                    />
                  </div>
                </div>

                {/* Message Preview */}
                <div className="p-4 bg-zinc-900/50 border-2 border-zinc-800 rounded-xl mb-4">
                  <div className="text-xs font-bold text-zinc-400 mb-2">Nachricht:</div>
                  <div className="text-sm text-zinc-200 line-clamp-4 whitespace-pre-wrap font-medium">
                    {template.message_template}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                    className="flex-1 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 hover:border-purple-500/50 font-bold"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                    className="bg-zinc-900 border-zinc-700 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Active Indicator */}
                {!template.is_active && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="border-zinc-600 text-zinc-500 text-xs">
                      Inaktiv
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {templates.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20 glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Mail className="w-12 h-12 text-zinc-600" />
          </div>
          <h3 className="text-2xl font-black mb-3">Keine Vorlagen</h3>
          <p className="text-zinc-400 mb-8">Erstelle deine erste Benachrichtigungsvorlage</p>
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Vorlage erstellen
          </Button>
        </motion.div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl glass backdrop-blur-xl border-2 border-zinc-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {editingTemplate ? 'Vorlage bearbeiten' : 'Neue Vorlage'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4">
            <div>
              <Label className="text-base font-bold text-zinc-200 mb-2">Name der Vorlage</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="z.B. Bestellung bestätigt"
                className="h-12 bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 text-base font-medium"
              />
            </div>

            <div>
              <Label className="text-base font-bold text-zinc-200 mb-2">Auslösender Status</Label>
              <Select
                value={formData.trigger_status}
                onValueChange={(val) => setFormData({ ...formData, trigger_status: val })}
              >
                <SelectTrigger className="h-12 bg-zinc-900/50 border-2 border-zinc-700 font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-700">
                  {Object.entries(statusOptions).map(([key, info]) => (
                    <SelectItem key={key} value={key} className="font-bold">
                      {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-base font-bold text-zinc-200 mb-2">Nachrichtenvorlage</Label>
              <Textarea
                value={formData.message_template}
                onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                rows={10}
                placeholder="Deine Nachricht an den Kunden..."
                className="bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 mt-2 font-medium">
                Verwende {'{customer_name}'}, {'{order_id}'}, {'{total}'} als Platzhalter
              </p>
            </div>

            <div className="flex items-center justify-between p-4 glass backdrop-blur border-2 border-zinc-700 rounded-xl">
              <div>
                <Label className="text-base font-bold text-zinc-200">Aktiv</Label>
                <p className="text-sm text-zinc-400 font-medium">Vorlage wird automatisch verwendet</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(val) => setFormData({ ...formData, is_active: val })}
              />
            </div>
          </div>

          <DialogFooter className="gap-3">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="bg-zinc-900 border-zinc-700 hover:bg-zinc-800 font-bold"
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {editingTemplate ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}