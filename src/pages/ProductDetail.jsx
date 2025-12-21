import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingBag, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useToast } from '@/components/ui/use-toast';

export default function ProductDetail() {
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [brand, setBrand] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProduct();
  }, []);

  const loadProduct = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');

      if (!productId) {
        toast({
          title: 'Fehler',
          description: 'Produkt nicht gefunden',
          variant: 'destructive'
        });
        return;
      }

      const [productData, productImages] = await Promise.all([
        base44.entities.Product.filter({ id: productId }),
        base44.entities.ProductImage.filter({ product_id: productId })
      ]);

      if (productData.length === 0) {
        toast({
          title: 'Fehler',
          description: 'Produkt nicht gefunden',
          variant: 'destructive'
        });
        return;
      }

      const prod = productData[0];
      setProduct(prod);
      setImages(productImages.sort((a, b) => a.sort_order - b.sort_order));
      setSelectedImage(prod.cover_image || (productImages[0]?.url));

      // Load related data
      if (prod.category_id) {
        const cats = await base44.entities.Category.filter({ id: prod.category_id });
        if (cats.length > 0) setCategory(cats[0]);
      }

      if (prod.brand_id) {
        const brands = await base44.entities.Brand.filter({ id: prod.brand_id });
        if (brands.length > 0) setBrand(brands[0]);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const user = await base44.auth.me();

      // Check if item already in cart
      const existing = await base44.entities.StarCartItem.filter({
        user_id: user.id,
        product_id: product.id
      });

      if (existing.length > 0) {
        await base44.entities.StarCartItem.update(existing[0].id, {
          quantity: existing[0].quantity + quantity,
          selected_options: selectedOptions
        });
      } else {
        await base44.entities.StarCartItem.create({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity,
          selected_options: selectedOptions
        });
      }

      toast({
        title: 'Zum Warenkorb hinzugefügt',
        description: `${quantity}x ${product.name}`
      });

      setTimeout(() => {
        window.location.href = createPageUrl('Cart');
      }, 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht hinzugefügt werden',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-800 rounded w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-zinc-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-zinc-800 rounded w-3/4" />
              <div className="h-4 bg-zinc-800 rounded w-1/2" />
              <div className="h-32 bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h2>
        <Link to={createPageUrl('Products')}>
          <Button>Zurück zu Produkten</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to={createPageUrl('Products')}
        className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Zurück</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-24 h-24 text-zinc-700" />
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {[product.cover_image, ...images.map(img => img.url)]
                .filter(Boolean)
                .map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square bg-zinc-900 border rounded-lg overflow-hidden hover:border-purple-500 transition-colors ${
                      selectedImage === img ? 'border-purple-500' : 'border-zinc-800'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                {product.sku}
              </Badge>
              {brand && (
                <Badge variant="outline" className="text-zinc-400">
                  {brand.name}
                </Badge>
              )}
              {category && (
                <Badge variant="outline" className="text-zinc-400">
                  {category.name}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-purple-400">{product.price}€</span>
              {product.in_stock ? (
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/30">
                  Verfügbar
                </Badge>
              ) : (
                <Badge className="bg-red-500/20 text-red-400 border border-red-500/30">
                  Ausverkauft
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-invert">
              <p className="text-zinc-400 text-lg leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-zinc-800">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Options */}
          {product.option_schema && product.option_schema.options && (
            <div className="space-y-4 p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <h3 className="font-semibold">Optionen</h3>
              {product.option_schema.options.map((option, index) => (
                <div key={index} className="space-y-2">
                  <Label>{option.label}</Label>
                  <Input
                    placeholder={option.placeholder || ''}
                    value={selectedOptions[option.name] || ''}
                    onChange={(e) =>
                      setSelectedOptions({ ...selectedOptions, [option.name]: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Quantity & Add to Cart */}
          {product.in_stock && (
            <div className="space-y-4 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-4">
                <Label>Anzahl:</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleAddToCart}
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                In den Warenkorb
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}