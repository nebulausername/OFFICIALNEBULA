import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShoppingBag, Send, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useToast } from '@/components/ui/use-toast';
import CartItem from '@/components/cart/CartItem';

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
      const user = await api.auth.me();
      const items = await api.entities.StarCartItem.filter({ user_id: user.id });
      setCartItems(items);

      // Load product details
      const productIds = [...new Set(items.map(item => item.product_id))];
      const productData = {};

      for (const id of productIds) {
        const prods = await api.entities.Product.filter({ id });
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
      await api.entities.StarCartItem.update(itemId, { quantity: newQuantity });
      setCartItems(cartItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));

      toast({
        title: '✓ Aktualisiert',
        description: 'Menge wurde geändert'
      });
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
      await api.entities.StarCartItem.delete(itemId);
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast({
        title: '🗑️ Entfernt',
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

  const getItemPrice = (item, product) => {
    // First check for price stored in selected_options
    if (item.selected_options?.price && item.selected_options.price > 0) {
      return item.selected_options.price;
    }
    // Then check for variant price override in product variants
    if (item.selected_options?.variant_id && product?.variants) {
      const variant = product.variants.find(v => v.id === item.selected_options.variant_id);
      if (variant?.price_override) {
        return variant.price_override;
      }
    }
    return product?.price || 0;
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const product = products[item.product_id];
      const price = getItemPrice(item, product);
      return sum + (price * item.quantity);
    }, 0);
  };

  const isFromTelegram = () => {
    return window.Telegram?.WebApp?.initData || false;
  };

  const handleSubmitRequest = async () => {
    if (cartItems.length === 0) {
      toast({
        title: '🛒 Warenkorb leer',
        description: 'Füge zuerst Produkte hinzu',
        variant: 'destructive'
      });
      return;
    }

    if (!contactInfo.name || !contactInfo.telegram) {
      toast({
        title: '⚠️ Fehlende Informationen',
        description: 'Name und Telegram Username sind erforderlich',
        variant: 'destructive'
      });
      return;
    }

    // Telefon ist nur Pflicht wenn nicht von Telegram
    if (!isFromTelegram() && !contactInfo.phone) {
      toast({
        title: '⚠️ Telefonnummer erforderlich',
        description: 'Bitte gib deine Telefonnummer ein',
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    try {
      const user = await api.auth.me();

      const request = await api.entities.Request.create({
        contact_info: contactInfo,
        note: note,
        cart_items: cartItems.map(item => ({ id: item.id }))
      });

      toast({
        title: '🎉 Bestellung erfolgreich aufgegeben!',
        description: 'Du erhältst eine Bestätigung per Email'
      });

      setTimeout(() => {
        window.location.href = createPageUrl('Requests');
      }, 2000);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: '❌ Fehler',
        description: 'Anfrage konnte nicht gesendet werden',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center relative"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]" />
        </div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30 relative z-10"
        >
          <ShoppingBag className="w-10 h-10 text-white" />
          {cartItems.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-black rounded-full flex items-center justify-center text-sm font-black shadow-lg"
            >
              {cartItems.length}
            </motion.div>
          )}
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black mb-4 text-white tracking-tight">
          Warenkorb
        </h1>
        <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
          {cartItems.length > 0 ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {cartItems.length} {cartItems.length === 1 ? 'Produkt' : 'Produkte'} reserviert für dich
            </>
          ) : (
            'Dein Premium-Warenkorb wartet auf dich'
          )}
        </p>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-16 rounded-3xl text-center relative overflow-hidden max-w-2xl mx-auto"
        >
          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10"
            >
              <Package className="w-14 h-14 text-zinc-600" />
            </motion.div>

            <h2 className="text-3xl font-black mb-4 text-white">Noch nichts gefunden?</h2>
            <p className="text-zinc-400 text-lg mb-10 max-w-sm">
              Stöbere durch unsere exklusiven Kollektionen und finde deine neuen Favoriten.
            </p>

            <Link to={createPageUrl('Products')}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gold text-black rounded-xl font-black text-lg shadow-lg shadow-gold/20 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Zum Shop
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <CartItem
                  key={item.id}
                  item={item}
                  product={products[item.product_id]}
                  updateQuantity={updateQuantity}
                  removeItem={removeItem}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Checkout Side Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-28 glass-panel rounded-2xl p-8 space-y-6"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                  <Send className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white">Anfrage</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold ml-1">Dein Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="bg-black/20 border-white/10 focus:border-gold h-12 rounded-xl text-white"
                    placeholder="Name eingeben"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold ml-1">Telegram Username <span className="text-red-500">*</span></Label>
                  <Input
                    value={contactInfo.telegram}
                    onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                    className="bg-black/20 border-white/10 focus:border-gold h-12 rounded-xl text-white"
                    placeholder="@username"
                  />
                </div>

                {!isFromTelegram() && (
                  <div className="space-y-2">
                    <Label className="text-zinc-400 font-bold ml-1">Telefonnummer <span className="text-red-500">*</span></Label>
                    <Input
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      className="bg-black/20 border-white/10 focus:border-gold h-12 rounded-xl text-white"
                      placeholder="+49 170 1234567"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-zinc-400 font-bold ml-1">Notiz</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="bg-black/20 border-white/10 focus:border-gold rounded-xl text-white min-h-[80px]"
                    placeholder="Optional..."
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-zinc-400 font-bold pb-1">Gesamtbetrag</span>
                  <span className="text-3xl font-black text-white">{calculateTotal().toFixed(2)}€</span>
                </div>

                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-14 bg-gold text-black font-black text-lg rounded-xl shadow-lg shadow-gold/20 flex items-center justify-center gap-2 hover:bg-[#EBDDA9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Anfrage senden
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}