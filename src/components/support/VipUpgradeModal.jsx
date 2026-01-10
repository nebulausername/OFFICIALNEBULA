import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Shield, MessageCircle, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const benefits = [
  { icon: MessageCircle, text: 'Unbegrenzte Support-Tickets' },
  { icon: Zap, text: 'Prioritäts-Support (24h Antwort)' },
  { icon: Shield, text: 'Exklusiver VIP-Status' },
  { icon: Sparkles, text: 'Früher Zugang zu neuen Drops' }
];

export default function VipUpgradeModal({ isOpen, onClose, currentTickets = 2 }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-transparent border-0 p-0 max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] border border-white/10 rounded-3xl p-8 overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>

          {/* Crown Icon */}
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-500/40"
          >
            <Crown className="w-10 h-10 text-white" />
          </motion.div>

          {/* Title */}
          <h2 className="text-2xl font-black text-center text-white mb-2">
            VIP Support freischalten
          </h2>
          <p className="text-zinc-400 text-center text-sm mb-6">
            Du hast bereits {currentTickets}/2 offene Tickets. Upgrade auf VIP für unbegrenzten Support.
          </p>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center">
                  <benefit.icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-white text-sm font-semibold">{benefit.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Link to={createPageUrl('VIP')} className="block">
              <Button className="w-full h-12 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:shadow-xl hover:shadow-amber-500/40 text-black font-black text-base rounded-xl transition-all">
                <Crown className="w-5 h-5 mr-2" />
                VIP werden
              </Button>
            </Link>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full h-10 text-zinc-400 hover:text-white hover:bg-white/5 font-semibold"
            >
              Später
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}