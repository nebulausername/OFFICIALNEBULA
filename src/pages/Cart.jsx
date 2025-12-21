import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Minus, ShoppingBag, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useToast } from '@/components/ui/use-toast';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    phone: '',
    telegram: ''
  });
  const [note, setNote] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const user = await base44.auth.me();
      const items = await base44.entities.StarCartItem.filter({ user_id: user.id });
      setCartItems(items);

      // Load product details
      const productIds = [...new Set(items.map(item => item.product_id))];
      const productData = {};
      
      for (const id of productIds) {
        const prods = await base44.entities.Product.filter({ id });
        if (prods.length > 0) {
          productData[id] = prods[0];
        }
      }
      
      setProducts(productData);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast({
        title: 'Fehler',
        description: 'Warenkorb konnte nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await base44.entities.StarCartItem.update(itemId, { quantity: newQuantity });
      setCartItems(cartItems.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: 'Fehler',
        description: 'Menge konnte nicht aktualisiert werden',
        variant: 'destructive'
      });
    }
  };

  const removeItem = async (itemId) => {
    try {
      await base44.entities.StarCartItem.delete(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast({
        title: 'Entfernt',
        description: 'Produkt wurde aus dem Warenkorb entfernt'
      });
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Fehler',
        description: 'Produkt konnte nicht entfernt werden',
        variant: 'destructive'
      });
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = products[item.product_id];
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmitRequest = async () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Warenkorb leer',
        description: 'Füge zuerst Produkte hinzu',
        variant: 'destructive'
      });
      return;
    }

    if (!contactInfo.name || !contactInfo.phone) {
      toast({
        title: 'Fehlende Informationen',
        description: 'Bitte fülle alle Pflichtfelder aus',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = await base44.auth.me();
      const total = calculateTotal();

      // Create request
      const request = await base44.entities.Request.create({
        user_id: user.id,
        username: contactInfo.telegram,
        note: note,
        status: 'pending',
        total_sum: total,
        contact_info: contactInfo
      });

      // Create request items
      for (const item of cartItems) {
        const product = products[item.product_id];
        if (product) {
          await base44.entities.RequestItem.create({
            request_id: request.id,
            product_id: product.id,
            sku_snapshot: product.sku,
            name_snapshot: product.name,
            price_snapshot: product.price,
            quantity_snapshot: item.quantity,
            selected_options_snapshot: item.selected_options || {}
          });
        }
      }

      // Clear cart
      for (const item of cartItems) {
        await base44.entities.StarCartItem.delete(item.id);
      }

      toast({
        title: 'Anfrage gesendet!',
        description: 'Wir melden uns bald bei dir'
      });

      setTimeout(() => {
        window.location.href = createPageUrl('Requests');
      }, 1500);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Fehler',
        description: 'Anfrage konnte nicht gesendet werden',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-32 bg-zinc-800 rounded" />
          <div className="h-32 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold mb-8">Warenkorb</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <ShoppingBag className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Dein Warenkorb ist leer</h2>
          <p className="text-zinc-400 mb-6">Füge Produkte hinzu, um eine Anfrage zu stellen</p>
          <Link to={createPageUrl('Products')}>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
              Produkte entdecken
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = products[item.product_id];
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex gap-6">
                    {/* Image */}
                    <div className="w-24 h-24 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                      {product.cover_image ? (
                        <img
                          src={product.cover_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-8 h-8 text-zinc-600" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-zinc-400">{product.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>

                      {/* Options */}
                      {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                        <div className="text-sm text-zinc-400 mb-3">
                          {Object.entries(item.selected_options).map(([key, value]) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="text-xl font-bold text-purple-400">
                          {(product.price * item.quantity).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Checkout */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
              <h2 className="text-2xl font-bold">Kontaktinformationen</h2>

              <div className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    placeholder="Dein Name"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Telefon *</Label>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="+49..."
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Telegram Username</Label>
                  <Input
                    value={contactInfo.telegram}
                    onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                    placeholder="@username"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Notiz</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Zusätzliche Informationen..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Gesamt:</span>
                  <span className="text-3xl font-bold text-purple-400">
                    {calculateTotal().toFixed(2)}€
                  </span>
                </div>

                <Button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 transition-transform"
                >
                  {submitting ? (
                    'Wird gesendet...'
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Anfrage senden
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}