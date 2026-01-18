import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Minus, ShoppingBag, Send, Sparkles, Star, Package, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      const total = calculateTotal();

      // Create request
      const request = await api.entities.Request.create({
        user_id: user.id,
        username: contactInfo.telegram,
        note: note,
        status: 'pending',
        total_sum: total,
        contact_info: contactInfo
      });

      // Create request items
      const itemsList = [];
      for (const item of cartItems) {
        const product = products[item.product_id];
        if (product) {
          await api.entities.RequestItem.create({
            request_id: request.id,
            product_id: product.id,
            sku_snapshot: product.sku,
            name_snapshot: product.name,
            price_snapshot: product.price,
            quantity_snapshot: item.quantity,
            selected_options_snapshot: item.selected_options || {}
          });
          itemsList.push(`${item.quantity}x ${product.name} (${product.price}€)`);
        }
      }

      // Send notifications
      try {
        const telegramMessage = `
🌟 *NEUE BESTELLUNG - NEBULA SUPPLY* 🌟
━━━━━━━━━━━━━━━━━━━━

👤 *Kunde:* ${contactInfo.name}
📞 *Telefon:* ${contactInfo.phone}
${contactInfo.telegram ? `💬 *Telegram:* ${contactInfo.telegram}` : ''}

🛍️ *Bestellung:*
${itemsList.map(item => `  • ${item}`).join('\n')}

💰 *Gesamtsumme:* ${total.toFixed(2)}€

${note ? `📝 *Notiz:* ${note}` : ''}

🆔 *Anfrage-ID:* ${request.id}
📧 *User-Email:* ${user.email}

━━━━━━━━━━━━━━━━━━━━
⚡ Nebula Supply
        `.trim();

        await api.integrations.sendEmail({
          to: user.email,
          subject: '✨ Bestellung eingegangen - Nebula Supply',
          body: `Hallo ${contactInfo.name},\n\nDeine Bestellung wurde erfolgreich aufgegeben!\n\nWir melden uns schnellstmöglich bei dir.\n\nGesamtsumme: ${total.toFixed(2)}€\n\nViele Grüße,\nDein Nebula Supply Team`
        });

        await api.integrations.sendEmail({
          to: 'admin@nebulasupply.com',
          subject: `🌟 Neue Bestellung #${request.id}`,
          body: telegramMessage
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
      }

      // Clear cart
      for (const item of cartItems) {
        await api.entities.StarCartItem.delete(item.id);
      }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="h-48 skeleton rounded-2xl"
              />
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="h-96 skeleton rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center relative"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 180],
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
          />
        </div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 glow-effect shadow-2xl shadow-purple-500/50 relative"
        >
          <ShoppingBag className="w-10 h-10 text-white" />
          {cartItems.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-sm font-bold shadow-lg"
            >
              {cartItems.length}
            </motion.div>
          )}
        </motion.div>

        <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
          Warenkorb
        </h1>
        <p className="text-zinc-300 text-xl flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {cartItems.length > 0 ? `${cartItems.length} ${cartItems.length === 1 ? 'Produkt' : 'Produkte'} in deinem Warenkorb` : 'Dein Premium-Warenkorb wartet auf dich'}
        </p>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
          
          <div className="relative z-10">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-8 glow-effect shadow-2xl shadow-purple-500/50"
            >
              <ShoppingBag className="w-16 h-16 text-white" />
            </motion.div>
            
            <h2 className="text-4xl font-black mb-4">Warenkorb ist leer</h2>
            <p className="text-zinc-400 text-xl mb-10 max-w-md mx-auto">
              Entdecke unsere exklusive Auswahl an Premium-Produkten
            </p>
            
            <Link to={createPageUrl('Products')}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="neon-button px-10 py-5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl font-black text-xl shadow-2xl shadow-purple-500/50 inline-flex items-center gap-3 animate-gradient"
              >
                <Package className="w-6 h-6" />
                Jetzt einkaufen
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cartItems.map((item, index) => {
                const product = products[item.product_id];
                if (!product) return null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 5 }}
                    className="group glass backdrop-blur-xl border-2 border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all relative"
                  >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    
                    <div className="flex gap-6 p-6 relative z-10">
                      {/* Image */}
                      <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="relative w-32 h-32 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg"
                      >
                        {(item.selected_options?.image || product.cover_image) ? (
                          <img
                            src={item.selected_options?.image || product.cover_image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-12 h-12 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 bg-black/80 backdrop-blur rounded-lg text-xs font-mono text-purple-300 font-bold">
                          {item.selected_options?.sku || product.sku}
                        </div>
                      </motion.div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0 pr-4">
                            <h3 className="font-black text-xl mb-2 truncate group-hover:text-purple-400 transition-colors">{product.name}</h3>
                            <p className="text-sm text-zinc-500 flex items-center gap-2">
                              <Star className="w-3 h-3 text-purple-400" />
                              Einzelpreis: <span className="font-bold text-purple-400">{getItemPrice(item, product).toFixed(2)}€</span>
                            </p>
                            {item.selected_options?.color_name && (
                              <div className="flex items-center gap-2 mt-1">
                                <div className="w-4 h-4 rounded" style={{ background: item.selected_options.color_hex }} />
                                <span className="text-xs font-bold text-white">{item.selected_options.color_name}</span>
                                {item.selected_options.size && (
                                  <span className="text-xs font-bold text-zinc-400">• {item.selected_options.size}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeItem(item.id)}
                            className="flex-shrink-0 p-3 rounded-xl hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border-2 border-transparent hover:border-red-500/30"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        </div>

                        {/* Options */}
                        {item.selected_options && Object.keys(item.selected_options).length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {Object.entries(item.selected_options).map(([key, value]) => (
                              <motion.div 
                                key={key}
                                whileHover={{ scale: 1.05 }}
                                className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-xs text-purple-300 font-semibold"
                              >
                                {key}: <span className="text-purple-400">{value}</span>
                              </motion.div>
                            ))}
                          </div>
                        )}

                        {/* Quantity & Price */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 glass border-2 border-zinc-800 rounded-xl p-1.5">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-500/20 transition-all"
                            >
                              <Minus className="w-4 h-4" />
                            </motion.button>
                            <span className="w-14 text-center font-black text-xl">{item.quantity}</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-purple-500/20 transition-all"
                            >
                              <Plus className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-zinc-500 mb-1 font-semibold">Summe</div>
                            <motion.div 
                              key={item.quantity}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient"
                            >
                              {(getItemPrice(item, product) * item.quantity).toFixed(2)}€
                            </motion.div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Checkout */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 glass backdrop-blur-xl border-2 border-zinc-800 rounded-2xl p-8 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-zinc-800">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Send className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Checkout
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2">
                    Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    placeholder="Dein vollständiger Name"
                    className="h-12 bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 transition-all rounded-xl text-lg"
                  />
                </div>

                <div>
                  <Label className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2">
                    Telegram Username <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={contactInfo.telegram}
                    onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                    placeholder="@deinusername"
                    className="h-12 bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 transition-all rounded-xl text-lg"
                  />
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Hauptkontaktweg für deine Bestellung
                  </p>
                </div>

                {!isFromTelegram() && (
                  <div>
                    <Label className="text-sm font-bold text-zinc-300 mb-2 flex items-center gap-2">
                      Telefon <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+49 123 456789"
                      className="h-12 bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 transition-all rounded-xl text-lg"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-sm font-bold text-zinc-300 mb-2">Notiz (optional)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Besondere Wünsche, Fragen oder Anmerkungen..."
                    className="bg-zinc-900/50 border-2 border-zinc-700 focus:border-purple-500 transition-all rounded-xl"
                    rows={3}
                  />
                </div>
              </div>

              <div className="pt-6 border-t-2 border-zinc-800 space-y-6">
                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/30">
                  <span className="text-lg font-bold text-zinc-300">Gesamt:</span>
                  <motion.span 
                    key={calculateTotal()}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                  >
                    {calculateTotal().toFixed(2)}€
                  </motion.span>
                </div>

                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="neon-button w-full h-16 text-lg font-black bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl shadow-2xl shadow-purple-500/50 glow-effect disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-gradient relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {submitting ? (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Wird verarbeitet...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 relative z-10">
                      <CheckCircle2 className="w-6 h-6" />
                      Jetzt bestellen
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </motion.button>

                <p className="text-xs text-center text-zinc-500 flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Bestellbestätigung per Email
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}