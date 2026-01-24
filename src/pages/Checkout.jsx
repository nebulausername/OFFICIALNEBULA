import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ShoppingBag, MapPin, Package, Sparkles, Phone, Mail, User, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNebulaSound } from '@/contexts/SoundContext';

export default function Checkout() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [vipPlans, setVipPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    telegram: '',
    address: '',
    city: '',
    zip: '',
    country: 'Deutschland',
    shippingMethod: 'standard',
    notes: ''
  });

  const { playSuccess, playError } = useNebulaSound();

  const steps = [
    { title: 'Warenkorb', icon: ShoppingBag },
    { title: 'Versand', icon: MapPin },
    { title: 'Bestätigung', icon: Check }
  ];

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const items = await api.entities.StarCartItem.filter({ user_id: userData.id });
      setCartItems(items);

      const plans = await api.entities.VIPPlan.filter({ is_active: true });
      setVipPlans(plans);

      setFormData(prev => ({
        ...prev,
        name: userData.full_name || '',
        email: userData.email || ''
      }));
    } catch (error) {
      console.error('Error loading checkout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemDetails = async (item) => {
    if (item.product_id) {
      const products = await api.entities.Product.filter({ id: item.product_id });
      return products[0];
    }
    return null;
  };

  const calculateTotal = async () => {
    let total = 0;
    for (const item of cartItems) {
      const details = await getItemDetails(item);
      if (details) {
        total += details.price * (item.quantity || 1);
      }
    }
    return total;
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const total = await calculateTotal();

      const request = await api.entities.Request.create({
        user_id: user.id,
        total_sum: total,
        status: 'pending',
        contact_info: {
          name: formData.name,
          phone: formData.phone,
          telegram: formData.telegram,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: formData.country,
          shippingMethod: formData.shippingMethod
        },
        note: formData.notes
      });

      for (const item of cartItems) {
        const details = await getItemDetails(item);
        if (details) {
          await api.entities.RequestItem.create({
            request_id: request.id,
            product_id: item.product_id,
            sku_snapshot: details.sku,
            name_snapshot: details.name,
            price_snapshot: details.price,
            quantity_snapshot: item.quantity || 1,
            selected_options_snapshot: item.selected_options || {}
          });
        }
      }

      for (const item of cartItems) {
        await api.entities.StarCartItem.delete(item.id);
      }

      // Party Time! 🎉
      playSuccess();
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#E8C76A', '#F5D98B', '#FFFFFF'];

      (function frame() {
        const left = end - Date.now();
        if (left <= 0) return; // Stop animation

        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999
        });

        requestAnimationFrame(frame);
      }());

      setTimeout(() => {
        navigate(createPageUrl('OrderConfirmation') + `?orderId=${request.id}`);
      }, 2000); // Slightly longer delay to enjoy the show
    } catch (error) {
      console.error('Error submitting order:', error);
      playError();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-zinc-400">Lädt Checkout...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Dein Warenkorb ist leer</h2>
          <p className="text-zinc-400 mb-6">Füge Produkte hinzu, um fortzufahren</p>
          <Button onClick={() => navigate(createPageUrl('Products'))}>
            Jetzt shoppen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Checkout
          </h1>
          <p className="text-zinc-400">Schließe deine Bestellung ab</p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center z-10">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-all ${isActive
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50'
                        : isCompleted
                          ? 'bg-green-500 shadow-xl shadow-green-500/50'
                          : 'bg-zinc-800 border-2 border-zinc-700'
                        }`}
                    >
                      {isCompleted ? (
                        <Check className="w-8 h-8 text-white" />
                      ) : (
                        <Icon className={`w-8 h-8 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                      )}
                    </motion.div>
                    <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                      {step.title}
                    </span>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="flex-1 h-1 bg-zinc-800 mx-4 relative">
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: index < currentStep ? '100%' : '0%' }}
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <ShoppingBag className="w-8 h-8 text-purple-400" />
                  Deine Artikel
                </h2>

                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <CartItemDisplay key={index} item={item} />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-zinc-800">
                  <div className="flex justify-between items-center text-xl font-black">
                    <span className="text-zinc-400">Zwischensumme:</span>
                    <span className="text-white">Wird berechnet</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(1)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8 py-6 text-lg rounded-2xl"
                >
                  Weiter zur Versandadresse
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-purple-400" />
                  Kontakt & Versand
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      <User className="w-4 h-4 inline mr-2" />
                      Name *
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dein Name"
                      className="bg-zinc-900 border-zinc-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      E-Mail *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="deine@email.de"
                      className="bg-zinc-900 border-zinc-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Telefon
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+49 123 456789"
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      Telegram Username
                    </label>
                    <Input
                      value={formData.telegram}
                      onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                      placeholder="@username"
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Adresse
                    </label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Straße und Hausnummer"
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Stadt
                    </label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Stadt"
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      PLZ
                    </label>
                    <Input
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      placeholder="12345"
                      className="bg-zinc-900 border-zinc-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Versandmethode
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, shippingMethod: 'standard' })}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${formData.shippingMethod === 'standard'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-zinc-700 bg-zinc-900/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white">🇩🇪 Deutschland</span>
                          {formData.shippingMethod === 'standard' && (
                            <Check className="w-5 h-5 text-green-400" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">1-5 Werktage</p>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, shippingMethod: 'express' })}
                        className={`p-6 rounded-2xl border-2 transition-all text-left ${formData.shippingMethod === 'express'
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-zinc-700 bg-zinc-900/50'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white">🇨🇳 China</span>
                          {formData.shippingMethod === 'express' && (
                            <Check className="w-5 h-5 text-orange-400" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-400">8-15 Werktage • -15%</p>
                      </motion.button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-zinc-400 mb-2">
                      Notizen (Optional)
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Besondere Wünsche oder Anmerkungen..."
                      className="bg-zinc-900 border-zinc-700 min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(0)}
                  className="border-zinc-700 text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zurück
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.name || !formData.email}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8"
                >
                  Weiter zur Bestätigung
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl p-6 md:p-8">
                <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                  <Package className="w-8 h-8 text-purple-400" />
                  Bestellung überprüfen
                </h2>

                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <h3 className="font-bold text-white mb-4">Kontaktinformationen</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-500">Name:</span>
                        <p className="text-white font-semibold">{formData.name}</p>
                      </div>
                      <div>
                        <span className="text-zinc-500">E-Mail:</span>
                        <p className="text-white font-semibold">{formData.email}</p>
                      </div>
                      {formData.phone && (
                        <div>
                          <span className="text-zinc-500">Telefon:</span>
                          <p className="text-white font-semibold">{formData.phone}</p>
                        </div>
                      )}
                      {formData.telegram && (
                        <div>
                          <span className="text-zinc-500">Telegram:</span>
                          <p className="text-white font-semibold">{formData.telegram}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Shipping */}
                  {formData.address && (
                    <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                      <h3 className="font-bold text-white mb-4">Versandadresse</h3>
                      <p className="text-white">{formData.address}</p>
                      <p className="text-white">{formData.zip} {formData.city}</p>
                      <p className="text-white">{formData.country}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <h3 className="font-bold text-white mb-4">Bestellte Artikel</h3>
                    <div className="space-y-3">
                      {cartItems.map((item, index) => (
                        <CartItemDisplay key={index} item={item} compact />
                      ))}
                    </div>
                  </div>

                  {/* Important Notice */}
                  <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 rounded-2xl">
                    <div className="flex items-start gap-4">
                      <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-bold text-white mb-2">Wichtiger Hinweis</h3>
                        <p className="text-sm text-zinc-300">
                          Nach dem Absenden wird deine Bestellung als <strong>Anfrage</strong> an unser Team gesendet.
                          Ein Admin wird sich in Kürze bei dir melden, um die Zahlung zu koordinieren und weitere Details zu besprechen.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  disabled={submitting}
                  className="border-zinc-700 text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Zurück
                </Button>
                <Button
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8 text-lg"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Wird gesendet...
                    </>
                  ) : (
                    <>
                      Bestellung absenden
                      <Check className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CartItemDisplay({ item, compact = false }) {
  const [product, setProduct] = useState(null);
  const [vipPlan, setVipPlan] = useState(null);

  useEffect(() => {
    loadItemDetails();
  }, [item]);

  const loadItemDetails = async () => {
    if (item.product_id) {
      const products = await api.entities.Product.filter({ id: item.product_id });
      setProduct(products[0]);
    }
  };

  if (!product && !vipPlan) {
    return (
      <div className="animate-pulse flex gap-4">
        <div className="w-20 h-20 bg-zinc-800 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
          <div className="h-3 bg-zinc-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const displayItem = product || vipPlan;

  if (compact) {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {product?.cover_image && (
            <img src={product.cover_image} alt={displayItem.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div>
            <p className="text-white font-semibold text-sm">{displayItem.name}</p>
            <p className="text-zinc-500 text-xs">Menge: {item.quantity || 1}</p>
          </div>
        </div>
        <p className="text-white font-bold">{displayItem.price}€</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800">
      {product?.cover_image && (
        <img src={product.cover_image} alt={displayItem.name} className="w-24 h-24 rounded-xl object-cover" />
      )}
      <div className="flex-1">
        <h3 className="font-bold text-white mb-1">{displayItem.name}</h3>
        {product?.sku && (
          <p className="text-sm text-zinc-500 mb-2">SKU: {product.sku}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-zinc-400">Menge: {item.quantity || 1}</span>
          <span className="text-xl font-black text-white">{displayItem.price * (item.quantity || 1)}€</span>
        </div>
      </div>
    </div>
  );
}