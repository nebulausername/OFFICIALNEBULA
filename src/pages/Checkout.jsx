import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Package, CheckCircle2, MessageCircle, ShoppingBag, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
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
  const [totalPrice, setTotalPrice] = useState(0);

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

  // Mock Data for Auto-Complete
  const MOCK_ZIPS = {
    '10115': 'Berlin',
    '20095': 'Hamburg',
    '80331': 'München',
    '50667': 'Köln',
    '60311': 'Frankfurt am Main',
    '70173': 'Stuttgart'
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  };

  const calculateXP = (total) => Math.floor(total * 10);

  const steps = [
    { title: 'Versand', icon: MapPin },
    { title: 'Versand', icon: MapPin },
    { title: 'Zahlung', icon: CheckCircle2 },
    { title: 'Handover', icon: MessageCircle }
  ];

  const [completedOrder, setCompletedOrder] = useState(null);

  const [productsMap, setProductsMap] = useState({});

  useEffect(() => {
    loadCheckoutData();
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      calculateTotal().then(setTotalPrice);
    }
  }, [cartItems]);

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

      // TELEGRAM AUTO-FILL 🚀
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tgUser = window.Telegram.WebApp.initDataUnsafe?.user;
        if (tgUser) {
          setFormData(prev => ({
            ...prev,
            name: prev.name || `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            telegram: prev.telegram || (tgUser.username ? `@${tgUser.username}` : '')
          }));
        }
      }
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

  const handleZipChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, zip: val }));

    if (MOCK_ZIPS[val]) {
      setFormData(prev => ({ ...prev, zip: val, city: MOCK_ZIPS[val] }));
      playSuccess();
    }
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    try {
      const total = await calculateTotal();

      const request = await api.entities.Request.create({
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
        note: formData.notes,
        cart_items: cartItems.map(item => ({ id: item.id }))
      });

      playSuccess();
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#D6B25E', '#F2D27C', '#FFFFFF'];

      (function frame() {
        const left = end - Date.now();
        if (left <= 0) return;

        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          zIndex: 9999
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          zIndex: 9999
        });

        requestAnimationFrame(frame);
      }());

      setCompletedOrder(request);
      setCurrentStep(2); // Go to Handover Step
    } catch (error) {
      console.error('Error submitting order:', error);
      playError();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white selection:bg-gold/30 font-sans pb-20">
      {/* Navbar Minimal */}
      <div className="glass-panel sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div onClick={() => navigate(-1)} className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-medium hidden sm:inline">Zurück</span>
          </div>
          <div className="font-black text-xl tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-gold" />
            SECURE CHECKOUT
          </div>
          <div className="w-[70px]"></div>
        </div>
      </div>

      {/* Gamification Bar - Dynamic 🚀 */}
      <div className="bg-gradient-to-r from-purple-900/10 via-purple-900/20 to-purple-900/10 border-b border-purple-500/10 py-3 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-medium">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              <Sparkles className="w-4 h-4 text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xs uppercase tracking-wider">Dein XP Boost</span>
              <span className="text-purple-300 text-xs">+{calculateXP(totalPrice)} Punkte bei Abschluss</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex-1 sm:w-48 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative group">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalPrice / 150) * 100, 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] relative"
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </motion.div>
            </div>
            <span className="text-zinc-400 text-xs whitespace-nowrap">
              {totalPrice >= 150 ?
                <span className="text-emerald-400 font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> VIP Status</span> :
                <span>Noch <span className="text-white font-bold">{(150 - totalPrice).toFixed(2)}€</span> bis VIP</span>
              }
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Form & Steps */}
          <div className="lg:col-span-7 space-y-8">

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-8">
              {steps.map((step, i) => (
                <div key={i} className={`flex items-center gap-2 ${i <= currentStep ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${currentStep > i ? 'bg-gold border-gold text-black' :
                    currentStep === i ? 'border-gold text-gold shadow-[0_0_10px_rgba(214,178,94,0.3)]' :
                      'border-zinc-700 text-zinc-500'
                    }`}>
                    {currentStep > i ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`hidden sm:inline font-bold text-sm ${currentStep === i ? 'text-white' : 'text-zinc-500'}`}>{step.title}</span>
                  {i < steps.length - 1 && (
                    <div className="w-8 h-0.5 bg-zinc-800 mx-2" />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={currentStep}>
              {currentStep === 0 && (
                <motion.div
                  key="step0"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-black mb-6 text-white">Versanddetails</h2>

                  {/* Express Shipping Option */}
                  <div
                    onClick={() => setFormData({ ...formData, shippingMethod: formData.shippingMethod === 'express' ? 'standard' : 'express' })}
                    className={`cursor-pointer group relative overflow-hidden p-6 rounded-2xl border transition-all ${formData.shippingMethod === 'express'
                      ? 'border-gold bg-gold/5 shadow-[0_0_20px_rgba(214,178,94,0.1)]'
                      : 'border-white/10 bg-white/5 hover:border-gold/30'
                      }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.shippingMethod === 'express' ? 'bg-gold text-black' : 'bg-white/10 text-zinc-400'}`}>
                          <Package size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white">Express Lieferung</h3>
                          <p className="text-zinc-400 text-sm">Bevorzugte Behandlung (2-4 Tage)</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-bold text-emerald-400 text-sm bg-emerald-400/10 px-2 py-1 rounded">SCHNELLER</span>
                        {formData.shippingMethod === 'express' && <CheckCircle2 className="text-gold ml-auto mt-2" />}
                      </div>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Name</label>
                      <Input
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white"
                        placeholder="Max Mustermann"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">E-Mail</label>
                      <Input
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white"
                        placeholder="max@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Straße & Hausnummer</label>
                      <Input
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white"
                        placeholder="Musterstraße 123"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">PLZ <span className="text-gold text-[10px]">AUTO-FILL</span></label>
                      <Input
                        value={formData.zip}
                        onChange={handleZipChange}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white"
                        placeholder="10115"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Stadt</label>
                      <Input
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white"
                        placeholder="Berlin"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2"><MessageCircle className="w-3 h-3" /> Telegram</label>
                      <Input
                        value={formData.telegram}
                        onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                        className="h-12 bg-black/20 border-white/10 focus:border-gold rounded-xl text-white pl-10 relative"
                        placeholder="@username"
                      />
                      {/* Note: Icon positioning would be better with a wrapper in Input component or absolute div here, kept simple for now */}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={() => setCurrentStep(1)}
                      disabled={!formData.name || !formData.email || !formData.address}
                      className="w-full h-14 bg-white text-black hover:bg-zinc-200 font-black text-lg rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                    >
                      Weiter zur Zahlung
                    </Button>
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-3xl font-black mb-6 text-white">Bezahlung</h2>

                  <div className="p-6 glass-panel rounded-2xl mb-8 border border-gold/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-gold/20 text-gold flex items-center justify-center border border-gold/30">
                        <CheckCircle2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Bestellung prüfen & absenden</h3>
                        <p className="text-zinc-400 text-sm max-w-md">Deine Bestellung wird sicher übertragen. Du erhältst anschließend Details zur Zahlung (Krypto / PayPal).</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full h-14 bg-gradient-to-r from-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black text-lg rounded-xl shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Verarbeite...
                      </span>
                    ) : 'Kostenpflichtig Bestellen'}
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
              <div className="glass-panel p-6 rounded-2xl border border-white/5">
                <h3 className="font-black text-xl text-white mb-6 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  Zusammenfassung
                </h3>
                <CheckoutSummary
                  cartItems={cartItems}
                  products={productsMap}
                  total={cartItems.reduce((sum, item) => {
                    const p = productsMap[item.product_id];
                    let price = p?.price || 0;
                    if (item.selected_options?.price) price = item.selected_options.price;
                    else if (item.selected_options?.variant_id) {
                      const v = p?.variants?.find(v => v.id === item.selected_options.variant_id);
                      if (v?.price_override) price = v.price_override;
                    }
                    return sum + (price * item.quantity);
                  }, 0)}
                />
              </div>

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
