import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Crown, Zap, Shield, MessageCircle, Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function VipUpgradeModal({ isOpen, onClose }) {
  const benefits = [
    { icon: MessageCircle, text: 'Unbegrenzte offene Tickets' },
    { icon: Zap, text: 'Prioritäts-Support & schnellere Antworten' },
    { icon: Shield, text: 'VIP Badge & Status' },
    { icon: Star, text: 'Exklusive Produkte & Early Access' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-zinc-900 to-black border-2 border-purple-500/30 max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4 text-zinc-400" />
        </button>

        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-amber-500/40"
            >
              <Crown className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent mb-2">
              VIP Upgrade
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              Unbegrenzte Tickets & Priorität
            </p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm font-semibold text-center">
              Du hast bereits 2 offene Tickets.
              <br />
              Upgrade auf VIP für unbegrenzten Support.
            </p>
          </div>

          <div className="space-y-3">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-white text-sm font-medium">{benefit.text}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
          >
            Später
          </Button>
          <Link to={createPageUrl('VIP')} className="flex-1">
            <Button className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:shadow-xl hover:shadow-amber-500/40 text-black font-black">
              <Crown className="w-4 h-4 mr-2" />
              VIP werden
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}