import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { ArrowLeft, Save, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { createPageUrl } from '../utils';
import ProductVariantManager from '../components/admin/ProductVariantManager';
import ProductMedia from '../components/admin/ProductMedia';
import ProductSEO from '../components/admin/ProductSEO';

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
    product_type: 'other',
    drop_date: null
  });

  // Media (Gallery)
  const [productImages, setProductImages] = useState([]);

  // Options & Variants (These are managed by ProductVariantManager, but we need initial state)
  const [initialVariantData, setInitialVariantData] = useState({
    colors: [],
    sizes: [],
    variants: []
  });

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
        api.entities.Category.list('sort_order'),
        api.entities.Brand.list('sort_order'),
        api.entities.Department.list('sort_order')
      ]);
      setCategories(cats);
      setBrands(brds);
      setDepartments(depts);

      if (productId) {
        const [prods, images] = await Promise.all([
          api.entities.Product.filter({ id: productId }),
          api.entities.ProductImage.filter({ product_id: productId })
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
            product_type: prod.product_type || 'other',
            drop_date: prod.drop_date ? new Date(prod.drop_date) : null
          });
          setProductImages(images.sort((a, b) => a.sort_order - b.sort_order));

          setInitialVariantData({
            colors: prod.colors || [],
            sizes: prod.sizes || [],
            variants: prod.variants || []
          });
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
        // We only save basic data here. Variants are saved inside ProductVariantManager.
      };

      if (productId) {
        await api.entities.Product.update(productId, dataToSave);
        toast.success('Basis-Daten gespeichert');
      } else {
        const created = await api.entities.Product.create(dataToSave);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 sticky top-4 z-50 glass p-4 rounded-2xl border border-zinc-800 shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(createPageUrl('AdminProducts'))}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-zinc-800 bg-zinc-900 border border-zinc-700"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-white">
                {productId ? 'Produkt bearbeiten' : 'Neues Produkt'}
              </h1>
              <p className="text-xs text-zinc-400 font-mono">
                {formData.sku || 'DRAFT'}
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-all text-white font-bold shadow-lg shadow-purple-900/20">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? 'Speichert...' : 'Speichern'}
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-900/50 p-1 border border-zinc-800">
            {['basic', 'media', 'variants', 'seo'].map(tab => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white uppercase tracking-wider font-bold text-xs px-6"
              >
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Basic Tab */}
          <TabsContent value="basic">
            <div className="glass-panel rounded-2xl p-6 space-y-6 border border-zinc-800 bg-zinc-900/30">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>SKU</Label>
                  <Input
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="bg-zinc-900 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preis (€)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="bg-zinc-900 border-zinc-700 font-mono text-purple-400 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-900 border-zinc-700 text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="bg-zinc-900 border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Kategorie</Label>
                  <Select value={formData.category_id} onValueChange={(val) => setFormData({ ...formData, category_id: val })}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marke</Label>
                  <Select value={formData.brand_id} onValueChange={(val) => setFormData({ ...formData, brand_id: val })}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue placeholder="Wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.product_type} onValueChange={(val) => setFormData({ ...formData, product_type: val })}>
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
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

              {/* Drop Calendar Section */}
              <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Label className="text-zinc-400 mb-2 block uppercase text-xs font-bold tracking-wider">Launch & Drop Datum</Label>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal bg-zinc-900 border-zinc-700",
                            !formData.drop_date && "text-zinc-500"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.drop_date ? format(formData.drop_date, "PPP", { locale: de }) : <span>Drop Datum wählen</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.drop_date}
                          onSelect={(date) => {
                            if (date) {
                              const newDate = new Date(date);
                              // Keep time if it was set
                              if (formData.drop_date) {
                                newDate.setHours(formData.drop_date.getHours());
                                newDate.setMinutes(formData.drop_date.getMinutes());
                              } else {
                                newDate.setHours(18); // Default 18:00
                                newDate.setMinutes(0);
                              }
                              setFormData({ ...formData, drop_date: newDate });
                            } else {
                              setFormData({ ...formData, drop_date: null });
                            }
                          }}
                          initialFocus
                          className="text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="w-[150px]">
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                      <Input
                        type="time"
                        className="pl-9 bg-zinc-900 border-zinc-700 text-white"
                        value={formData.drop_date ? format(formData.drop_date, "HH:mm") : ""}
                        onChange={(e) => {
                          if (!formData.drop_date) return;
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(formData.drop_date);
                          newDate.setHours(parseInt(hours));
                          newDate.setMinutes(parseInt(minutes));
                          setFormData({ ...formData, drop_date: newDate });
                        }}
                      />
                    </div>
                  </div>
                  {formData.drop_date && (
                    <Button variant="ghost" size="icon" onClick={() => setFormData({ ...formData, drop_date: null })} className="text-red-400">
                      <ArrowLeft className="w-4 h-4 rotate-45" /> {/* X icon replacement */}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Setze ein Datum in der Zukunft um einen <strong>Daily Drop Timer</strong> zu aktivieren. Das Produkt ist bis dahin nicht kaufbar.
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                <Checkbox
                  checked={formData.in_stock}
                  onCheckedChange={(c) => setFormData({ ...formData, in_stock: c })}
                />
                <Label>Produkt ist Veröffentlicht & Auf Lager</Label>
              </div>
            </div>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media">
            <ProductMedia
              images={productImages}
              onChange={setProductImages}
              coverImage={formData.cover_image}
              onCoverChange={(url) => setFormData({ ...formData, cover_image: url })}
            />
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants">
            {productId ? (
              <ProductVariantManager
                product={{
                  id: productId,
                  sku: formData.sku,
                  price: formData.price,
                  ...initialVariantData
                }}
                onUpdate={(data) => {
                  setInitialVariantData(data); // Sync local state?
                  console.log('Variants updated in Manager');
                }}
              />
            ) : (
              <div className="glass-panel p-12 text-center text-zinc-500">
                Bitte speichere das Produkt zuerst.
              </div>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <ProductSEO
              name={formData.name}
              description={formData.description}
              slug={formData.name?.toLowerCase().replace(/ /g, '-')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}