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

  const [selectedProducts, setSelectedProducts] = useState([]);

  // ... (keep existing loadData, etc.)

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(p => p !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  const handeBulkDelete = async () => {
    if (!confirm(`${selectedProducts.length} Produkte wirklich löschen?`)) return;
    try {
      await Promise.all(selectedProducts.map(id => api.entities.Product.delete(id)));
      toast({ title: 'Gelöscht', description: `${selectedProducts.length} Produkte gelöscht` });
      setSelectedProducts([]);
      loadData();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Bulk Delete fehlgeschlagen', variant: 'destructive' });
    }
  };

  const handleBulkStatus = async (inStock) => {
    try {
      await Promise.all(
        selectedProducts.map(id => api.entities.Product.update(id, { in_stock: inStock }))
      );
      toast({ title: 'Aktualisiert', description: `${selectedProducts.length} Produkte aktualisiert` });
      setSelectedProducts([]);
      loadData();
    } catch (error) {
      toast({ title: 'Fehler', description: 'Bulk Update fehlgeschlagen', variant: 'destructive' });
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
        <div className="flex gap-2">
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2 mr-4"
            >
              <Button onClick={() => handleBulkStatus(true)} variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                Live schalten
              </Button>
              <Button onClick={() => handleBulkStatus(false)} variant="outline" className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                Verstecken
              </Button>
              <Button onClick={handeBulkDelete} variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                {selectedProducts.length} Löschen
              </Button>
            </motion.div>
          )}
          <Button onClick={handleNew} className="bg-gradient-to-r from-purple-500 to-pink-500">
            <Plus className="w-5 h-5 mr-2" />
            Neues Produkt
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass backdrop-blur border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent bg-zinc-900/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onCheckedChange={toggleSelectAll}
                  className="border-zinc-600"
                />
              </TableHead>
              <TableHead className="font-bold">ProduktID</TableHead>
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
              const isSelected = selectedProducts.includes(product.id);

              return (
                <TableRow key={product.id} className={`border-zinc-800 transition-colors ${isSelected ? 'bg-purple-500/10 hover:bg-purple-500/20' : 'hover:bg-zinc-900/30'}`}>
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(product.id)}
                      className="border-zinc-600"
                    />
                  </TableCell>
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
                      {/* Same buttons as before */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.location.href = createPageUrl('AdminProductEditor') + `?id=${product.id}`}
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

      {/* Edit Dialog - Kept Exactly as is, just wrapped or below */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* ... (Keep existing Dialog Content exactly as is in previous file content) ... 
             Since I cannot partial replace easily with this tool if I am replacing the whole return, I must include the Dialog content again or verify if I can target just the Table part. 
             The previous tool call showed the file ends with the Dialog.
             I will try to replace the return statement block mainly. but replace_file_content is line based.
             Let's use a Replace Block that targets from `return (` down to the end of the file.
         */}
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