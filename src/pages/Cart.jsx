import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Package, ArrowRight, CheckCircle2, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import CartItem from '@/components/cart/CartItem';
import CartUpsell from '@/components/cart/CartUpsell';

export default function Cart() {
  const {
    cartItems,
    products,
    updateQuantity,
    removeFromCart,
    totalPrice,
    totalItems,
    isLoading
  } = useCart();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm font-medium">Warenkorb wird geladen...</span>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 100;
  const shippingProgress = Math.min((totalPrice / freeShippingThreshold) * 100, 100);
  const hasFreeShipping = totalPrice >= freeShippingThreshold;

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
          {totalItems > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-black rounded-full flex items-center justify-center text-sm font-black shadow-lg"
            >
              {totalItems}
            </motion.div>
          )}
        </motion.div>

        <h1 className="text-5xl md:text-6xl font-black mb-4 text-white tracking-tight">
          Warenkorb
        </h1>
        <p className="text-zinc-400 text-lg flex items-center justify-center gap-2">
          {totalItems > 0 ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {totalItems} {totalItems === 1 ? 'Produkt' : 'Produkte'} reserviert für dich
            </>
          ) : (
            'Dein Premium-Warenkorb wartet auf dich'
          )}
        </p>
      </motion.div>

      {/* Free Shipping Progress */}
      {totalItems > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 max-w-2xl mx-auto"
        >
          <div className="glass-panel rounded-2xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-gold" />
                <span className="text-zinc-400 font-medium">
                  {hasFreeShipping ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Gratisversand freigeschaltet!
                    </span>
                  ) : (
                    <>Noch <span className="text-white font-bold">{(freeShippingThreshold - totalPrice).toFixed(2)}€</span> bis Gratisversand</>
                  )}
                </span>
              </div>
            </div>
            <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${shippingProgress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${hasFreeShipping
                  ? 'bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                  : 'bg-gradient-to-r from-gold to-yellow-400 shadow-[0_0_10px_rgba(214,178,94,0.3)]'
                  }`}
              />
            </div>
          </div>
        </motion.div>
      )}

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

            <Link to="/Products">
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
              {cartItems.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  product={products[item.product_id]}
                  updateQuantity={updateQuantity}
                  removeItem={removeFromCart}
                />
              ))}
            </AnimatePresence>

            {/* Smart Upsells */}
            <CartUpsell cartItems={cartItems} />
          </div>

          {/* Checkout Side Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-28 glass-panel rounded-2xl p-8 space-y-6 border border-white/5 bg-black/20"
            >
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-gold/20">
                  <ShoppingBag className="w-5 h-5 text-black" />
                </div>
                <h2 className="text-2xl font-black text-white">Zusammenfassung</h2>
              </div>

              <div className="space-y-4">
                {/* Item summary */}
                <div className="space-y-2 pb-4 border-b border-white/5">
                  {cartItems.map(item => {
                    const product = products[item.product_id];
                    if (!product) return null;
                    let price = product.price;
                    if (item.selected_options?.price && item.selected_options.price > 0) price = item.selected_options.price;
                    return (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400 truncate max-w-[200px]">{product.name} × {item.quantity}</span>
                        <span className="text-zinc-300 font-medium">{(price * item.quantity).toFixed(2)}€</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-zinc-400">
                  <span>Zwischensumme</span>
                  <span>{totalPrice.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Versand</span>
                  {hasFreeShipping ? (
                    <span className="text-emerald-400 text-xs uppercase font-bold bg-emerald-400/10 px-2 py-0.5 rounded">Gratis</span>
                  ) : (
                    <span className="text-zinc-300 text-sm">wird berechnet</span>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                  <span className="text-white font-bold pb-1">Gesamtbetrag</span>
                  <span className="text-3xl font-black text-gold">{totalPrice.toFixed(2)}€</span>
                </div>

                {/* Trust Badges */}
                <div className="bg-white/5 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Sichere Bezahlung & Käuferschutz</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <Truck className="w-4 h-4 text-gold shrink-0" />
                    <span>Premium-Versand innerhalb Deutschlands</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>100% Originalware garantiert</span>
                  </div>
                </div>

                {/* XP Bonus Banner */}
                <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-3 border border-purple-500/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 shrink-0">
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <span className="text-white text-xs font-bold uppercase tracking-wider">XP Bonus</span>
                    <p className="text-purple-300 text-xs">+{Math.floor(totalPrice * 10)} Punkte bei Abschluss</p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full h-14 bg-gold text-black font-black text-lg rounded-xl shadow-lg shadow-gold/20 flex items-center justify-center gap-2 hover:bg-[#EBDDA9] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Zur Kasse ({totalItems})
                </button>

                <Link to="/Products" className="block text-center text-zinc-500 hover:text-white text-sm font-medium transition-colors py-2">
                  ← Weiter einkaufen
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}