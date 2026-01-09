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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Produkt bearbeiten' : 'Neues Produkt'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>SKU *</Label>
                <Input
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="NS-12345"
                />
              </div>
              <div>
                <Label>Preis (€) *</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Produktname"
              />
            </div>

            <div>
              <Label>Beschreibung</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Produktbeschreibung..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
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

              <div>
                <Label>Kategorie *</Label>
                <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Marke</Label>
                <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Cover Bild URL</Label>
              <Input
                value={formData.cover_image}
                onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Tag eingeben..."
                />
                <Button onClick={addTag} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1 bg-zinc-800 rounded-full">
                    <span className="text-sm">{tag}</span>
                    <button onClick={() => removeTag(tag)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
              />
              <Label htmlFor="in_stock">Auf Lager</Label>
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