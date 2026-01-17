import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ArrowRight, Home, MessageCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (orderId) {
      loadOrder(orderId);
      fireConfetti();
    } else {
      navigate(createPageUrl('Home'));
    }
  }, []);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#8B5CF6', '#EC4899', '#F59E0B'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  const loadOrder = async (orderId) => {
    try {
      const requests = await api.entities.Request.filter({ id: orderId });
      if (requests.length > 0) {
        setOrder(requests[0]);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Bestellung nicht gefunden</p>
          <Button onClick={() => navigate(createPageUrl('Home'))}>
            Zur Startseite
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.15),transparent_50%)]"
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 40px rgba(34, 197, 94, 0.4)',
                  '0 0 80px rgba(34, 197, 94, 0.6)',
                  '0 0 40px rgba(34, 197, 94, 0.4)',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-16 h-16 text-white" />
            </motion.div>
            
            {/* Orbiting Sparkles */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <Sparkles className="absolute -top-2 left-1/2 w-6 h-6 text-yellow-400" />
              <Sparkles className="absolute top-1/2 -right-2 w-5 h-5 text-purple-400" />
              <Sparkles className="absolute -bottom-2 left-1/2 w-5 h-5 text-pink-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent mb-4">
            Anfrage erfolgreich gesendet!
          </h1>
          <p className="text-xl text-zinc-400">
            Vielen Dank für deine Bestellung bei <span className="text-purple-400 font-bold">Nebula Supply</span>
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass backdrop-blur-xl border-2 border-zinc-800 rounded-3xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
            <div>
              <p className="text-sm text-zinc-500 mb-1">Bestellnummer</p>
              <p className="text-2xl font-black text-white font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <Package className="w-12 h-12 text-purple-400" />
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="text-zinc-400">Status</span>
              <span className="px-4 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-bold">
                Ausstehend
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Gesamtsumme</span>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {order.total_sum}€
              </span>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-2 border-purple-500/30 rounded-2xl">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-white mb-2">Was passiert jetzt?</h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Unser Team wurde über deine Bestellung informiert und wird sich in Kürze bei dir melden, 
                  um die Zahlungsdetails zu besprechen und deine Bestellung zu bestätigen. 
                  Du erhältst eine Benachrichtigung per E-Mail und/oder Telegram.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Profile'))}
              className="p-6 glass backdrop-blur-xl border-2 border-zinc-800 hover:border-purple-500/50 rounded-2xl text-left group transition-all"
            >
              <Package className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Bestellungen ansehen</h3>
              <p className="text-sm text-zinc-400">
                Verfolge den Status deiner Bestellungen
              </p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Products'))}
              className="p-6 glass backdrop-blur-xl border-2 border-zinc-800 hover:border-pink-500/50 rounded-2xl text-left group transition-all"
            >
              <Home className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="font-bold text-white mb-2">Weiter shoppen</h3>
              <p className="text-sm text-zinc-400">
                Entdecke weitere Premium-Produkte
              </p>
            </motion.button>
          </div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="text-center"
          >
            <Button
              onClick={() => navigate(createPageUrl('Home'))}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold px-8 py-6 text-lg rounded-2xl"
            >
              Zur Startseite
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}