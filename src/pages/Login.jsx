import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, ArrowRight, Loader2, Lock } from 'lucide-react';
import { api } from '@/api';
import { setToken } from '@/api/config';
import { useTelegramWebApp, isTelegramWebApp, getTelegramUser, hapticFeedback, openTelegramLink } from '../lib/TelegramWebApp';
import VerificationStatus from '../components/auth/VerificationStatus';
import { createPageUrl } from '../utils';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationHandGesture, setVerificationHandGesture] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [user, setUser] = useState(null);

  useTelegramWebApp();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);

      // Check if we have a token in URL (from Telegram WebApp)
      const token = searchParams.get('token');
      if (token) {
        setToken(token);
        try {
          const userData = await api.auth.me();
          setUser(userData);
          navigate(createPageUrl('Home'));
          return;
        } catch (error) {
          console.error('Token auth failed:', error);
        }
      }

      // Check if running in Telegram WebApp
      if (isTelegramWebApp()) {
        await handleTelegramAuth();
      } else {
        // Not in Telegram - show demo/login options immediately
        // Artificial delay for smooth transition effect
        setTimeout(() => setLoading(false), 800);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const handleTelegramAuth = async () => {
    try {
      const tgUser = getTelegramUser();
      if (!tgUser) {
        setLoading(false);
        return;
      }

      try {
        const tg = window.Telegram?.WebApp;
        const initData = tg?.initData;

        if (initData) {
          const response = await api.auth.telegramWebApp(initData);

          if (response.token) {
            setToken(response.token);
            setUser(response.user);

            if (response.user.verification_status === 'verified') {
              hapticFeedback('notification', 'success');
              navigate(createPageUrl('Home'));
              return;
            } else {
              await loadVerificationStatus(tgUser.id.toString());
            }
          }
        }
      } catch (error) {
        if (error.status === 403 && error.data?.verification_status) {
          await loadVerificationStatus(tgUser.id.toString());
        } else {
          console.error('Telegram auth error:', error);
        }
      }
    } catch (error) {
      console.error('Error in handleTelegramAuth:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationStatus = async (telegramId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/verification/status?telegram_id=${telegramId}`
      );

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.verification_status);
        setVerificationHandGesture(data.verification_hand_gesture);
        setRejectionReason(data.rejection_reason);
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
    }
  };

  const handleRetry = () => {
    hapticFeedback('impact', 'medium');
    if (isTelegramWebApp()) {
      openTelegramLink('https://t.me/NebulaOrderBot');
    } else {
      window.open('https://t.me/NebulaOrderBot', '_blank');
    }
  };

  // Loading Screen
  if (loading && isTelegramWebApp()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0C10] overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0C10] to-[#0A0C10]" />

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="relative z-10 w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#D6B25E] via-purple-500 to-transparent mb-6"
        >
          <div className="w-full h-full bg-[#0A0C10] rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#D6B25E] animate-spin" />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-lg font-light tracking-[0.2em] text-white/50"
        >
          LOADING NEBULA
        </motion.p>
      </div>
    );
  }

  // Verification Status View
  if (isTelegramWebApp() && verificationStatus) {
    return (
      <div className="min-h-screen bg-[#0A0C10]">
        <div className="max-w-2xl mx-auto px-4 py-20">
          <VerificationStatus
            verificationStatus={verificationStatus}
            verificationHandGesture={verificationHandGesture}
            rejectionReason={rejectionReason}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // Main Login / Landing Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0C10] flex items-center justify-center font-sans selection:bg-[#D6B25E]/30">

      {/* 🌌 Advanced Nebula Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1),_rgba(10,12,16,1))]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />

        {/* Animated Orbs */}
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-600/20"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 30, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[130px] bg-[#D6B25E]/10"
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo Section */}
            <div className="text-center mb-12 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 1 }}
                className="relative inline-block group"
              >
                {/* Glow behind logo */}
                <div className="absolute inset-0 bg-[#D6B25E] rounded-[2rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />

                <div className="w-32 h-32 mx-auto mb-8 rounded-[2rem] p-6 relative z-10 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/20">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                    alt="Nebula Supply"
                    className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(214,178,94,0.5)]"
                  />
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl font-black mb-3 tracking-tighter"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 drop-shadow-sm">
                  NEBULA
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-3"
              >
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D6B25E]" />
                <p className="text-[#D6B25E] font-bold tracking-[0.25em] text-xs uppercase">
                  Premium Supply
                </p>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D6B25E]" />
              </motion.div>
            </div>

            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              {/* Primary Action: Enter Shop */}
              <button
                onClick={() => navigate(createPageUrl('Home'))}
                className="group relative w-full"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D6B25E] via-[#F5D98B] to-[#D6B25E] rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-tilt" />
                <div className="relative flex items-center justify-between bg-[#0A0C10] rounded-2xl p-4 leading-none border border-white/10 group-hover:border-[#D6B25E]/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D6B25E]/20 to-[#D6B25E]/5 flex items-center justify-center border border-[#D6B25E]/20 group-hover:scale-105 transition-transform duration-300">
                      <Sparkles className="w-6 h-6 text-[#D6B25E]" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg mb-1 group-hover:text-[#D6B25E] transition-colors">Shop betreten</div>
                      <div className="text-zinc-500 text-xs font-medium tracking-wide">
                        OHNE ANMELDUNG STÖBERN
                      </div>
                    </div>
                  </div>
                  <div className="pr-2">
                    <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-[#D6B25E] group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </button>

              {/* Secondary: Login Options */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    const botUsername = process.env.VITE_BOT_USERNAME || 'your_bot';
                    window.open(`https://t.me/${botUsername}`, '_blank');
                  }}
                  className="group relative overflow-hidden rounded-2xl p-[1px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 group-hover:border-blue-500/50 rounded-2xl p-4 h-full flex flex-col items-center justify-center gap-2 transition-all">
                    <Shield className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-blue-100/80 font-bold text-xs uppercase tracking-wider">Telegram</span>
                  </div>
                </button>

                <button
                  onClick={() => navigate(createPageUrl('Admin'))}
                  className="group relative overflow-hidden rounded-2xl p-[1px]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 group-hover:border-purple-500/50 rounded-2xl p-4 h-full flex flex-col items-center justify-center gap-2 transition-all">
                    <Lock className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform duration-300" />
                    <span className="text-purple-100/80 font-bold text-xs uppercase tracking-wider">Admin</span>
                  </div>
                </button>
              </div>
            </motion.div>

            {/* Footer Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-12 space-y-2"
            >
              <p className="text-[10px] text-zinc-600 font-medium tracking-widest uppercase">
                &copy; 2026 Nebula Supply
              </p>
              <div className="flex justify-center gap-4">
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
