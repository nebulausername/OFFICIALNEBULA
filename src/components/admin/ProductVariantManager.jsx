import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Plus, Trash2, X,
  Palette, Ruler, Package, RefreshCw, Save, ImagePlus, Upload, ImageIcon
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

  // Upload unique variant image (Override)
  const uploadVariantImage = async (variantId, file) => {
    setUploading({ ...uploading, [variantId]: true });
    try {
      const result = await api.integrations.uploadFile({ file });
      updateVariant(variantId, 'image', result.file_url);
      toast({ title: 'Variant-Bild gesetzt' });
    } catch (error) {
      toast({ title: 'Upload fehlgeschlagen', variant: 'destructive' });
      console.error(error);
    } finally {
      setUploading({ ...uploading, [variantId]: false });
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
      // Find existing variants for this color to preserve data (especially overrides)
      const existingColorVariants = variants.filter(v => v.color_id === color.id);

      if (sizes.length > 0) {
        sizes.forEach(size => {
          const existingVariant = existingColorVariants.find(v => v.size === size);

          if (existingVariant) {
            // Keep existing, but update basic fields if needed (optional)
            newVariants.push(existingVariant);
          } else {
            // New variant
            newVariants.push({
              id: `var_${color.id}_${size}_${Date.now()}`,
              color_id: color.id,
              size: size,
              sku: `${product?.sku || 'SKU'}-${color.name?.substring(0, 3).toUpperCase()}-${size}`,
              stock: 0,
              price_override: null,
              active: true,
              image: null // Explicit null for override
            });
          }
        });
      } else {
        // No sizes - create one variant per color
        const existingVariant = existingColorVariants.find(v => !v.size);
        newVariants.push(existingVariant || {
          id: `var_${color.id}_${Date.now()}`,
          color_id: color.id,
          size: null,
          sku: `${product?.sku || 'SKU'}-${color.name?.substring(0, 3).toUpperCase()}`,
          stock: 0,
          price_override: null,
          active: true,
          image: null
        });
      }
    });

    setVariants(newVariants);
    toast({ title: `${newVariants.length} Varianten verwaltet` });
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

  // Helper to determine active image for a variant
  const getVariantDisplayImage = (variant) => {
    if (variant.image) return variant.image; // Explicit override
    const color = getColorById(variant.color_id);
    if (color?.images?.length > 0) return color.images[0]; // Color default
    return null; // None
  };

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
              <h3 className="text-lg font-bold text-white">Farben & Bilder</h3>
              <p className="text-sm text-zinc-400">{colors.length} Farben definiert</p>
            </div>
          </div>
          <Button onClick={addColor} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Farbe hinzufügen
          </Button>
        </div>

        <div className="grid gap-4">
          {colors.map((color, index) => (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700"
            >
              <div className="flex items-start gap-6">
                {/* Color Definitions */}
                <div className="w-64 flex-shrink-0 space-y-4">
                  <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">Bezeichnung</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border border-white/10 flex-shrink-0"
                        style={{ background: color.hex }}
                      />
                      <Input
                        value={color.name}
                        onChange={(e) => updateColor(color.id, 'name', e.target.value)}
                        className="h-10 bg-zinc-900 border-zinc-700 focus:border-purple-500"
                        placeholder="z.B. Midnight Blue"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-zinc-400 mb-1.5 block">Farbwert (Hex)</Label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(color.id, 'hex', e.target.value)}
                          className="w-10 h-10 rounded-lg cursor-pointer opacity-0 absolute inset-0"
                        />
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center pointer-events-none">
                          <div className="w-6 h-6 rounded bg-current" style={{ color: color.hex }} />
                        </div>
                      </div>
                      <Input
                        value={color.hex}
                        onChange={(e) => updateColor(color.id, 'hex', e.target.value)}
                        className="h-10 bg-zinc-900 font-mono text-zinc-400 border-zinc-700"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColor(color.id)}
                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Farbe löschen
                  </Button>
                </div>

                {/* Vertical Divider */}
                <div className="w-px self-stretch bg-zinc-700/50" />

                {/* Image Manager */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-sm font-medium text-white flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-zinc-400" />
                      Galerie & Thumbnails
                    </Label>
                    <span className="text-xs text-zinc-500">
                      Das erste Bild wird als Hauptbild für diese Farbe verwendet.
                    </span>
                  </div>

                  <DragDropContext onDragEnd={(result) => reorderColorImages(color.id, result)}>
                    <Droppable droppableId={`color-images-${color.id}`} direction="horizontal">
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="flex gap-3 flex-wrap"
                        >
                          {(color.images || []).map((img, imgIndex) => (
                            <Draggable key={img} draggableId={img} index={imgIndex}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`relative w-24 h-24 rounded-xl overflow-hidden group border transition-all ${snapshot.isDragging
                                      ? 'border-purple-500 shadow-lg scale-105 z-50'
                                      : 'border-zinc-700 hover:border-zinc-500'
                                    }`}
                                >
                                  <img src={img} alt="" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <button
                                      onClick={() => removeColorImage(color.id, img)}
                                      className="p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {imgIndex === 0 && (
                                    <div className="absolute top-0 right-0 left-0 bg-purple-500/90 text-white text-[10px] font-bold text-center py-1 uppercase tracking-wide">
                                      Main
                                    </div>
                                  )}
                                  <div className="absolute bottom-1 right-2 bg-black/50 rounded text-[10px] px-1 text-white">
                                    {imgIndex + 1}
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {/* Upload Button */}
                          <label
                            className={`w-24 h-24 rounded-xl border-2 border-dashed border-zinc-700 hover:border-purple-500/50 hover:bg-purple-500/5 flex flex-col items-center justify-center cursor-pointer transition-all ${uploading[color.id] ? 'opacity-50 pointer-events-none' : ''
                              }`}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              multiple
                              onChange={(e) => {
                                if (e.target.files?.length) {
                                  Array.from(e.target.files).forEach(file => uploadColorImage(color.id, file));
                                }
                              }}
                            />
                            {uploading[color.id] ? (
                              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                <RefreshCw className="w-6 h-6 text-purple-500" />
                              </motion.div>
                            ) : (
                              <>
                                <Upload className="w-6 h-6 text-zinc-500 mb-1" />
                                <span className="text-[10px] uppercase font-bold text-zinc-500">Add</span>
                              </>
                            )}
                          </label>
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              </div>
            </motion.div>
          ))}

          {colors.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-xl">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-zinc-600" />
              </div>
              <h4 className="text-white font-medium mb-1">Keine Farben definiert</h4>
              <p className="text-zinc-500 text-sm mb-4">Erstelle mindestens eine Farbe, um Varianten zu generieren.</p>
              <Button onClick={addColor} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Erste Farbe hinzufügen
              </Button>
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
              className="h-9 px-3 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              defaultValue=""
            >
              <option value="">Preset laden...</option>
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
              className="pl-3 pr-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold flex items-center gap-2 border border-zinc-700"
            >
              {size}
              <button
                onClick={() => removeSize(size)}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}

          {sizes.length === 0 && (
            <div className="w-full text-center py-6 text-zinc-500 bg-zinc-800/30 rounded-lg dashed border-zinc-800 border">
              Keine Größen definiert (Produkt hat nur Farbvarianten)
            </div>
          )}
        </div>
      </div>

      {/* Visual Variant Builder Section */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Visual Variant Builder</h3>
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
                className="border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                Bulk Edit ({selectedVariants.length})
              </Button>
            )}
            <Button onClick={generateVariants} size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
              <RefreshCw className="w-4 h-4 mr-2" />
              Varianten Generieren
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
              className="mb-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20"
            >
              <div className="flex items-center gap-4">
                <span className="text-amber-500 font-bold text-sm uppercase px-2">Bulk Action:</span>
                <select
                  value={bulkEdit.field || ''}
                  onChange={(e) => setBulkEdit({ ...bulkEdit, field: e.target.value })}
                  className="h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Feld wählen...</option>
                  <option value="stock">Bestand</option>
                  <option value="price_override">Preis Override</option>
                  <option value="active">Status (Aktiv/Inaktiv)</option>
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
                    placeholder="Wert eingeben..."
                    value={bulkEdit.value}
                    onChange={(e) => setBulkEdit({ ...bulkEdit, value: e.target.value })}
                    className="h-9 w-48 bg-zinc-900 border-zinc-700"
                  />
                )}

                <Button onClick={applyBulkEdit} size="sm" disabled={!bulkEdit.field} className="bg-amber-500 text-black hover:bg-amber-600">
                  Auf {selectedVariants.length} Varianten anwenden
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBulkEdit({ active: false, field: null, value: '' })}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Improved Variants Table */}
        {variants.length > 0 ? (
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-zinc-800/80 text-xs font-bold text-zinc-400 uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10">
              <div className="col-span-1 flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedVariants.length === variants.length}
                  onChange={selectAllVariants}
                  className="rounded border-zinc-600 bg-zinc-700 w-4 h-4 cursor-pointer"
                />
              </div>
              <div className="col-span-1 text-center">Bild</div>
              <div className="col-span-3">Variante</div>
              <div className="col-span-3">SKU</div>
              <div className="col-span-2">Bestand</div>
              <div className="col-span-1">Preis</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-zinc-800 bg-zinc-900/50">
              {variants.map((variant) => {
                const color = getColorById(variant.color_id);
                const displayImage = getVariantDisplayImage(variant);

                return (
                  <motion.div
                    key={variant.id}
                    layout
                    className={`grid grid-cols-12 gap-4 items-center px-6 py-4 transition-colors ${selectedVariants.includes(variant.id)
                        ? 'bg-amber-500/5'
                        : 'hover:bg-amber-500/5'
                      }`}
                  >
                    <div className="col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectedVariants.includes(variant.id)}
                        onChange={() => toggleVariantSelection(variant.id)}
                        className="rounded border-zinc-600 bg-zinc-700 w-4 h-4 cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Visual Builder Column */}
                    <div className="col-span-1 flex justify-center">
                      <div className="relative group w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 overflow-hidden cursor-pointer shadow-sm">
                        {displayImage ? (
                          <img src={displayImage} alt="Variant" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                        )}

                        {/* Hover Overlay for Upload */}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all cursor-pointer">
                          {uploading[variant.id] ? (
                            <RefreshCw className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <Upload className="w-4 h-4 text-white" />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) uploadVariantImage(variant.id, e.target.files[0]);
                            }}
                          />
                        </label>

                        {variant.image && (
                          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-bl-md z-10" title="Custom Override Active" />
                        )}
                      </div>
                    </div>

                    <div className="col-span-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-8 rounded-full flex-shrink-0"
                          style={{ background: color?.hex || '#666' }}
                          title={color?.name}
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{color?.name || 'Unbekannt'}</div>
                          {variant.size && (
                            <div className="text-xs text-zinc-400 font-mono">Größe: <span className="text-zinc-300">{variant.size}</span></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-3">
                      <Input
                        value={variant.sku || ''}
                        onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                        className="h-8 text-xs bg-zinc-800 border-zinc-700 font-mono text-zinc-300 focus:border-amber-500"
                        placeholder="SKU-CODE"
                      />
                    </div>

                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={variant.stock || 0}
                        onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value) || 0)}
                        className={`h-8 text-sm bg-zinc-800 border-zinc-700 font-bold ${variant.stock <= 0 ? 'text-red-400 border-red-900/50' :
                            variant.stock <= 5 ? 'text-amber-400' : 'text-green-400'
                          }`}
                      />
                    </div>

                    <div className="col-span-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={product?.price?.toString() || '-'}
                        value={variant.price_override || ''}
                        onChange={(e) => updateVariant(variant.id, 'price_override', parseFloat(e.target.value) || null)}
                        className="h-8 text-sm bg-zinc-800 border-zinc-700 placeholder:text-zinc-600"
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Switch
                        checked={variant.active !== false}
                        onCheckedChange={(checked) => updateVariant(variant.id, 'active', checked)}
                        className="data-[state=checked]:bg-green-500"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-500 bg-zinc-800/30 rounded-xl border border-zinc-800 border-dashed">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium text-zinc-400">Keine Varianten vorhanden</p>
            <p className="text-sm mt-2 max-w-sm mx-auto">
              Definiere zuerst Farben und optional Größen oben, dann klicke auf "Varianten Generieren".
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-4 z-20">
        <div className="backdrop-blur-md bg-zinc-900/90 p-2 rounded-xl border border-zinc-800 shadow-2xl flex gap-3">
          <Button
            onClick={saveChanges}
            disabled={saving}
            size="lg"
            className="px-8 font-bold text-md shadow-lg shadow-amber-500/20"
            style={{
              background: 'linear-gradient(135deg, #FFB800, #FF9500)',
              color: '#000'
            }}
          >
            {saving ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mr-2"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.div>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Änderungen Speichern
          </Button>
        </div>
      </div>
    </div>
  );
}
