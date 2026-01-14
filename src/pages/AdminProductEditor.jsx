import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowLeft, Save, Upload, X, Plus, GripVertical, Palette, Ruler, Grid3x3 } from 'lucide-react';
import { motion, Reorder } from 'framer-motion';
import { createPageUrl } from '../utils';

export default function AdminProductEditor() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Basic Info
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
    cover_image: '',
    product_type: 'other'
  });

  // Media
  const [productImages, setProductImages] = useState([]);

  // Options
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colorInput, setColorInput] = useState({ name: '', hex: '#000000', images: [] });
  const [sizeInput, setSizeInput] = useState('');

  // Variants
  const [variants, setVariants] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);

  // Dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    loadData();
  }, [productId]);

  const loadData = async () => {
    try {
      const [cats, brds, depts] = await Promise.all([
        base44.entities.Category.list('sort_order'),
        base44.entities.Brand.list('sort_order'),
        base44.entities.Department.list('sort_order')
      ]);
      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);

      if (productId) {
        const [prods, images] = await Promise.all([
          base44.entities.Product.filter({ id: productId }),
          base44.entities.ProductImage.filter({ product_id: productId })
        ]);

        if (prods.length > 0) {
          const prod = prods[0];
          setFormData({
            sku: prod.sku || '',
            name: prod.name || '',
            description: prod.description || '',
            price: prod.price || 0,
            currency: prod.currency || 'EUR',
            department_id: prod.department_id || '',
            category_id: prod.category_id || '',
            brand_id: prod.brand_id || '',
            in_stock: prod.in_stock !== false,
            tags: prod.tags || [],
            cover_image: prod.cover_image || '',
            product_type: prod.product_type || 'other'
          });
          setProductImages(images.sort((a, b) => a.sort_order - b.sort_order));
          setColors(prod.colors || []);
          setSizes(prod.sizes || []);
          setVariants(prod.variants || []);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const dataToSave = {
        ...formData,
        colors,
        sizes,
        variants
      };

      if (productId) {
        await base44.entities.Product.update(productId, dataToSave);
        toast.success('Produkt gespeichert');
      } else {
        const created = await base44.entities.Product.create(dataToSave);
        toast.success('Produkt erstellt');
        navigate(createPageUrl('AdminProductEditor') + `?id=${created.id}`);
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const addColor = () => {
    if (!colorInput.name) return;
    setColors([...colors, { id: `color_${Date.now()}`, ...colorInput }]);
    setColorInput({ name: '', hex: '#000000', images: [] });
  };

  const removeColor = (colorId) => {
    setColors(colors.filter(c => c.id !== colorId));
    setVariants(variants.filter(v => v.color_id !== colorId));
  };

  const addSize = () => {
    if (!sizeInput || sizes.includes(sizeInput)) return;
    setSizes([...sizes, sizeInput]);
    setSizeInput('');
  };

  const removeSize = (size) => {
    setSizes(sizes.filter(s => s !== size));
    setVariants(variants.filter(v => v.size !== size));
  };

  const generateVariants = () => {
    const newVariants = [];
    for (const color of colors) {
      for (const size of sizes) {
        const existing = variants.find(v => v.color_id === color.id && v.size === size);
        if (existing) {
          newVariants.push(existing);
        } else {
          newVariants.push({
            id: `variant_${Date.now()}_${Math.random()}`,
            color_id: color.id,
            size,
            sku: `${formData.sku}-${color.name}-${size}`,
            stock: 0,
            price_override: null,
            active: true
          });
        }
      }
    }
    setVariants(newVariants);
    toast.success(`${newVariants.length} Varianten generiert`);
  };

  const updateVariant = (variantId, field, value) => {
    setVariants(variants.map(v => v.id === variantId ? { ...v, [field]: value } : v));
  };

  const bulkUpdateVariants = (field, value) => {
    if (selectedVariants.length === 0) {
      toast.error('Keine Varianten ausgewählt');
      return;
    }
    setVariants(variants.map(v => 
      selectedVariants.includes(v.id) ? { ...v, [field]: value } : v
    ));
    toast.success(`${selectedVariants.length} Varianten aktualisiert`);
  };

  const uploadImage = async (e, colorId = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (colorId) {
        setColors(colors.map(c => c.id === colorId ? {
          ...c,
          images: [...(c.images || []), file_url]
        } : c));
      } else {
        setFormData({ ...formData, cover_image: file_url });
      }
      
      toast.success('Bild hochgeladen');
    } catch (error) {
      toast.error('Upload fehlgeschlagen');
    }
  };

  const sizeTemplates = {
    shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    pants: ['28', '30', '32', '34', '36', '38', '40', '42'],
    other: []
  };

  const applySizeTemplate = (type) => {
    setSizes(sizeTemplates[type]);
    toast.success(`${sizeTemplates[type].length} Größen hinzugefügt`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="animate-spin w-12 h-12 border-4 rounded-full" style={{ borderColor: 'rgba(139, 92, 246, 0.3)', borderTopColor: '#8B5CF6' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(createPageUrl('AdminProducts'))}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-black text-white">
                {productId ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h1>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {formData.sku || 'SKU wird generiert'}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="btn-gold">
            <Save className="w-5 h-5 me-2" />
            {saving ? 'Speichert...' : 'Speichern'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 p-1 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg">
              Basic
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg">
              Media
            </TabsTrigger>
            <TabsTrigger value="options" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg">
              Options
            </TabsTrigger>
            <TabsTrigger value="variants" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white font-bold rounded-lg">
              Variants ({variants.length})
            </TabsTrigger>
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic">
            <div className="glass-panel rounded-2xl p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-white font-bold mb-2 block">SKU *</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="NS-12345"
                    className="h-12"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                  />
                </div>
                <div>
                  <Label className="text-white font-bold mb-2 block">Preis (€) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    step="0.01"
                    className="h-12"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Produktname"
                  className="h-12"
                  style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                />
              </div>

              <div>
                <Label className="text-white font-bold mb-2 block">Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Produktbeschreibung..."
                  rows={4}
                  style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white font-bold mb-2 block">Kategorie *</Label>
                  <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                    <SelectTrigger className="h-12" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
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
                  <Label className="text-white font-bold mb-2 block">Marke</Label>
                  <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
                    <SelectTrigger className="h-12" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(brand => (
                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white font-bold mb-2 block">Produkttyp</Label>
                  <Select value={formData.product_type} onValueChange={(val) => setFormData({ ...formData, product_type: val })}>
                    <SelectTrigger className="h-12" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shoes">Schuhe</SelectItem>
                      <SelectItem value="clothing">Kleidung</SelectItem>
                      <SelectItem value="pants">Hosen</SelectItem>
                      <SelectItem value="accessories">Accessoires</SelectItem>
                      <SelectItem value="other">Sonstiges</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="in_stock"
                  checked={formData.in_stock}
                  onCheckedChange={(checked) => setFormData({ ...formData, in_stock: checked })}
                />
                <Label htmlFor="in_stock" className="text-white font-bold cursor-pointer">Auf Lager</Label>
              </div>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <div className="glass-panel rounded-2xl p-6">
              <div className="mb-4">
                <Label className="text-white font-bold mb-2 block">Cover Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://..."
                    className="h-12 flex-1"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                  />
                  <label className="btn-gold-outline h-12 px-6 cursor-pointer flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e)} />
                  </label>
                </div>
                {formData.cover_image && (
                  <img src={formData.cover_image} alt="Cover" className="mt-4 w-32 h-32 object-cover rounded-xl" />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options">
            <div className="space-y-6">
              {/* Colors */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="w-6 h-6" style={{ color: '#D6B25E' }} />
                  <h3 className="text-xl font-black text-white">Farben</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <Input
                    value={colorInput.name}
                    onChange={(e) => setColorInput({ ...colorInput, name: e.target.value })}
                    placeholder="Farbname (z.B. Schwarz)"
                    className="h-12"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                  />
                  <Input
                    type="color"
                    value={colorInput.hex}
                    onChange={(e) => setColorInput({ ...colorInput, hex: e.target.value })}
                    className="h-12"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)' }}
                  />
                  <Button onClick={addColor} className="btn-gold h-12">
                    <Plus className="w-5 h-5 me-2" />
                    Farbe hinzufügen
                  </Button>
                </div>

                <div className="space-y-3">
                  {colors.map((color) => (
                    <div key={color.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div className="w-12 h-12 rounded-xl" style={{ background: color.hex, border: '2px solid rgba(255, 255, 255, 0.2)' }} />
                      <div className="flex-1">
                        <p className="font-bold text-white">{color.name}</p>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{color.hex}</p>
                      </div>
                      <label className="btn-gold-outline h-10 px-4 cursor-pointer flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Bilder
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadImage(e, color.id)} />
                      </label>
                      <button onClick={() => removeColor(color.id)} className="w-10 h-10 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/20">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="glass-panel rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Ruler className="w-6 h-6" style={{ color: '#D6B25E' }} />
                  <h3 className="text-xl font-black text-white">Größen</h3>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  <Button onClick={() => applySizeTemplate('shoes')} variant="outline" className="btn-gold-outline">
                    Schuhe (35-47)
                  </Button>
                  <Button onClick={() => applySizeTemplate('clothing')} variant="outline" className="btn-gold-outline">
                    Kleidung (XS-XXL)
                  </Button>
                  <Button onClick={() => applySizeTemplate('pants')} variant="outline" className="btn-gold-outline">
                    Hosen (28-42)
                  </Button>
                </div>

                <div className="flex gap-4 mb-4">
                  <Input
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    placeholder="Größe eingeben (z.B. 42 oder L)"
                    className="h-12 flex-1"
                    style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                  />
                  <Button onClick={addSize} className="btn-gold h-12">
                    <Plus className="w-5 h-5 me-2" />
                    Hinzufügen
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <div key={size} className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ background: 'rgba(214, 178, 94, 0.15)', border: '1px solid rgba(214, 178, 94, 0.3)' }}>
                      <span className="font-bold text-white">{size}</span>
                      <button onClick={() => removeSize(size)} className="text-red-400 hover:text-red-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Grid3x3 className="w-6 h-6" style={{ color: '#D6B25E' }} />
                  <h3 className="text-xl font-black text-white">Varianten</h3>
                </div>
                <Button onClick={generateVariants} className="btn-gold">
                  <Grid3x3 className="w-5 h-5 me-2" />
                  Varianten generieren ({colors.length} × {sizes.length} = {colors.length * sizes.length})
                </Button>
              </div>

              {variants.length > 0 && (
                <>
                  {/* Bulk Actions */}
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                    <p className="text-sm font-bold text-white mb-2">Bulk-Aktionen ({selectedVariants.length} ausgewählt)</p>
                    <div className="flex gap-3">
                      <Input
                        type="number"
                        placeholder="Preis"
                        className="h-10 w-32"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            bulkUpdateVariants('price_override', parseFloat(e.target.value));
                            e.target.value = '';
                          }
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Bestand"
                        className="h-10 w-32"
                        style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.target.value) {
                            bulkUpdateVariants('stock', parseInt(e.target.value));
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button onClick={() => bulkUpdateVariants('active', true)} variant="outline" className="btn-gold-outline h-10">
                        Aktivieren
                      </Button>
                      <Button onClick={() => bulkUpdateVariants('active', false)} variant="outline" className="btn-gold-outline h-10">
                        Deaktivieren
                      </Button>
                    </div>
                  </div>

                  {/* Variants Table */}
                  <div className="space-y-2">
                    {variants.map((variant) => {
                      const color = colors.find(c => c.id === variant.color_id);
                      return (
                        <div key={variant.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <Checkbox
                            checked={selectedVariants.includes(variant.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedVariants([...selectedVariants, variant.id]);
                              } else {
                                setSelectedVariants(selectedVariants.filter(id => id !== variant.id));
                              }
                            }}
                          />
                          <div className="w-8 h-8 rounded-lg" style={{ background: color?.hex || '#888', border: '1px solid rgba(255, 255, 255, 0.2)' }} />
                          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                            <div>
                              <p className="text-sm font-bold text-white">{color?.name}</p>
                              <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{variant.size}</p>
                            </div>
                            <Input
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                              className="h-10 text-sm"
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                            />
                            <Input
                              type="number"
                              value={variant.price_override || ''}
                              onChange={(e) => updateVariant(variant.id, 'price_override', e.target.value ? parseFloat(e.target.value) : null)}
                              placeholder={`${formData.price}€`}
                              className="h-10 text-sm"
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                            />
                            <Input
                              type="number"
                              value={variant.stock}
                              onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                              className="h-10 text-sm"
                              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#FFFFFF' }}
                            />
                            <Checkbox
                              checked={variant.active}
                              onCheckedChange={(checked) => updateVariant(variant.id, 'active', checked)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}