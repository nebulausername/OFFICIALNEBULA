import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Package, CheckCircle2, MessageCircle, ShoppingBag, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNebulaSound } from '@/contexts/SoundContext';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import CheckoutTrust from '@/components/checkout/CheckoutTrust';

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

  const [productsMap, setProductsMap] = useState({});

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const userData = await api.auth.me();
      setUser(userData);

      const items = await api.entities.StarCartItem.filter({ user_id: userData.id });
      setCartItems(items);

      // Load products for map
      const pMap = {};
      const productIds = [...new Set(items.map(i => i.product_id).filter(Boolean))];
      for (const pid of productIds) {
        const res = await api.entities.Product.filter({ id: pid });
        if (res[0]) pMap[pid] = res[0];
      }
      setProductsMap(pMap);

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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500/30 font-sans pb-20">
      {/* Navbar Minimal */}
      <div className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={() => navigate(-1)} className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <span className="font-medium">Zurück</span>
          </div>
          <div className="font-black text-xl tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            NEBULA CHECKOUT
          </div>
          <div className="w-[70px]"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Form & Steps */}
          <div className="lg:col-span-7 space-y-8">

            {/* Progress Steps (Simpler) */}
            <div className="flex items-center gap-4 mb-8">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-center gap-2 ${i <= currentStep ? 'text-white' : 'text-zinc-600'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${i < currentStep ? 'bg-emerald-500 border-emerald-500' :
                    i === currentStep ? 'border-purple-500 text-purple-400' :
                      'border-zinc-700 text-zinc-600'
                    }`}>
                    {i < currentStep ? <Check size={14} /> : i + 1}
                  </div>
                  <span className="hidden sm:inline font-bold text-sm">{step.title}</span>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-zinc-800 mx-2" />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-black mb-6">Versanddetails</h2>

                  {/* Express Shipping Option */}
                  <div
                    onClick={() => setFormData({ ...formData, shippingMethod: formData.shippingMethod === 'express' ? 'standard' : 'express' })}
                    className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border-2 transition-all ${formData.shippingMethod === 'express'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700'
                      }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.shippingMethod === 'express' ? 'bg-purple-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                          <Package size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">Express Lieferung</h3>
                          <p className="text-zinc-400 text-sm">Direkt aus China (8-15 Tage)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-emerald-400">-15% Rabatt</span>
                        {formData.shippingMethod === 'express' && <CheckCircle2 className="text-purple-500 ml-auto mt-2" />}
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">Vollständiger Name</label>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                        placeholder="Max Mustermann"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">E-Mail Adresse</label>
                      <Input
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                        placeholder="max@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">Adresse</label>
                      <Input
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                        placeholder="Musterstraße 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">PLZ</label>
                      <Input
                        value={formData.zip}
                        onChange={e => setFormData({ ...formData, zip: e.target.value })}
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                        placeholder="12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">Stadt</label>
                      <Input
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="h-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                        placeholder="Berlin"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-zinc-400 ml-1">Telegram (für Updates)</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <Input
                          value={formData.telegram}
                          onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                          className="h-12 pl-12 bg-zinc-900 border-zinc-800 focus:border-purple-500 rounded-xl"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      disabled={!formData.name || !formData.email || !formData.address}
                      className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black text-lg rounded-xl"
                    >
                      Weiter
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h2 className="text-3xl font-black mb-6">Zahlungsmethode</h2>

                  <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Anfrage senden</h3>
                        <p className="text-zinc-400 text-sm">Wir prüfen deine Bestellung und senden dir einen Zahlungslink (PayPal / Krypto).</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg rounded-xl shadow-xl shadow-purple-500/20"
                  >
                    {submitting ? 'Verarbeite...' : 'Kostenpflichtig Bestellen'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(0)}
                    className="w-full mt-4 text-zinc-500 hover:text-white"
                  >
                    Zurück zu Details
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Trust badges */}
            <div className="lg:hidden">
              <CheckoutTrust />
            </div>
          </div>

          {/* Right Column: Summary (Sticky) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-6">
              <CheckoutSummary
                cartItems={cartItems}
                products={productsMap}
                total={cartItems.reduce((sum, item) => {
                  const p = productsMap[item.product_id];
                  let price = p?.price || 0;

                  // Handle price overrides
                  if (item.selected_options?.price) price = item.selected_options.price;
                  else if (item.selected_options?.variant_id) {
                    const v = p?.variants?.find(v => v.id === item.selected_options.variant_id);
                    if (v?.price_override) price = v.price_override;
                  }

                  return sum + (price * item.quantity);
                }, 0)}
              />

              {/* Desktop Trust badges */}
              <div className="hidden lg:block">
                <CheckoutTrust />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

