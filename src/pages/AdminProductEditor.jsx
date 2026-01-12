import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, Save, Package, Truck, Palette, Image as ImageIcon, 
  Eye, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import ProductVariantEditor from '../components/admin/ProductVariantEditor';

export default function AdminProductEditor() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const isEdit = !!productId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [product, setProduct] = useState({
    sku: '',
    name: '',
    description: '',
    price: 0,
    category_id: '',
    brand_id: '',
    department_id: '',
    product_type: 'other',
    in_stock: true,
    cover_image: '',
    tags: [],
    shipping_options: [
      { location: 'Germany', days_min: 1, days_max: 5, price_modifier: 0 },
      { location: 'China', days_min: 8, days_max: 15, price_modifier: -0.15 }
    ]
  });

  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    loadInitialData();
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);

  const loadInitialData = async () => {
    try {
      const [cats, brds, depts] = await Promise.all([
        base44.entities.Category.list('sort_order'),
        base44.entities.Brand.list('sort_order'),
        base44.entities.Department.list('sort_order')
      ]);
      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadProduct = async (id) => {
    setLoading(true);
    try {
      const products = await base44.entities.Product.filter({ id });
      if (products.length > 0) {
        const p = products[0];
        setProduct(p);
        setColors(p.colors || []);
        setSizes(p.sizes || []);
        setVariants(p.variants || []);
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const productData = {
        ...product,
        colors,
        sizes,
        variants,
        cover_image: colors[0]?.images?.[0] || product.cover_image,
        in_stock: variants.some(v => v.stock > 0)
      };

      if (isEdit) {
        await base44.entities.Product.update(productId, productData);
      } else {
        await base44.entities.Product.create(productData);
      }

      navigate(createPageUrl('AdminProducts'));
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(180deg, #0a0a0f, #050508)' }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="h-11 w-11 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.8)' }} />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>
                {isEdit ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h1>
              <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {product.sku || 'SKU wird generiert'}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-12 px-6 btn-gold text-base font-black"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {saving ? 'Speichern...' : 'Speichern'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="w-full grid grid-cols-5 h-14 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <TabsTrigger value="basic" className="h-12 text-base font-bold data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg">
              <Package className="w-4 h-4 mr-2" /> Basis
            </TabsTrigger>
            <TabsTrigger value="shipping" className="h-12 text-base font-bold data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg">
              <Truck className="w-4 h-4 mr-2" /> Versand
            </TabsTrigger>
            <TabsTrigger value="variants" className="h-12 text-base font-bold data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg">
              <Palette className="w-4 h-4 mr-2" /> Varianten
            </TabsTrigger>
            <TabsTrigger value="images" className="h-12 text-base font-bold data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg">
              <ImageIcon className="w-4 h-4 mr-2" /> Bilder
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-12 text-base font-bold data-[state=active]:bg-gold data-[state=active]:text-black rounded-lg">
              <Eye className="w-4 h-4 mr-2" /> Vorschau
            </TabsTrigger>
          </TabsList>

          {/* Basic Info */}
          <TabsContent value="basic">
            <div className="p-6 rounded-2xl space-y-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Artikelnummer (SKU) *
                  </label>
                  <Input
                    value={product.sku}
                    onChange={(e) => setProduct({ ...product, sku: e.target.value })}
                    placeholder="z.B. NS-J4-001"
                    className="h-12 text-base bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Produkttyp
                  </label>
                  <Select value={product.product_type} onValueChange={(v) => setProduct({ ...product, product_type: v })}>
                    <SelectTrigger className="h-12 text-base bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shoes">Schuhe</SelectItem>
                      <SelectItem value="clothing">Kleidung</SelectItem>
                      <SelectItem value="pants">Hosen</SelectItem>
                      <SelectItem value="accessories">Accessoires</SelectItem>
                      <SelectItem value="bags">Taschen</SelectItem>
                      <SelectItem value="other">Andere</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Produktname *
                </label>
                <Input
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                  placeholder="z.B. Air Jordan 4 Retro Black Cat"
                  className="h-12 text-base bg-white/5 border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  Beschreibung
                </label>
                <Textarea
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                  placeholder="Produktbeschreibung..."
                  className="min-h-[120px] text-base bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Preis (€) *
                  </label>
                  <Input
                    type="number"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                    className="h-12 text-base bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Kategorie *
                  </label>
                  <Select value={product.category_id} onValueChange={(v) => setProduct({ ...product, category_id: v })}>
                    <SelectTrigger className="h-12 text-base bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-base font-bold mb-2" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    Marke
                  </label>
                  <Select value={product.brand_id} onValueChange={(v) => setProduct({ ...product, brand_id: v })}>
                    <SelectTrigger className="h-12 text-base bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Shipping */}
          <TabsContent value="shipping">
            <div className="p-6 rounded-2xl space-y-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>Versandoptionen</h3>
              
              {product.shipping_options?.map((opt, idx) => (
                <div key={idx} className="grid md:grid-cols-4 gap-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Standort</label>
                    <Input
                      value={opt.location}
                      onChange={(e) => {
                        const newOpts = [...product.shipping_options];
                        newOpts[idx].location = e.target.value;
                        setProduct({ ...product, shipping_options: newOpts });
                      }}
                      className="h-11 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Min. Tage</label>
                    <Input
                      type="number"
                      value={opt.days_min}
                      onChange={(e) => {
                        const newOpts = [...product.shipping_options];
                        newOpts[idx].days_min = parseInt(e.target.value) || 0;
                        setProduct({ ...product, shipping_options: newOpts });
                      }}
                      className="h-11 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Max. Tage</label>
                    <Input
                      type="number"
                      value={opt.days_max}
                      onChange={(e) => {
                        const newOpts = [...product.shipping_options];
                        newOpts[idx].days_max = parseInt(e.target.value) || 0;
                        setProduct({ ...product, shipping_options: newOpts });
                      }}
                      className="h-11 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Preis-Mod. (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={opt.price_modifier * 100}
                      onChange={(e) => {
                        const newOpts = [...product.shipping_options];
                        newOpts[idx].price_modifier = (parseFloat(e.target.value) || 0) / 100;
                        setProduct({ ...product, shipping_options: newOpts });
                      }}
                      className="h-11 bg-white/5 border-white/10 text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Variants */}
          <TabsContent value="variants">
            <ProductVariantEditor
              product={product}
              colors={colors}
              setColors={setColors}
              sizes={sizes}
              setSizes={setSizes}
              variants={variants}
              setVariants={setVariants}
              productType={product.product_type}
            />
          </TabsContent>

          {/* Images */}
          <TabsContent value="images">
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-black mb-6" style={{ color: 'rgba(255,255,255,0.95)' }}>Bilder nach Farbe</h3>
              
              {colors.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
                  <p className="text-lg font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Füge zuerst Farben im "Varianten"-Tab hinzu, um Bilder hochzuladen.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {colors.map(color => (
                    <div key={color.id} className="p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg" style={{ background: color.hex }} />
                        <span className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{color.name}</span>
                        <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {color.images?.length || 0} Bilder
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {color.images?.map((img, idx) => (
                          <div key={idx} className={`relative ${idx === 0 ? 'ring-2 ring-gold' : ''} rounded-lg overflow-hidden`}>
                            <img src={img} alt="" className="w-24 h-24 object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-1 left-1 px-2 py-0.5 text-xs font-bold bg-gold text-black rounded">
                                Hauptbild
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Preview */}
          <TabsContent value="preview">
            <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-xl font-black mb-6" style={{ color: 'rgba(255,255,255,0.95)' }}>Produktvorschau</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  {colors[0]?.images?.[0] ? (
                    <img src={colors[0].images[0]} alt="" className="w-full aspect-square object-cover rounded-2xl" />
                  ) : (
                    <div className="w-full aspect-square bg-zinc-900 rounded-2xl flex items-center justify-center">
                      <Package className="w-16 h-16 text-zinc-700" />
                    </div>
                  )}
                </div>
                <div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block"
                    style={{ background: 'rgba(214, 178, 94, 0.15)', color: '#D6B25E' }}>
                    {product.sku || 'SKU'}
                  </span>
                  <h2 className="text-2xl font-black mb-2" style={{ color: 'rgba(255,255,255,0.95)' }}>
                    {product.name || 'Produktname'}
                  </h2>
                  <p className="text-3xl font-black text-gold mb-4">
                    {product.price?.toFixed(2) || '0.00'} €
                  </p>
                  <p className="text-base mb-6" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    {product.description || 'Keine Beschreibung'}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Farben:</span>
                      <div className="flex gap-2 mt-2">
                        {colors.map(c => (
                          <div key={c.id} className="w-8 h-8 rounded-lg border border-white/20" style={{ background: c.hex }} title={c.name} />
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Größen:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {sizes.map(s => (
                          <span key={s} className="px-3 py-1 rounded-lg text-sm font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Varianten:</span>
                      <span className="ml-2 text-base font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {variants.length} ({variants.filter(v => v.stock > 0).length} auf Lager)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}