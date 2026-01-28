import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Shield, ArrowRight, User } from 'lucide-react';
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
        setLoading(false);
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

      // Try to authenticate via Telegram WebApp
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
              // Load verification status
              await loadVerificationStatus(tgUser.id.toString());
            }
          }
        }
      } catch (error) {
        if (error.status === 403 && error.data?.verification_status) {
          // User not verified
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
      // Open Telegram bot
      openTelegramLink('https://t.me/NebulaOrderBot');
    } else {
      // For non-Telegram, show instructions
      window.open('https://t.me/NebulaOrderBot', '_blank');
    }
  };

  // Skip loading screen if not in Telegram (instant access)
  if (loading && isTelegramWebApp()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0C10]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-transparent border-t-[#D6B25E] rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/70"
        >
          Nebula wird geladen...
        </motion.p>
      </div>
    );
  }

  // Show verification status if in Telegram
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

  // Guest / Login Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0C10] flex items-center justify-center">
      {/* 🌌 Nebula Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15), transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(214, 178, 94, 0.1), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo Section */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-center mb-12"
          >
            <div className="relative inline-block">
              <motion.div
                className="absolute inset-0 rounded-3xl blur-2xl opacity-40"
                animate={{ background: ['rgba(214,178,94,0)', 'rgba(214,178,94,0.3)', 'rgba(214,178,94,0)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="w-28 h-28 mx-auto mb-6 rounded-[2rem] p-5 relative z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(24px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
                }}
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                  alt="Nebula Supply"
                  className="w-full h-full object-contain drop-shadow-xl"
                />
              </div>
            </div>

            <h1 className="text-5xl font-black mb-2 tracking-tight">
              <span className="text-white drop-shadow-lg">
                NEBULA
              </span>
            </h1>
            <p className="text-[#D6B25E] font-bold tracking-[0.2em] text-sm uppercase">
              Premium Lifestyle Supply
            </p>
          </motion.div>

          {/* Action Card */}
          <div className="space-y-4">
            {/* Primary Action: Enter Shop */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Home'))}
              className="w-full group relative overflow-hidden rounded-2xl p-[1px]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D6B25E] via-[#F5D98B] to-[#D6B25E] opacity-70 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#121212] rounded-2xl p-4 flex items-center justify-between group-hover:bg-[#1a1a1a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D6B25E]/10 flex items-center justify-center text-[#D6B25E]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">Shop betreten</div>
                    <div className="text-white/50 text-xs">Ohne Anmeldung stöbern</div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[#D6B25E] group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

            {/* Secondary: Login */}
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const botUsername = process.env.VITE_BOT_USERNAME || 'your_bot';
                  window.open(`https://t.me/${botUsername}`, '_blank');
                }}
                className="bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <Shield className="w-6 h-6 text-blue-400" />
                <span className="text-blue-200 font-bold text-sm">Telegram Login</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(createPageUrl('Admin'))}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-colors"
              >
                <User className="w-6 h-6 text-white/60" />
                <span className="text-white/60 font-bold text-sm">Admin Login</span>
              </motion.button>
            </div>
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-12"
          >
            <p className="text-xs text-white/30 font-medium">
              &copy; 2026 Nebula Supply. All Rights Reserved.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
