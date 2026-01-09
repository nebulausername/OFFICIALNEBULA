import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, Minus, ShoppingBag, Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
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
        title: '🛒 Warenkorb leer',
        description: 'Füge zuerst Produkte hinzu',
        variant: 'destructive'
      });
      return;
    }

    if (!contactInfo.name || !contactInfo.phone) {
      toast({
        title: '⚠️ Fehlende Informationen',
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
      const itemsList = [];
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
          itemsList.push(`${item.quantity}x ${product.name} (${product.price}€)`);
        }
      }

      // Send Telegram notification (Open Beta)
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
⚡ Open Beta - Nebula Supply
        `.trim();

        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: '✨ Bestellung eingegangen - Nebula Supply',
          body: `Hallo ${contactInfo.name},\n\nDeine Bestellung wurde erfolgreich aufgegeben!\n\nWir melden uns schnellstmöglich bei dir.\n\nGesamtsumme: ${total.toFixed(2)}€\n\nViele Grüße,\nDein Nebula Supply Team`
        });

        // Note: For actual Telegram integration, you would need to set up a Telegram bot
        // This sends an email notification instead for now
        await base44.integrations.Core.SendEmail({
          to: 'admin@nebulasupply.com', // Replace with actual admin email
          subject: `🌟 Neue Bestellung #${request.id}`,
          body: telegramMessage
        });
      } catch (notificationError) {
        console.error('Notification error:', notificationError);
        // Continue even if notification fails
      }

      // Clear cart
      for (const item of cartItems) {
        await base44.entities.StarCartItem.delete(item.id);
      }

      toast({
        title: '🎉 Anfrage erfolgreich gesendet!',
        description: 'Wir melden uns schnellstmöglich bei dir'
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
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 glass backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Anfrage senden
                </h2>
              </div>

              <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-300">
                    <strong>Open Beta:</strong> Wir bearbeiten deine Anfrage manuell und melden uns schnellstmöglich!
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-zinc-400">Name *</Label>
                  <Input
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    placeholder="Dein vollständiger Name"
                    className="mt-2 h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-zinc-400">Telefon *</Label>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    placeholder="+49 123 456789"
                    className="mt-2 h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <Label className="text-sm font-semibold text-zinc-400">Telegram Username (empfohlen)</Label>
                  <Input
                    value={contactInfo.telegram}
                    onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                    placeholder="@deinusername"
                    className="mt-2 h-12 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors"
                  />
                  <p className="text-xs text-zinc-500 mt-1">Für schnellere Kommunikation</p>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-zinc-400">Notiz (optional)</Label>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Besondere Wünsche, Fragen oder Anmerkungen..."
                    className="mt-2 bg-zinc-900/50 border-zinc-700 focus:border-purple-500 transition-colors"
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

                <motion.button
                  onClick={handleSubmitRequest}
                  disabled={submitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="neon-button w-full h-16 text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-xl shadow-2xl shadow-purple-500/50 glow-effect disabled:opacity-50 disabled:cursor-not-allowed transition-all animate-gradient"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Wird verarbeitet...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Send className="w-5 h-5" />
                      Verbindlich anfragen
                      <Sparkles className="w-4 h-4" />
                    </div>
                  )}
                </motion.button>

                <p className="text-xs text-center text-zinc-500">
                  Deine Anfrage wird per Email bestätigt
                </p>
                </div>
                </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}