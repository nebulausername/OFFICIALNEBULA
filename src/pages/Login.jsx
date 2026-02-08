import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, ArrowRight, Loader2, Key, Smartphone, Github, Chrome, Fingerprint } from 'lucide-react'; // Added icons
import { api } from '@/api';
import { setToken } from '@/api/config';
import { insforge } from '@/lib/insforge'; // Import InsForge client
import { useTelegramWebApp, isTelegramWebApp, getTelegramUser, hapticFeedback, openTelegramLink } from '../lib/TelegramWebApp';
import VerificationStatus from '../components/auth/VerificationStatus';
import CodeLoginModal from '../components/auth/CodeLoginModal';
import BiometricGate from '../components/auth/BiometricGate'; // Import BiometricGate
import { createPageUrl } from '../utils';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationHandGesture, setVerificationHandGesture] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [user, setUser] = useState(null);
  const [showCodeLogin, setShowCodeLogin] = useState(false);
  const [bioVerified, setBioVerified] = useState(false); // New state

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

  const handleSocialLogin = async (provider) => {
    try {
      const redirectUrl = `${window.location.origin}/login`;
      const { error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: redirectUrl,
        // @ts-ignore
        options: {
          queryParams: {
            redirect_to: redirectUrl
          }
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Social login error:', error);
    }
  };

  // Loading Screen
  if (loading && isTelegramWebApp()) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0C10] overflow-hidden relative">
        {/* ... existing loading content ... */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0A0C10] to-[#0A0C10]" />
        <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="relative z-10 w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#D6B25E] via-purple-500 to-transparent mb-6">
          <div className="w-full h-full bg-[#0A0C10] rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#D6B25E] animate-spin" />
          </div>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-lg font-light tracking-[0.2em] text-white/50">LOADING NEBULA</motion.p>
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
            verificationSubmittedAt={user?.verification_submitted_at}
            onRetry={handleRetry}
          />
        </div>
      </div>
    );
  }

  // BIOMETRIC GATE - BLOCKS LOGIN UNTIL VERIFIED
  // Only show if NOT loading, and NOT in Telegram Web App (users there are auth'd via TG)
  // If user explicitly asks for Google/Github, they presumably are on web.
  if (!loading && !isTelegramWebApp() && !bioVerified) {
    return <BiometricGate onVerified={() => setBioVerified(true)} />;
  }

  // Main Login / Landing Page
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0A0C10] flex items-center justify-center font-sans selection:bg-[#D6B25E]/30">

      {/* 🌌 Advanced Nebula Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(17,24,39,1),_rgba(10,12,16,1))]" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        {/* Animated Orbs */}
        <motion.div animate={{ x: [0, 50, 0], y: [0, -30, 0], scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] bg-purple-600/20" />
        <motion.div animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1.2, 1, 1.2], opacity: [0.1, 0.15, 0.1] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[130px] bg-[#D6B25E]/10" />
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
              {/* ... (Logo code unchanged) ... */}
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 1 }} className="relative inline-block group">
                <div className="absolute inset-0 bg-[#D6B25E] rounded-[2rem] blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
                <div className="w-32 h-32 mx-auto mb-8 rounded-[2rem] p-6 relative z-10 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/20">
                  <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png" alt="Nebula Supply" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(214,178,94,0.5)]" />
                </div>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-5xl font-black mb-3 tracking-tighter">
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50 drop-shadow-sm">NEBULA</span>
              </motion.h1>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center justify-center gap-3">
                <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#D6B25E]" />
                <p className="text-[#D6B25E] font-bold tracking-[0.25em] text-xs uppercase">Premium Supply</p>
                <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#D6B25E]" />
              </motion.div>

              {/* Verified Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-4 h-4 text-green-500" />
                <span className="text-green-500 text-[10px] font-mono tracking-widest uppercase">Biometric Verified</span>
              </motion.div>
            </div>

            {/* Action Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              {/* Social Login Buttons - Revealed after Biometric */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleSocialLogin('google')}
                  className="flex items-center justify-center gap-3 bg-white text-black p-4 rounded-xl font-bold hover:bg-zinc-200 transition-colors"
                >
                  <Chrome className="w-5 h-5" />
                  Google
                </button>
                <button
                  onClick={() => handleSocialLogin('github')}
                  className="flex items-center justify-center gap-3 bg-[#24292e] text-white p-4 rounded-xl font-bold hover:bg-[#2f363d] transition-colors border border-white/10"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </button>
              </div>

              <div className="relative flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-zinc-500 uppercase tracking-widest">Or Classic Login</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Telegram Login */}
              <button onClick={() => { const botUsername = import.meta.env.VITE_BOT_USERNAME || 'NebulaOrderBot'; window.open(`https://t.me/${botUsername}`, '_blank'); }} className="group relative w-full overflow-hidden rounded-2xl">
                <div className="relative bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0088cc]/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[#0088cc]" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-base mb-0.5">Telegram Login</div>
                      <div className="text-zinc-500 text-xs font-medium">Auto-Sync</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#0088cc]/50 group-hover:text-[#0088cc] transition-colors" />
                </div>
              </button>

              {/* Code Login */}
              <button onClick={() => setShowCodeLogin(true)} className="group relative w-full overflow-hidden rounded-2xl">
                <div className="relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-4 flex items-center justify-between transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                      <Key className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-semibold text-base mb-0.5">Passcode Login</div>
                      <div className="text-zinc-500 text-xs font-medium">Legacy Access</div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                </div>
              </button>

              {/* Preview Button */}
              <button onClick={() => navigate(createPageUrl('Home'))} className="w-full text-center text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors pt-4">
                Continue as Guest
              </button>

            </motion.div>

            {/* Footer */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center mt-12 space-y-2">
              <p className="text-[10px] text-zinc-600 font-medium tracking-widest uppercase">&copy; 2026 Nebula Supply</p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <CodeLoginModal isOpen={showCodeLogin} onClose={() => setShowCodeLogin(false)} onSuccess={(userData) => { setUser(userData); navigate(createPageUrl('Home')); }} />
    </div>
  );
}
