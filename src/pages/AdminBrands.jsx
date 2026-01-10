import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '', sort_order: 0 });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const brds = await base44.entities.Brand.list('sort_order');
      setBrands(brds);
    } catch (error) {
      console.error('Error loading brands:', error);
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
    try {
      if (editing) {
        await base44.entities.Brand.update(editing.id, formData);
        toast({ title: 'Gespeichert', description: 'Marke aktualisiert' });
      } else {
        await base44.entities.Brand.create(formData);
        toast({ title: 'Erstellt', description: 'Neue Marke erstellt' });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving brand:', error);
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await base44.entities.Brand.delete(id);
      toast({ title: 'Gelöscht' });
      loadData();
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
            Marken
          </h1>
          <p className="text-zinc-300 text-lg font-medium">{brands.length} Marken insgesamt</p>
        </div>
        <Button onClick={handleNew} className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:shadow-xl hover:shadow-purple-500/50 h-12 px-6 font-bold">
          <Plus className="w-5 h-5 mr-2" />
          Neue Marke
        </Button>
      </div>

      <div className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-zinc-300 font-bold">Name</TableHead>
              <TableHead className="text-zinc-300 font-bold">Logo URL</TableHead>
              <TableHead className="text-zinc-300 font-bold">Reihenfolge</TableHead>
              <TableHead className="text-right text-zinc-300 font-bold">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-bold text-white text-base">{brand.name}</TableCell>
                <TableCell className="text-sm text-zinc-300 truncate max-w-xs font-medium">
                  {brand.logo_url || '-'}
                </TableCell>
                <TableCell className="text-zinc-300 font-medium">{brand.sort_order}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(brand)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-2 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl font-black">
              {editing ? '✏️ Marke bearbeiten' : '✨ Neue Marke'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-zinc-300 font-bold">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Markenname..."
                className="text-white font-medium"
              />
            </div>

            <div>
              <Label className="text-zinc-300 font-bold">Logo URL</Label>
              <Input
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://..."
                className="text-white font-medium"
              />
            </div>

            <div>
              <Label className="text-zinc-300 font-bold">Reihenfolge</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                className="text-white font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}