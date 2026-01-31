import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save, ShoppingBag, Globe, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '', sort_order: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const brds = await api.entities.Brand.list('sort_order');
      setBrands(brds);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast({ title: 'Fehler', description: 'Marken konnten nicht geladen werden', variant: 'destructive' });
    }
  };

  const handleNew = () => {
    setEditing(null);
    setFormData({ name: '', logo_url: '', sort_order: 0 });
    setDialogOpen(true);
  };

  const handleEdit = (brand) => {
    setEditing(brand);
    setFormData({
      name: brand.name || '',
      logo_url: brand.logo_url || '',
      sort_order: brand.sort_order || 0
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      if (editing) {
        await api.entities.Brand.update(editing.id, formData);
        toast({ title: 'Gespeichert', description: 'Marke aktualisiert', className: 'bg-green-500 text-white border-none' });
      } else {
        await api.entities.Brand.create(formData);
        toast({ title: 'Erstellt', description: 'Neue Marke erstellt', className: 'bg-green-500 text-white border-none' });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Marke wirklich löschen?')) return;

    setIsDeleting(id);
    try {
      await api.entities.Brand.delete(id);
      toast({ title: 'Gelöscht', description: 'Marke wurde entfernt' });
      loadData();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2">
            Marken
          </h1>
          <p className="text-zinc-400 text-lg">Partner und Hersteller verwalten</p>
        </div>
        <Button onClick={handleNew} className="bg-white text-black hover:bg-zinc-200 font-bold px-6 py-6 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95 text-lg">
          <Plus className="w-6 h-6 mr-2" />
          Neue Marke
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {brands.map((brand, i) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 mb-4 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden ring-4 ring-zinc-900 shadow-xl group-hover:ring-purple-500/20 transition-all">
                {brand.logo_url ? (
                  <img src={brand.logo_url} alt={brand.name} className="w-full h-full object-cover" onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-zinc-600 group-hover:text-white transition-colors" />
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">{brand.name}</h3>

              <div className="flex items-center text-zinc-500 text-xs font-medium mb-6">
                Sortierung: {brand.sort_order}
              </div>

              <div className="flex gap-2 w-full mt-auto">
                <Button variant="outline" className="flex-1 bg-zinc-900/50 border-zinc-700 hover:bg-white hover:text-black hover:border-white transition-all" onClick={() => handleEdit(brand)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" className="flex-1 bg-zinc-900/50 border-zinc-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all" onClick={() => handleDelete(brand.id)} disabled={isDeleting === brand.id}>
                  {isDeleting === brand.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add New Card Stub */}
        <motion.div
          onClick={handleNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="cursor-pointer border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[300px] text-zinc-600 hover:text-zinc-400 hover:bg-zinc-900/20 transition-all"
        >
          <Plus className="w-12 h-12 mb-4 opacity-50" />
          <span className="font-bold text-lg">Neue Marke</span>
        </motion.div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-purple-500" />
              {editing ? 'Marke bearbeiten' : 'Neue Marke'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              Füge Logos und Details deiner Partner hinzu.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-zinc-300 font-bold">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Markenname..."
                className="bg-zinc-900 border-zinc-800 text-white focus:ring-purple-500/20 focus:border-purple-500/50 transition-all h-11"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300 font-bold">Logo URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white focus:ring-purple-500/20 h-11"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300 font-bold">Sortier-Reihenfolge</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-zinc-900 border-zinc-800 text-white focus:ring-purple-500/20 h-11"
              />
            </div>

            {formData.logo_url && (
              <div className="flex justify-center p-4 bg-zinc-900 rounded-lg border border-zinc-800">
                <img src={formData.logo_url} alt="Preview" className="h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="hover:bg-zinc-900 text-zinc-400 hover:text-white">
              Abbrechen
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !formData.name.trim()} className="bg-white text-black hover:bg-zinc-200 font-bold min-w-[100px]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}