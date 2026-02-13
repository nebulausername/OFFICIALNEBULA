import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Package, CheckCircle2, MessageCircle, ShoppingBag, MapPin, Sparkles, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNebulaSound } from '@/contexts/SoundContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/components/ui/use-toast';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import CheckoutTrust from '@/components/checkout/CheckoutTrust';

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalPrice, products, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [vipPlans, setVipPlans] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // totalPrice is now from context

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
  const { toast } = useToast();
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    console.log('Checkout Component Mounted 🚀');
  }, []);

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



  const steps = [
    { title: 'Versand', icon: MapPin },
    { title: 'Bestätigung', icon: CheckCircle2 },
    { title: 'Ticket', icon: MessageCircle }
  ];

  // Products map from context
  // products is already destructured from useCart()

  const [completedOrder, setCompletedOrder] = useState(null);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      if (cartItems.length === 0 && !loading) {
        navigate('/shop');
        return;
      }

      const userData = await api.auth.me();
      setUser(userData);

      // Cart items and products are now loaded from context, no need to fetch here
      // But we might want to wait for them?
      // For now, valid checkout requires cartItems > 0, which is handled in renderer or context

      const plans = await api.entities.VIPPlan.filter({ is_active: true });
      setVipPlans(plans);

      setFormData(prev => ({
        ...prev,
        name: userData.full_name || '',
        email: userData.email || ''
      }));
    } catch (error) {
      console.warn('Checkout: Failed to load user data (User might be guest or session expired)', error);
      // Do not block checkout for 401, just don't pre-fill
    } finally {
      setLoading(false);

      // TELEGRAM AUTO-FILL 🚀
      if (typeof window !== 'undefined' && window['Telegram']?.WebApp) {
        const tgUser = window['Telegram'].WebApp.initDataUnsafe?.user;
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

  const handleZipChange = (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, zip: val }));

    if (MOCK_ZIPS[val]) {
      setFormData(prev => ({ ...prev, zip: val, city: MOCK_ZIPS[val] }));
      playSuccess();
    }
  };

  /* 
     * -------------------------------------------------------------------------
     * PREMIUM SUBMISSION FLOW
     * -------------------------------------------------------------------------
     */
  const [submissionStep, setSubmissionStep] = useState('idle'); // idle, processing, verifying, encrypting, success

  const handleSubmitOrder = async () => {
    if (submissionStep !== 'idle') return;

    console.log('🚀 Starting Checkout Submission...');
    try {
      // STEP 1: Processing
      console.log('Phase 1: Processing...');
      setSubmissionStep('processing');
      await new Promise(r => setTimeout(r, 800));

      // STEP 2: Verifying Data
      console.log('Phase 2: Verifying...');
      setSubmissionStep('verifying');
      // Simulate verification delay
      await new Promise(r => setTimeout(r, 1200));

      // Check if API exists before proceeding
      if (!api || !api.entities || !api.entities.Request) {
        throw new Error('System error: API client not initialized. Please refresh.');
      }

      // STEP 3: Encrypting / Finalizing
      console.log('Phase 3: Encrypting & Sending to API...');
      setSubmissionStep('encrypting');

      const total = totalPrice;

      const requestData = {
        contact_info: {
          name: formData.name,
          phone: formData.phone || '', // Ensure strings
          telegram: formData.telegram || '',
          email: formData.email,
        },
        shipping_address: {
          street: formData.address,
          city: formData.city,
          postal_code: formData.zip, // Schema expects postal_code
          country: formData.country,
        },
        payment_method: 'prepayment', // Required by schema
        note: formData.notes || '',
        cart_items: cartItems.map(item => ({ id: item.id }))
      };

      console.log('Payload:', requestData);

      const request = await api.entities.Request.create(requestData);
      console.log('Request Created:', request);

      if (!request || !request.id) {
        throw new Error('Failed to create request: No ID returned');
      }

      // Create Ticket
      try {
        await api.entities.Ticket.create({
          user_id: user?.id,
          type: 'order',
          subject: `Bestellung #${request.id?.slice(0, 8) || 'NEU'}`,
          message: `Neue Bestellung eingegangen!\n\nKunde: ${formData.name}\nE-Mail: ${formData.email}\nTelegram: ${formData.telegram || '-'}\nAdresse: ${formData.address}, ${formData.zip} ${formData.city}\n\nGesamtsumme: ${total.toFixed(2)}€\nVersand: ${formData.shippingMethod === 'express' ? 'Express' : 'Standard'}`,
          status: 'open',
          priority: formData.shippingMethod === 'express' ? 'high' : 'normal',
          metadata: {
            order_id: request.id,
            total: total,
            items_count: cartItems.length
          }
        });
      } catch (ticketError) {
        console.warn('Ticket creation failed (non-critical):', ticketError);
      }

      setSubmissionStep('success');
      playSuccess();

      // Confetti Explosion
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#D6B25E', '#F2D27C', '#FFFFFF'];

      (function frame() {
        const left = end - Date.now();
        if (left <= 0) return;

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

      setCompletedOrder(request);
      await clearCart();

      // Redirect with a slight delay to show success state
      setTimeout(() => {
        navigate(`/ticket/${request.id}`);
      }, 1500);

    } catch (error) {
      console.error('❌ Error submitting order:', error);
      playError();
      setSubmissionStep('idle');

      const message = error.message || "Ein unbekannter Fehler ist aufgetreten.";
      setErrorMsg(message);

      toast({
        variant: "destructive",
        title: "Fehler bei der Anfrage",
        description: message,
        duration: 5000,
      });
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
                  <h2 className="text-3xl font-black mb-6 text-white">Bestätigung & Anfrage</h2>

                  <div className="p-8 glass-panel rounded-2xl mb-8 border border-gold/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all duration-1000 group-hover:bg-gold/20" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 text-gold flex items-center justify-center border border-gold/30 shadow-[0_0_15px_rgba(214,178,94,0.2)] shrink-0">
                        <MessageCircle size={32} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold text-white text-xl">Bestellung als Anfrage senden</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-lg">
                          Deine Bestellung wird als unverbindliche Anfrage an unser Team gesendet.
                          Wir prüfen die Verfügbarkeit und melden uns <strong>sofort per Live-Chat</strong> bei dir zurück.
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-300">Keine sofortige Zahlung</span>
                          <span className="text-xs font-bold px-2 py-1 rounded bg-white/5 border border-white/10 text-zinc-300">Persönlicher Support</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitOrder}
                    disabled={submissionStep !== 'idle'}
                    className={`w-full h-16 relative overflow-hidden font-black text-xl rounded-xl transition-all 
                      ${submissionStep === 'idle'
                        ? 'bg-gradient-to-r from-gold via-[#F2D27C] to-[#D6B25E] hover:brightness-110 text-black shadow-[0_0_20px_rgba(214,178,94,0.3)] hover:scale-[1.01] active:scale-[0.99]'
                        : 'bg-zinc-800 text-white cursor-default'}`}
                  >
                    <AnimatePresence mode="wait">
                      {submissionStep === 'idle' && (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 justify-center"
                        >
                          <span className="relative z-10">Kostenpflichtig anfragen</span>
                          <ArrowLeft className="w-5 h-5 rotate-180 relative z-10" />
                        </motion.span>
                      )}

                      {submissionStep === 'processing' && (
                        <motion.span
                          key="processing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 justify-center text-zinc-400"
                        >
                          <span className="w-5 h-5 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                          <span>Verarbeite Bestellung...</span>
                        </motion.span>
                      )}

                      {submissionStep === 'verifying' && (
                        <motion.span
                          key="verifying"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 justify-center text-blue-400"
                        >
                          <ShieldCheck className="w-5 h-5 animate-pulse" />
                          <span>Prüfe Verfügbarkeit...</span>
                        </motion.span>
                      )}

                      {submissionStep === 'encrypting' && (
                        <motion.span
                          key="encrypting"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3 justify-center text-purple-400"
                        >
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <span>Finalisiere Ticket...</span>
                        </motion.span>
                      )}

                      {submissionStep === 'success' && (
                        <motion.span
                          key="success"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 justify-center text-emerald-400"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          <span>Erfolgreich!</span>
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Progress Bar Background */}
                    {(submissionStep !== 'idle' && submissionStep !== 'success') && (
                      <motion.div
                        className="absolute bottom-0 left-0 h-1 bg-white/20"
                        initial={{ width: '0%' }}
                        animate={{ width: submissionStep === 'processing' ? '30%' : submissionStep === 'verifying' ? '70%' : '100%' }}
                        transition={{ duration: 1 }}
                      />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep(0)}
                    disabled={submitting}
                    className="w-full mt-4 text-zinc-500 hover:text-white hover:bg-white/5 h-12"
                  >
                    Zurück zu den Details
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
                  products={products}
                  total={totalPrice}
                />
              </div>

              {/* Support Section */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transition-all group-hover:bg-blue-500/20" />

                <h3 className="font-bold text-lg text-white mb-2 flex items-center gap-2 relative z-10">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  Brauchst du Hilfe?
                </h3>
                <p className="text-zinc-400 text-sm mb-4 relative z-10">
                  Hast du Fragen zur Bestellung oder zum Versand? Erstelle ein Ticket und wir helfen dir sofort.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-blue-500/30 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 relative z-10 bg-black/40 backdrop-blur-md"
                  onClick={() => navigate('/Tickets')}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Support Ticket erstellen
                </Button>
              </div>

              {/* Desktop Trust badges */}
              <div className="hidden lg:block">
                <CheckoutTrust />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
