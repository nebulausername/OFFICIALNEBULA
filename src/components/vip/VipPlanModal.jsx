import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Check, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VipPlanModal({ isOpen, onClose, plan, onConfirm }) {
  if (!plan) return null;

  const planColors = {
    lifetime: {
      gradient: 'from-purple-500 to-pink-500',
      glow: 'shadow-purple-500/50',
      text: 'text-purple-400'
    },
    weekly: {
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'shadow-blue-500/50',
      text: 'text-blue-400'
    },
    monthly: {
      gradient: 'from-amber-500 to-yellow-500',
      glow: 'shadow-amber-500/50',
      text: 'text-amber-400'
    }
  };

  const colors = planColors[plan.type] || planColors.lifetime;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg"
            >
              {/* Glow Effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 60px rgba(168, 85, 247, 0.4)`,
                    `0 0 100px rgba(236, 72, 153, 0.6)`,
                    `0 0 60px rgba(168, 85, 247, 0.4)`,
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"
              />

              {/* Card */}
              <div className="relative glass backdrop-blur-2xl border-2 border-white/10 rounded-3xl p-8 shadow-2xl">
                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-300" />
                </motion.button>

                {/* Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className={`w-20 h-20 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 ${colors.glow} shadow-2xl`}
                >
                  <Crown className="w-10 h-10 text-white" />
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-black text-center text-white mb-3"
                >
                  VIP Plan hinzufügen?
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-center text-zinc-400 mb-8"
                >
                  Möchtest du <span className={`font-bold ${colors.text}`}>{plan.name}</span> zu deinem Warenkorb hinzufügen?
                </motion.p>

                {/* Plan Details */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className={`bg-gradient-to-br ${colors.gradient} bg-opacity-10 border-2 border-white/10 rounded-2xl p-6 mb-8`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-white">{plan.name}</span>
                    <div className="text-right">
                      <div className={`text-4xl font-black bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                        {plan.price}€
                      </div>
                      <div className="text-xs text-zinc-400">{plan.period}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {plan.features?.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <Check className={`w-4 h-4 ${colors.text}`} />
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  {/* Cancel Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-6 py-4 bg-zinc-800/80 hover:bg-zinc-700 border-2 border-zinc-700 rounded-xl font-black text-white transition-all"
                  >
                    Nein, abbrechen
                  </motion.button>

                  {/* Confirm Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    className={`relative flex-1 px-6 py-4 bg-gradient-to-r ${colors.gradient} hover:opacity-90 rounded-xl font-black text-white transition-all overflow-hidden group ${colors.glow} shadow-xl`}
                  >
                    {/* Shine Effect */}
                    <motion.div
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                    />
                    
                    {/* Content */}
                    <span className="relative flex items-center justify-center gap-2">
                      <ShoppingCart className="w-5 h-5" />
                      Ja, zum Warenkorb
                    </span>
                  </motion.button>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sichere Zahlung & sofortige Aktivierung</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}