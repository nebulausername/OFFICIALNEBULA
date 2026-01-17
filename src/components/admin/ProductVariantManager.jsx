import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Trash2, GripVertical, Upload, X, Check, 
  Palette, Ruler, Package, RefreshCw, Save, ImagePlus,
  ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Size presets
const SIZE_PRESETS = {
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  pants: ['28', '29', '30', '31', '32', '33', '34', '36', '38', '40'],
  oneSize: ['One Size']
};

export default function ProductVariantManager({ product, onUpdate }) {
  const [colors, setColors] = useState(product?.colors || []);
  const [sizes, setSizes] = useState(product?.sizes || []);
  const [variants, setVariants] = useState(product?.variants || []);
  const [expandedVariants, setExpandedVariants] = useState({});
  const [uploading, setUploading] = useState({});
  const [saving, setSaving] = useState(false);
  const [bulkEdit, setBulkEdit] = useState({ active: false, field: null, value: '' });
  const [selectedVariants, setSelectedVariants] = useState([]);
  
  const { toast } = useToast();

  // Add new color
  const addColor = () => {
    const newColor = {
      id: `color_${Date.now()}`,
      name: 'Neue Farbe',
      hex: '#808080',
      images: []
    };
    setColors([...colors, newColor]);
  };

  // Update color
  const updateColor = (colorId, field, value) => {
    setColors(colors.map(c => 
      c.id === colorId ? { ...c, [field]: value } : c
    ));
  };

  // Remove color
  const removeColor = (colorId) => {
    setColors(colors.filter(c => c.id !== colorId));
    setVariants(variants.filter(v => v.color_id !== colorId));
  };

  // Upload image for color
  const uploadColorImage = async (colorId, file) => {
    setUploading({ ...uploading, [colorId]: true });
    try {
      const result = await api.integrations.uploadFile({ file });
      const color = colors.find(c => c.id === colorId);
      const newImages = [...(color.images || []), result.file_url];
      updateColor(colorId, 'images', newImages);
      toast({ title: 'Bild hochgeladen' });
    } catch (error) {
      toast({ title: 'Upload fehlgeschlagen', variant: 'destructive' });
    } finally {
      setUploading({ ...uploading, [colorId]: false });
    }
  };

  // Remove image from color
  const removeColorImage = (colorId, imageUrl) => {
    const color = colors.find(c => c.id === colorId);
    const newImages = (color.images || []).filter(img => img !== imageUrl);
    updateColor(colorId, 'images', newImages);
  };

  // Reorder color images
  const reorderColorImages = (colorId, result) => {
    if (!result.destination) return;
    
    const color = colors.find(c => c.id === colorId);
    const newImages = Array.from(color.images || []);
    const [removed] = newImages.splice(result.source.index, 1);
    newImages.splice(result.destination.index, 0, removed);
    
    updateColor(colorId, 'images', newImages);
  };

  // Apply size preset
  const applySizePreset = (preset) => {
    setSizes(SIZE_PRESETS[preset] || []);
  };

  // Add custom size
  const addSize = () => {
    const newSize = prompt('Neue Größe eingeben:');
    if (newSize && !sizes.includes(newSize)) {
      setSizes([...sizes, newSize]);
    }
  };

  // Remove size
  const removeSize = (size) => {
    setSizes(sizes.filter(s => s !== size));
    setVariants(variants.filter(v => v.size !== size));
  };

  // Generate all variants
  const generateVariants = () => {
    const newVariants = [];
    
    colors.forEach(color => {
      if (sizes.length > 0) {
        sizes.forEach(size => {
          const existingVariant = variants.find(v => 
            v.color_id === color.id && v.size === size
          );
          
          newVariants.push(existingVariant || {
            id: `var_${color.id}_${size}_${Date.now()}`,
            color_id: color.id,
            size: size,
            sku: `${product?.sku || 'SKU'}-${color.name?.substring(0,3).toUpperCase()}-${size}`,
            stock: 0,
            price_override: null,
            active: true
          });
        });
      } else {
        // No sizes - create one variant per color
        const existingVariant = variants.find(v => v.color_id === color.id && !v.size);
        newVariants.push(existingVariant || {
          id: `var_${color.id}_${Date.now()}`,
          color_id: color.id,
          size: null,
          sku: `${product?.sku || 'SKU'}-${color.name?.substring(0,3).toUpperCase()}`,
          stock: 0,
          price_override: null,
          active: true
        });
      }
    });
    
    setVariants(newVariants);
    toast({ title: `${newVariants.length} Varianten generiert` });
  };

  // Update variant
  const updateVariant = (variantId, field, value) => {
    setVariants(variants.map(v => 
      v.id === variantId ? { ...v, [field]: value } : v
    ));
  };

  // Toggle variant selection
  const toggleVariantSelection = (variantId) => {
    setSelectedVariants(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  // Select all variants
  const selectAllVariants = () => {
    if (selectedVariants.length === variants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(variants.map(v => v.id));
    }
  };

  // Apply bulk edit
  const applyBulkEdit = () => {
    if (!bulkEdit.field || selectedVariants.length === 0) return;
    
    let value = bulkEdit.value;
    if (bulkEdit.field === 'stock' || bulkEdit.field === 'price_override') {
      value = parseFloat(value) || 0;
      if (bulkEdit.field === 'price_override' && value === 0) value = null;
    }
    if (bulkEdit.field === 'active') {
      value = bulkEdit.value === 'true';
    }
    
    setVariants(variants.map(v => 
      selectedVariants.includes(v.id) ? { ...v, [bulkEdit.field]: value } : v
    ));
    
    toast({ title: `${selectedVariants.length} Varianten aktualisiert` });
    setBulkEdit({ active: false, field: null, value: '' });
    setSelectedVariants([]);
  };

  // Save all changes
  const saveChanges = async () => {
    setSaving(true);
    try {
      await api.entities.Product.update(product.id, {
        colors,
        sizes,
        variants
      });
      
      toast({ title: 'Varianten gespeichert ✓' });
      if (onUpdate) onUpdate({ colors, sizes, variants });
    } catch (error) {
      console.error('Error saving variants:', error);
      toast({ title: 'Speichern fehlgeschlagen', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  // Get color by ID
  const getColorById = (colorId) => colors.find(c => c.id === colorId);

  return (
    <div className="space-y-8">
      {/* Colors Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Farben</h3>
              <p className="text-sm text-zinc-400">{colors.length} Farben definiert</p>
            </div>
          </div>
          <Button onClick={addColor} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Farbe hinzufügen
          </Button>
        </div>

        <div className="space-y-4">
          {colors.map((color, index) => (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
            >
              <div className="flex items-start gap-4">
                {/* Color Preview */}
                <div 
                  className="w-16 h-16 rounded-xl border-2 border-white/20 flex-shrink-0"
                  style={{ background: color.hex }}
                />
                
                {/* Color Details */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-zinc-400">Name</Label>
                      <Input
                        value={color.name}
                        onChange={(e) => updateColor(color.id, 'name', e.target.value)}
                        className="h-9 bg-zinc-900"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400">Hex-Code</Label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(color.id, 'hex', e.target.value)}
                          className="w-9 h-9 rounded cursor-pointer"
                        />
                        <Input
                          value={color.hex}
                          onChange={(e) => updateColor(color.id, 'hex', e.target.value)}
                          className="h-9 bg-zinc-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Color Images */}
                  <div>
                    <Label className="text-xs text-zinc-400 mb-2 block">Bilder für diese Farbe</Label>
                    <DragDropContext onDragEnd={(result) => reorderColorImages(color.id, result)}>
                      <Droppable droppableId={`color-images-${color.id}`} direction="horizontal">
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="flex gap-2 flex-wrap"
                          >
                            {(color.images || []).map((img, imgIndex) => (
                              <Draggable key={img} draggableId={img} index={imgIndex}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="relative w-16 h-16 rounded-lg overflow-hidden group"
                                  >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removeColorImage(color.id, img)}
                                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                      <X className="w-5 h-5 text-white" />
                                    </button>
                                    {imgIndex === 0 && (
                                      <div className="absolute bottom-0 left-0 right-0 bg-gold text-black text-xs font-bold text-center py-0.5">
                                        Cover
                                      </div>
                                    )}
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {/* Upload Button */}
                            <label className="w-16 h-16 rounded-lg border-2 border-dashed border-zinc-600 flex items-center justify-center cursor-pointer hover:border-zinc-500 transition-colors">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  if (e.target.files[0]) {
                                    uploadColorImage(color.id, e.target.files[0]);
                                  }
                                }}
                              />
                              {uploading[color.id] ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ repeat: Infinity, duration: 1 }}
                                >
                                  <RefreshCw className="w-5 h-5 text-zinc-500" />
                                </motion.div>
                              ) : (
                                <ImagePlus className="w-5 h-5 text-zinc-500" />
                              )}
                            </label>
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => removeColor(color.id)}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}

          {colors.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keine Farben definiert</p>
            </div>
          )}
        </div>
      </div>

      {/* Sizes Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Ruler className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Größen</h3>
              <p className="text-sm text-zinc-400">{sizes.length} Größen definiert</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => e.target.value && applySizePreset(e.target.value)}
              className="h-9 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white"
              defaultValue=""
            >
              <option value="">Preset wählen...</option>
              <option value="shoes">Schuhe (36-47)</option>
              <option value="clothing">Kleidung (XS-3XL)</option>
              <option value="pants">Hosen (28-40)</option>
              <option value="oneSize">One Size</option>
            </select>
            <Button onClick={addSize} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Eigene
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Badge
              key={size}
              variant="secondary"
              className="px-3 py-2 bg-zinc-800 text-white text-sm font-bold flex items-center gap-2"
            >
              {size}
              <button
                onClick={() => removeSize(size)}
                className="text-zinc-500 hover:text-red-500"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          
          {sizes.length === 0 && (
            <p className="text-zinc-500 text-sm">Keine Größen definiert (Produkt hat keine Größenauswahl)</p>
          )}
        </div>
      </div>

      {/* Variants Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Varianten</h3>
              <p className="text-sm text-zinc-400">
                {variants.length} Varianten • {variants.filter(v => v.active).length} aktiv
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedVariants.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBulkEdit({ active: true, field: null, value: '' })}
              >
                Bulk Edit ({selectedVariants.length})
              </Button>
            )}
            <Button onClick={generateVariants} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Generieren
            </Button>
          </div>
        </div>

        {/* Bulk Edit Panel */}
        <AnimatePresence>
          {bulkEdit.active && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700"
            >
              <div className="flex items-center gap-4">
                <select
                  value={bulkEdit.field || ''}
                  onChange={(e) => setBulkEdit({ ...bulkEdit, field: e.target.value })}
                  className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white"
                >
                  <option value="">Feld wählen...</option>
                  <option value="stock">Bestand</option>
                  <option value="price_override">Preis Override</option>
                  <option value="active">Aktiv</option>
                </select>
                
                {bulkEdit.field === 'active' ? (
                  <select
                    value={bulkEdit.value}
                    onChange={(e) => setBulkEdit({ ...bulkEdit, value: e.target.value })}
                    className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white"
                  >
                    <option value="">Wählen...</option>
                    <option value="true">Aktiv</option>
                    <option value="false">Inaktiv</option>
                  </select>
                ) : (
                  <Input
                    type="number"
                    placeholder="Wert"
                    value={bulkEdit.value}
                    onChange={(e) => setBulkEdit({ ...bulkEdit, value: e.target.value })}
                    className="h-9 w-32 bg-zinc-900"
                  />
                )}
                
                <Button onClick={applyBulkEdit} size="sm" disabled={!bulkEdit.field}>
                  Anwenden
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setBulkEdit({ active: false, field: null, value: '' })}
                >
                  Abbrechen
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Variants Table */}
        {variants.length > 0 ? (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-bold text-zinc-500 uppercase">
              <div className="col-span-1">
                <input
                  type="checkbox"
                  checked={selectedVariants.length === variants.length}
                  onChange={selectAllVariants}
                  className="rounded"
                />
              </div>
              <div className="col-span-2">Farbe</div>
              <div className="col-span-1">Größe</div>
              <div className="col-span-3">SKU</div>
              <div className="col-span-2">Bestand</div>
              <div className="col-span-2">Preis</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Rows */}
            {variants.map((variant) => {
              const color = getColorById(variant.color_id);
              return (
                <motion.div
                  key={variant.id}
                  layout
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 rounded-lg border transition-colors ${
                    selectedVariants.includes(variant.id)
                      ? 'bg-purple-500/10 border-purple-500/30'
                      : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedVariants.includes(variant.id)}
                      onChange={() => toggleVariantSelection(variant.id)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="col-span-2 flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-md border border-white/20"
                      style={{ background: color?.hex || '#666' }}
                    />
                    <span className="text-sm text-white truncate">{color?.name || '-'}</span>
                  </div>
                  
                  <div className="col-span-1 text-sm text-white font-bold">
                    {variant.size || '-'}
                  </div>
                  
                  <div className="col-span-3">
                    <Input
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                      className="h-8 text-xs bg-zinc-900 font-mono"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={variant.stock || 0}
                      onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                      className={`h-8 text-sm bg-zinc-900 ${variant.stock <= 0 ? 'text-red-400' : variant.stock <= 5 ? 'text-amber-400' : 'text-white'}`}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={product?.price?.toString() || '0'}
                      value={variant.price_override || ''}
                      onChange={(e) => updateVariant(variant.id, 'price_override', parseFloat(e.target.value) || null)}
                      className="h-8 text-sm bg-zinc-900"
                    />
                  </div>
                  
                  <div className="col-span-1">
                    <Switch
                      checked={variant.active !== false}
                      onCheckedChange={(checked) => updateVariant(variant.id, 'active', checked)}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Keine Varianten vorhanden</p>
            <p className="text-xs mt-1">Definiere Farben und Größen, dann klicke "Generieren"</p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={saveChanges}
          disabled={saving}
          className="px-8"
          style={{
            background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
            color: '#000'
          }}
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="mr-2"
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Varianten speichern
        </Button>
      </div>
    </div>
  );
}