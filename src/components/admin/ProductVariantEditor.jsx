import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, Trash2, Copy, Upload, X, GripVertical, 
  Palette, Ruler, Package, Image as ImageIcon
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SIZE_TEMPLATES = {
  shoes: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47'],
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
  pants: ['W28 L30', 'W30 L30', 'W30 L32', 'W32 L30', 'W32 L32', 'W34 L32', 'W34 L34', 'W36 L32', 'W36 L34'],
  accessories: ['One Size'],
  bags: ['Small', 'Medium', 'Large'],
  other: ['S', 'M', 'L']
};

export default function ProductVariantEditor({ 
  product, 
  colors, 
  setColors, 
  sizes, 
  setSizes, 
  variants, 
  setVariants,
  productType 
}) {
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [uploading, setUploading] = useState({});

  // Add new color
  const addColor = () => {
    if (!newColorName.trim()) return;
    const newColor = {
      id: `color_${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      images: []
    };
    setColors([...colors, newColor]);
    setNewColorName('');
    setNewColorHex('#000000');
    
    // Auto-generate variants for this color
    if (sizes.length > 0) {
      const newVariants = sizes.map(size => ({
        id: `var_${Date.now()}_${size}`,
        color_id: newColor.id,
        size,
        sku: `${product?.sku || 'SKU'}-${newColor.name.substring(0, 3).toUpperCase()}-${size}`,
        stock: 0,
        active: true
      }));
      setVariants([...variants, ...newVariants]);
    }
  };

  // Remove color
  const removeColor = (colorId) => {
    setColors(colors.filter(c => c.id !== colorId));
    setVariants(variants.filter(v => v.color_id !== colorId));
  };

  // Apply size template
  const applySizeTemplate = (template) => {
    const templateSizes = SIZE_TEMPLATES[template] || [];
    setSizes(templateSizes);
    
    // Generate variants for all colors
    const newVariants = [];
    colors.forEach(color => {
      templateSizes.forEach(size => {
        const existing = variants.find(v => v.color_id === color.id && v.size === size);
        if (!existing) {
          newVariants.push({
            id: `var_${Date.now()}_${color.id}_${size}`,
            color_id: color.id,
            size,
            sku: `${product?.sku || 'SKU'}-${color.name.substring(0, 3).toUpperCase()}-${size}`,
            stock: 0,
            active: true
          });
        }
      });
    });
    if (newVariants.length > 0) {
      setVariants([...variants, ...newVariants]);
    }
  };

  // Update variant stock
  const updateVariantStock = (variantId, stock) => {
    setVariants(variants.map(v => 
      v.id === variantId ? { ...v, stock: parseInt(stock) || 0 } : v
    ));
  };

  // Bulk update stock for color
  const bulkUpdateColorStock = (colorId, stock) => {
    setVariants(variants.map(v => 
      v.color_id === colorId ? { ...v, stock: parseInt(stock) || 0 } : v
    ));
  };

  // Upload image for color
  const uploadColorImage = async (colorId, file) => {
    setUploading({ ...uploading, [colorId]: true });
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setColors(colors.map(c => 
        c.id === colorId 
          ? { ...c, images: [...(c.images || []), file_url] }
          : c
      ));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading({ ...uploading, [colorId]: false });
    }
  };

  // Remove image from color
  const removeColorImage = (colorId, imageUrl) => {
    setColors(colors.map(c => 
      c.id === colorId 
        ? { ...c, images: c.images.filter(img => img !== imageUrl) }
        : c
    ));
  };

  // Set main image (move to first position)
  const setMainImage = (colorId, imageUrl) => {
    setColors(colors.map(c => {
      if (c.id !== colorId) return c;
      const images = c.images.filter(img => img !== imageUrl);
      return { ...c, images: [imageUrl, ...images] };
    }));
  };

  return (
    <div className="space-y-8">
      {/* Colors Section */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-gold" />
          <h3 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>Farben</h3>
        </div>

        {/* Add Color */}
        <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <Input
            value={newColorName}
            onChange={(e) => setNewColorName(e.target.value)}
            placeholder="Farbname (z.B. Schwarz)"
            className="flex-1 min-w-[150px] h-12 bg-white/5 border-white/10 text-white text-base"
          />
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/20"
            />
            <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{newColorHex}</span>
          </div>
          <Button onClick={addColor} className="h-12 px-6 btn-gold">
            <Plus className="w-5 h-5 mr-2" /> Farbe hinzufügen
          </Button>
        </div>

        {/* Color List */}
        <div className="space-y-4">
          {colors.map((color) => (
            <motion.div
              key={color.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg border-2 border-white/20"
                    style={{ background: color.hex }}
                  />
                  <div>
                    <h4 className="text-lg font-bold" style={{ color: 'rgba(255,255,255,0.95)' }}>{color.name}</h4>
                    <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>{color.hex}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Bestand für alle"
                    className="w-32 h-10 bg-white/5 border-white/10 text-white text-sm"
                    onBlur={(e) => bulkUpdateColorStock(color.id, e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    onClick={() => removeColor(color.id)}
                    className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Color Images */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-gold" />
                  <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Bilder ({color.images?.length || 0})
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {color.images?.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={img} 
                        alt="" 
                        className={`w-20 h-20 object-cover rounded-lg ${idx === 0 ? 'ring-2 ring-gold' : ''}`}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                        {idx !== 0 && (
                          <button
                            onClick={() => setMainImage(color.id, img)}
                            className="w-7 h-7 rounded bg-gold/80 flex items-center justify-center"
                            title="Als Hauptbild"
                          >
                            <Package className="w-4 h-4 text-black" />
                          </button>
                        )}
                        <button
                          onClick={() => removeColorImage(color.id, img)}
                          className="w-7 h-7 rounded bg-red-500/80 flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      {idx === 0 && (
                        <span className="absolute -top-1 -left-1 px-1.5 py-0.5 text-[10px] font-bold bg-gold text-black rounded">
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                  <label className="w-20 h-20 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && uploadColorImage(color.id, e.target.files[0])}
                    />
                    {uploading[color.id] ? (
                      <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-white/40" />
                        <span className="text-[10px] text-white/40 mt-1">Upload</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sizes Section */}
      <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 mb-6">
          <Ruler className="w-6 h-6 text-gold" />
          <h3 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>Größen</h3>
        </div>

        {/* Size Templates */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.keys(SIZE_TEMPLATES).map(template => (
            <Button
              key={template}
              variant="outline"
              onClick={() => applySizeTemplate(template)}
              className={`h-10 px-4 text-sm font-bold capitalize ${
                productType === template ? 'bg-gold/20 border-gold text-gold' : 'bg-white/5 border-white/10 text-white/80'
              }`}
            >
              {template === 'shoes' ? 'Schuhe (EU)' : 
               template === 'clothing' ? 'Kleidung (S-3XL)' :
               template === 'pants' ? 'Hosen (W/L)' :
               template === 'accessories' ? 'Accessoires' :
               template === 'bags' ? 'Taschen' : 'Andere'}
            </Button>
          ))}
        </div>

        {/* Current Sizes */}
        <div className="flex flex-wrap gap-2">
          {sizes.map((size, idx) => (
            <span 
              key={idx}
              className="px-4 py-2 rounded-lg text-sm font-bold"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)' }}
            >
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* Variants Table */}
      {colors.length > 0 && sizes.length > 0 && (
        <div className="p-6 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Package className="w-6 h-6 text-gold" />
            <h3 className="text-xl font-black" style={{ color: 'rgba(255,255,255,0.95)' }}>
              Varianten ({variants.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Farbe</th>
                  <th className="text-left py-3 px-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Größe</th>
                  <th className="text-left py-3 px-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>SKU</th>
                  <th className="text-left py-3 px-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Bestand</th>
                  <th className="text-left py-3 px-4 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((variant) => {
                  const color = colors.find(c => c.id === variant.color_id);
                  return (
                    <tr key={variant.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded" style={{ background: color?.hex }} />
                          <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>{color?.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.9)' }}>{variant.size}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{variant.sku}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariantStock(variant.id, e.target.value)}
                          className="w-20 h-9 bg-white/5 border-white/10 text-white text-sm"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          variant.stock > 0 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {variant.stock > 0 ? 'Aktiv' : 'Ausverkauft'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}