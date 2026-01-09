import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
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
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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
        base44.entities.Product.list('-created_date'),
        base44.entities.Department.list('sort_order'),
        base44.entities.Category.list('sort_order'),
        base44.entities.Brand.list('sort_order')
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
        await base44.entities.Product.update(editingProduct.id, formData);
        toast({ title: 'Gespeichert', description: 'Produkt wurde aktualisiert' });
      } else {
        await base44.entities.Product.create(formData);
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
      await base44.entities.Product.delete(id);
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
      await base44.entities.Product.update(productId, { [field]: value });
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
        className="glass backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
              <TableHead className="font-bold">SKU</TableHead>
              <TableHead className="font-bold">Name</TableHead>
              <TableHead className="font-bold">Preis</TableHead>
              <TableHead className="font-bold">Kategorie</TableHead>
              <TableHead className="font-bold">Marke</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="text-right font-bold">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const category = categories.find(c => c.id === product.category_id);
              const brand = brands.find(b => b.id === product.brand_id);
              
              return (
                <TableRow key={product.id} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                  <TableCell className="font-mono text-purple-400 text-sm">{product.sku}</TableCell>
                  <TableCell>
                    <InlineEditableField
                      value={product.name}
                      onSave={(value) => handleInlineUpdate(product.id, 'name', value)}
                      className="font-medium"
                    />
                  </TableCell>
                  <TableCell>
                    <InlineEditableField
                      value={product.price}
                      type="number"
                      onSave={(value) => handleInlineUpdate(product.id, 'price', parseFloat(value))}
                      className="text-purple-400 font-bold"
                    />
                  </TableCell>
                  <TableCell className="text-zinc-400 text-sm">{category?.name || '-'}</TableCell>
                  <TableCell className="text-zinc-400 text-sm">{brand?.name || '-'}</TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleInlineUpdate(product.id, 'in_stock', !product.in_stock)}
                      className="group"
                    >
                      {product.in_stock ? (
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(product)}
                        className="hover:bg-purple-500/20 hover:text-purple-400 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
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
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass backdrop-blur-xl border-2 border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-bold text-zinc-200 mb-2 block">SKU *</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="NS-12345"
                  className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-zinc-200 mb-2 block">Preis (€) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  step="0.01"
                  className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold text-zinc-200 mb-2 block">Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Produktname"
                className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-zinc-200 mb-2 block">Beschreibung</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Produktbeschreibung..."
                rows={3}
                className="bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-bold text-zinc-200 mb-2 block">Department</Label>
                <Select value={formData.department_id} onValueChange={(val) => setFormData({ ...formData, department_id: val })}>
                  <SelectTrigger className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 font-medium focus:border-purple-500/50">
                    <SelectValue placeholder="Wählen..." className="text-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-700">
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id} className="text-zinc-100 font-medium">{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold text-zinc-200 mb-2 block">Kategorie *</Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                  <SelectTrigger className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 font-medium focus:border-purple-500/50">
                    <SelectValue placeholder="Wählen..." className="text-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-700">
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id} className="text-zinc-100 font-medium">{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-bold text-zinc-200 mb-2 block">Marke</Label>
                <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
                  <SelectTrigger className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 font-medium focus:border-purple-500/50">
                    <SelectValue placeholder="Wählen..." className="text-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-700">
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id} className="text-zinc-100 font-medium">{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-bold text-zinc-200 mb-2 block">Cover Bild URL</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
                className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <Label className="text-sm font-bold text-zinc-200 mb-2 block">Tags</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Tag eingeben..."
                  className="h-12 bg-zinc-800/50 border-2 border-zinc-700 text-zinc-100 placeholder:text-zinc-400 font-medium focus:border-purple-500/50 focus:ring-purple-500/20"
                />
                <Button onClick={addTag} variant="outline" className="h-12 px-6 border-2 border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/20">
                  <Plus className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-2 px-4 py-2 glass backdrop-blur border-2 border-zinc-700 rounded-xl hover:border-purple-500/50 transition-all">
                    <span className="text-sm font-bold text-zinc-100">{tag}</span>
                    <button onClick={() => removeTag(tag)} className="hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 glass backdrop-blur border-2 border-zinc-700 rounded-xl">
              <Checkbox
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                className="border-2 border-zinc-600"
              />
              <Label htmlFor="in_stock" className="text-base font-bold text-zinc-100 cursor-pointer">Auf Lager</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-zinc-700">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-12 px-6 border-2 border-zinc-700 hover:border-red-500/50 hover:bg-red-500/20 font-bold">
              Abbrechen
            </Button>
            <Button onClick={handleSave} className="h-12 px-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-2xl hover:shadow-purple-500/50 font-black text-lg">
              <Save className="w-5 h-5 mr-2" />
              Speichern
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}