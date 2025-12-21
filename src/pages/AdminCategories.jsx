import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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

export default function AdminCategories() {
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('department'); // 'department' or 'category'
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ name: '', sort_order: 0, department_id: '' });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [depts, cats] = await Promise.all([
        base44.entities.Department.list('sort_order'),
        base44.entities.Category.list('sort_order')
      ]);
      setDepartments(depts);
      setCategories(cats);
    } catch (error) {
      console.error('Error loading data:', error);
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
    try {
      const entity = dialogType === 'department' ? 'Department' : 'Category';
      if (editing) {
        await base44.entities[entity].update(editing.id, formData);
        toast({ title: 'Gespeichert', description: `${dialogType === 'department' ? 'Department' : 'Kategorie'} aktualisiert` });
      } else {
        await base44.entities[entity].create(formData);
        toast({ title: 'Erstellt', description: `${dialogType === 'department' ? 'Department' : 'Kategorie'} erstellt` });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      const entity = type === 'department' ? 'Department' : 'Category';
      await base44.entities[entity].delete(id);
      toast({ title: 'Gelöscht' });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Kategorien & Departments</h1>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="categories">Kategorien</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <div className="flex items-center justify-between mb-6">
            <p className="text-zinc-400">{departments.length} Departments</p>
            <Button onClick={() => handleNew('department')} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-5 h-5 mr-2" />
              Neues Department
            </Button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Reihenfolge</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.sort_order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(dept, 'department')}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(dept.id, 'department')}
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
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <div className="flex items-center justify-between mb-6">
            <p className="text-zinc-400">{categories.length} Kategorien</p>
            <Button onClick={() => handleNew('category')} className="bg-gradient-to-r from-purple-500 to-pink-500">
              <Plus className="w-5 h-5 mr-2" />
              Neue Kategorie
            </Button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Reihenfolge</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => {
                  const dept = departments.find(d => d.id === cat.department_id);
                  return (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{dept?.name || '-'}</TableCell>
                      <TableCell>{cat.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(cat, 'category')}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(cat.id, 'category')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Bearbeiten' : 'Neu'} - {dialogType === 'department' ? 'Department' : 'Kategorie'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name..."
              />
            </div>

            {dialogType === 'category' && (
              <div>
                <Label>Department</Label>
                <Select value={formData.department_id} onValueChange={(val) => setFormData({ ...formData, department_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Reihenfolge</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
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