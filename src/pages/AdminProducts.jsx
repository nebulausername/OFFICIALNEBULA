import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InlineEditableField from '../components/admin/InlineEditableField';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save, X, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import DataTable from '@/components/admin/ui/DataTable';
import { createPageUrl } from '@/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    price: 0,
    currency: 'EUR',
    department_id: '',
    category_id: '',
    brand_id: '',
    in_stock: true,
    tags: [],
    cover_image: ''
  });
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [prods, depts, cats, brds] = await Promise.all([
        api.entities.Product.list('-created_at'),
        api.entities.Department.list('sort_order'),
        api.entities.Category.list('sort_order'),
        api.entities.Brand.list('sort_order')
      ]);
      setProducts(prods);
      setDepartments(depts);
      setCategories(cats);
      setBrands(brds);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || 0,
      currency: product.currency || 'EUR',
      department_id: product.department_id || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      in_stock: product.in_stock !== false,
      tags: product.tags || [],
      cover_image: product.cover_image || ''
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setFormData({
      sku: '',
      name: '',
      description: '',
      price: 0,
      currency: 'EUR',
      department_id: '',
      category_id: '',
      brand_id: '',
      in_stock: true,
      tags: [],
      cover_image: ''
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await api.entities.Product.update(editingProduct.id, formData);
        toast({ title: 'Gespeichert', description: 'Produkt wurde aktualisiert' });
      } else {
        await api.entities.Product.create(formData);
        toast({ title: 'Erstellt', description: 'Neues Produkt wurde erstellt' });
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({ title: 'Fehler', description: 'Speichern fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Wirklich löschen?')) return;
    try {
      await api.entities.Product.delete(id);
      toast({ title: 'Gelöscht', description: 'Produkt wurde gelöscht' });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({ title: 'Fehler', description: 'Löschen fehlgeschlagen', variant: 'destructive' });
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleInlineUpdate = async (productId, field, value) => {
    try {
      await api.entities.Product.update(productId, { [field]: value });
      setProducts(products.map(p => p.id === productId ? { ...p, [field]: value } : p));
      toast({
        title: '✨ Gespeichert',
        description: 'Änderung wurde übernommen'
      });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Änderung konnte nicht gespeichert werden',
        variant: 'destructive'
      });
    }
  };

  const columns = [
    {
      header: 'SKU',
      accessorKey: 'sku',
      sortable: true,
      cell: (row) => <span className="font-mono text-purple-400 text-sm">{row.sku}</span>
    },
    {
      header: 'Name',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <InlineEditableField
          value={row.name}
          onSave={(value) => handleInlineUpdate(row.id, 'name', value)}
          className="font-medium"
        />
      )
    },
    {
      header: 'Preis',
      accessorKey: 'price',
      sortable: true,
      cell: (row) => (
        <InlineEditableField
          value={row.price}
          type="number"
          onSave={(value) => handleInlineUpdate(row.id, 'price', parseFloat(value))}
          className="text-purple-400 font-bold"
        />
      )
    },
    {
      header: 'Kategorie',
      accessorKey: 'category_id',
      sortable: true,
      cell: (row) => {
        const cat = categories.find(c => c.id === row.category_id);
        return <span className="text-zinc-400 text-sm">{cat ? cat.name : '-'}</span>
      }
    },
    {
      header: 'Marke',
      accessorKey: 'brand_id',
      sortable: true,
      cell: (row) => {
        const brand = brands.find(b => b.id === row.brand_id);
        return <span className="text-zinc-400 text-sm">{brand ? brand.name : '-'}</span>
      }
    },
    {
      header: 'Status',
      accessorKey: 'in_stock',
      sortable: true,
      cell: (row) => (
        <button
          onClick={() => handleInlineUpdate(row.id, 'in_stock', !row.in_stock)}
          className="group"
        >
          {row.in_stock ? (
            <span className="text-green-400 group-hover:text-green-300 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              Verfügbar
            </span>
          ) : (
            <span className="text-red-400 group-hover:text-red-300 transition-colors flex items-center gap-1">
              <span className="w-2 h-2 bg-red-400 rounded-full" />
              Ausverkauft
            </span>
          )}
        </button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Produkte verwalten
          </h1>
          <p className="text-zinc-400 text-lg">
            {products.length} Produkte • <span className="text-purple-400">Echtzeit-Bearbeitung</span> aktiviert
          </p>
        </div>
        <Button onClick={handleNew} className="bg-gradient-to-r from-purple-500 to-pink-500">
          <Plus className="w-5 h-5 mr-2" />
          Neues Produkt
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Produktname, SKU..."
          filters={[
            { label: 'Kategorie', value: 'category' } // Needs implementation in DataTable eventually
          ]}
          actions={[
            { label: 'Bearbeiten', icon: Pencil, onClick: (row) => window.location.href = createPageUrl('AdminProductEditor') + `?id=${row.id}` },
            { label: 'Schnellbearbeitung', icon: Pencil, onClick: handleEdit }, // Opens modal
            { label: 'Löschen', icon: Trash2, onClick: (row) => handleDelete(row.id) },
          ]}
        />
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          <DialogHeader className="pb-4 border-b-2 border-zinc-700">
            <DialogTitle className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              {editingProduct ? '✏️ Produkt bearbeiten' : '✨ Neues Produkt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <span className="text-purple-400">●</span> ProduktID *
                </Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="NS-12345"
                  className="h-14 bg-zinc-800/90 border-2 border-zinc-600 text-white placeholder:text-zinc-300 font-bold text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <span className="text-purple-400">●</span> Preis (€) *
                </Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  step="0.01"
                  className="h-14 bg-zinc-800/90 border-2 border-zinc-600 text-white placeholder:text-zinc-300 font-bold text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-black text-white mb-2 flex items-center gap-2">
                <span className="text-purple-400">●</span> Name *
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Produktname"
                className="h-14 bg-zinc-800/70 border-2 border-zinc-600 text-zinc-50 placeholder:text-zinc-400 font-bold text-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-black text-white mb-2">Beschreibung</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Produktbeschreibung..."
                rows={4}
                className="bg-zinc-800/90 border-2 border-zinc-600 text-white placeholder:text-zinc-300 font-medium text-base focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl resize-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-3">
                <Label className="text-lg font-black text-white mb-2">Department</Label>
                <Select value={formData.department_id} onValueChange={(val) => setFormData({ ...formData, department_id: val })}>
                  <SelectTrigger className="h-14 bg-zinc-800/90 border-2 border-zinc-600 text-white font-bold text-base focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Wählen..." className="text-zinc-300 font-medium" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-600">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id} className="text-white font-bold hover:bg-purple-500/20">{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <span className="text-purple-400">●</span> Kategorie *
                </Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                  <SelectTrigger className="h-14 bg-zinc-800/90 border-2 border-zinc-600 text-white font-bold text-base focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Wählen..." className="text-zinc-300 font-medium" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-600">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-white font-bold hover:bg-purple-500/20">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-black text-white mb-2">Marke</Label>
                <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
                  <SelectTrigger className="h-14 bg-zinc-800/90 border-2 border-zinc-600 text-white font-bold text-base focus:border-purple-400 rounded-xl">
                    <SelectValue placeholder="Wählen..." className="text-zinc-300 font-medium" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-600">
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id} className="text-white font-bold hover:bg-purple-500/20">{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-black text-white mb-2">Cover Bild URL</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
                className="h-14 bg-zinc-800/70 border-2 border-zinc-600 text-zinc-50 placeholder:text-zinc-400 font-medium text-base focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-black text-white mb-2">Tags</Label>
              <div className="flex gap-3 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Tag eingeben..."
                  className="h-14 bg-zinc-800/70 border-2 border-zinc-600 text-zinc-50 placeholder:text-zinc-400 font-medium text-base focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 rounded-xl"
                />
                <Button onClick={addTag} variant="outline" className="h-14 px-8 border-2 border-zinc-600 bg-zinc-800/90 hover:border-purple-400 hover:bg-purple-500/20 rounded-xl font-black text-white">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3 glass backdrop-blur border-2 border-zinc-600 rounded-xl hover:border-purple-400 transition-all group">
                    <span className="text-base font-black text-white">{tag}</span>
                    <button onClick={() => removeTag(tag)} className="text-zinc-400 hover:text-red-400 transition-colors group-hover:scale-110">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4 p-5 glass backdrop-blur border-2 border-zinc-600 rounded-xl hover:border-purple-400 transition-all cursor-pointer">
              <Checkbox
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                className="border-2 border-zinc-500 w-6 h-6"
              />
              <Label htmlFor="in_stock" className="text-lg font-black text-white cursor-pointer">Auf Lager</Label>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t-2 border-zinc-700">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-14 px-8 border-2 border-zinc-600 bg-zinc-700 hover:border-red-400 hover:bg-red-500/20 font-bold text-base text-white rounded-xl uppercase tracking-wide">
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="h-14 px-10 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:shadow-2xl hover:shadow-purple-500/50 hover:scale-105 transition-all font-bold text-base text-white rounded-xl uppercase tracking-wide">
              <Save className="w-5 h-5 mr-2" />
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}