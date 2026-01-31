import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save, FolderTree, Tag, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminCategories() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('department'); // 'department' or 'category'
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', sort_order: 0, department_id: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depts, cats] = await Promise.all([
        api.entities.Department.list('sort_order'),
        api.entities.Category.list('sort_order')
      ]);
      setDepartments(depts);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Fehler', description: 'Daten konnten nicht geladen werden', variant: 'destructive' });
    }
  };

  const handleNew = (type) => {
    setDialogType(type);
    setEditing(null);
    setFormData({ name: '', sort_order: 0, department_id: '' });
    setDialogOpen(true);
  };

  const handleEdit = (item, type) => {
    setDialogType(type);
    setEditing(item);
    setFormData({
      name: item.name || '',
      sort_order: item.sort_order || 0,
      department_id: item.department_id || ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      const entity = dialogType === 'department' ? 'Department' : 'Category';
      if (editing) {
        await api.entities[entity].update(editing.id, formData);
        toast({ title: 'Gespeichert', description: `${dialogType === 'department' ? 'Department' : 'Kategorie'} aktualisiert`, className: 'bg-green-500 text-white border-none' });
      } else {
        await api.entities[entity].create(formData);
        toast({ title: 'Erstellt', description: `${dialogType === 'department' ? 'Department' : 'Kategorie'} erstellt`, className: 'bg-green-500 text-white border-none' });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id, type) => {
    // For now, using confirm but marked for upgrade if user asks for custom dialog
    if (!window.confirm('Wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) return;

    setIsDeleting(id);
    try {
      const entity = type === 'department' ? 'Department' : 'Category';
      await api.entities[entity].delete(id);
      toast({ title: 'Gelöscht', description: 'Eintrag wurde entfernt' });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
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
            Taxonomy
          </h1>
          <p className="text-zinc-400 text-lg">Verwalte die Struktur deines Shops</p>
        </div>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="mb-8 w-full max-w-md mx-auto grid grid-cols-2 bg-zinc-900/50 p-1 border border-zinc-800 rounded-xl">
          <TabsTrigger
            value="departments"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 py-3 rounded-lg transition-all"
          >
            <FolderTree className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-zinc-400 py-3 rounded-lg transition-all"
          >
            <Tag className="w-4 h-4 mr-2" />
            Kategorien
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          {/* Departments Tab */}
          <TabsContent value="departments" className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-500 font-medium text-sm border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">{departments.length} Einträge</span>
              <Button onClick={() => handleNew('department')} className="bg-white text-black hover:bg-zinc-200 font-bold px-6 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Neues Department
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={dept.id}
                  className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-purple-500/20 transition-colors">
                      <FolderTree className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(dept, 'department')} className="h-8 w-8 hover:bg-zinc-800 rounded-lg">
                        <Pencil className="w-4 h-4 text-zinc-400 hover:text-white" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id, 'department')} disabled={isDeleting === dept.id} className="h-8 w-8 hover:bg-red-500/20 rounded-lg">
                        {isDeleting === dept.id ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-400" />}
                      </Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">{dept.name}</h3>
                  <p className="text-zinc-500 text-sm font-medium">Sortierung: {dept.sort_order}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="mt-0">
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-500 font-medium text-sm border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">{categories.length} Einträge</span>
              <Button onClick={() => handleNew('category')} className="bg-white text-black hover:bg-zinc-200 font-bold px-6 rounded-xl shadow-lg shadow-white/5 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5 mr-2" />
                Neue Kategorie
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categories.map((cat, i) => {
                const dept = departments.find(d => d.id === cat.department_id);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={cat.id}
                    className="group relative bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
                  >
                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(cat, 'category')} className="h-7 w-7 hover:bg-zinc-800 rounded-lg bg-black/50 backdrop-blur-sm">
                        <Pencil className="w-3.5 h-3.5 text-zinc-300 hover:text-white" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id, 'category')} disabled={isDeleting === cat.id} className="h-7 w-7 hover:bg-red-500/20 rounded-lg bg-black/50 backdrop-blur-sm">
                        {isDeleting === cat.id ? <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> : <Trash2 className="w-3.5 h-3.5 text-zinc-300 hover:text-red-400" />}
                      </Button>
                    </div>

                    <div className="mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-900/80 px-2 py-1 rounded-md border border-zinc-800">
                        {dept?.name || 'Kein Dept'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors leading-tight">{cat.name}</h3>

                    <div className="flex items-center text-zinc-500 text-xs font-medium">
                      <ArrowRight className="w-3 h-3 mr-1 opacity-50" />
                      Index: {cat.sort_order}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-white flex items-center gap-2">
              {dialogType === 'department' ? <FolderTree className="w-6 h-6 text-purple-500" /> : <Tag className="w-6 h-6 text-cyan-500" />}
              {editing ? 'Bearbeiten' : 'Erstellen'}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {dialogType === 'department' ? 'Lege den Hauptbereich fest.' : 'Kategorisiere deine Produkte.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label className="text-zinc-300 font-bold">Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bezeichnung..."
                className="bg-zinc-900 border-zinc-800 text-white focus:ring-purple-500/20 focus:border-purple-500/50 transition-all h-11"
              />
            </div>

            {dialogType === 'category' && (
              <div className="grid gap-2">
                <Label className="text-zinc-300 font-bold">Department</Label>
                <Select value={formData.department_id} onValueChange={(val) => setFormData({ ...formData, department_id: val })}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white h-11">
                    <SelectValue placeholder="Wähle ein Department..." />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id} className="focus:bg-zinc-800 cursor-pointer">{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label className="text-zinc-300 font-bold">Sortier-Reihenfolge</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                className="bg-zinc-900 border-zinc-800 text-white focus:ring-purple-500/20 h-11"
              />
            </div>
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