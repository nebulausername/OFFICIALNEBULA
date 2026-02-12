import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ArrowRight, Loader2, Key, Fingerprint, Lock } from 'lucide-react';
import { api } from '@/api';
import { setToken } from '@/api/config';
import { apiClient } from '@/api/config';
import { insforge } from '@/lib/insforge';
import { useAuth } from '@/lib/AuthContext';
import { useTelegramWebApp, isTelegramWebApp, getTelegramUser, hapticFeedback } from '../lib/TelegramWebApp';
import VerificationStatus from '../components/auth/VerificationStatus';
import CodeLoginModal from '../components/auth/CodeLoginModal';
import WelcomeOverlay from '../components/onboarding/WelcomeOverlay';
import LoginBackground from '../components/auth/LoginBackground';
import SocialLoginButtons from '../components/auth/SocialLoginButtons';
import { createPageUrl } from '../utils';
import { toast } from 'sonner';

import { useNebulaSound } from '@/contexts/SoundContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAppState } = useAuth();
  const { playHover, playClick, playError, playSuccess } = useNebulaSound();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationHandGesture, setVerificationHandGesture] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(null);
  const [user, setUser] = useState(null);
  const [showCodeLogin, setShowCodeLogin] = useState(false);

  // Welcome Overlay State
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');

  useTelegramWebApp();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setLoading(true);

      // === 1. Check for InsForge OAuth Session (Google/GitHub/Apple callback) ===
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');

      if (accessToken) {
        console.log('🔑 OAuth callback detected...');
        try {
          const { data } = await insforge.auth.getCurrentSession();
          const session = data?.session;

          if (session?.user) {
            await syncOAuthUser(session).catch(e => console.warn('Backend sync failed:', e));
            await checkAppState();
            window.history.replaceState(null, '', window.location.pathname);

            playSuccess();

            // Check if this is first login
            const isFirstLogin = !localStorage.getItem('nebula_welcomed');
            if (isFirstLogin) {
              localStorage.setItem('nebula_welcomed', 'true');
              setWelcomeUserName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Legend');
              setShowWelcome(true);
            } else {
              toast.success('Willkommen zurück!', {
                description: 'Du wurdest erfolgreich angemeldet.',
                duration: 2000,
              });
              navigate(createPageUrl('Home'));
            }
            return;
          }
        } catch (err) {
          console.error('OAuth sync failed:', err);
          playError();
          toast.error('Login fehlgeschlagen', {
            description: 'Wir konnten deine Sitzung nicht verifizieren. Bitte versuche es erneut.'
          });
        }
      }

      // === 2. Check for existing session ===
      try {
        const { data } = await insforge.auth.getCurrentSession();
        if (data?.session?.user) {
          navigate(createPageUrl('Home'));
          return;
        }
      } catch (e) { }

      // === 3. Telegram WebApp ===
      if (isTelegramWebApp()) {
        await handleTelegramAuth();
      } else {
        setTimeout(() => setLoading(false), 800);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setLoading(false);
    }
  };

  const syncOAuthUser = async (session) => {
    try {
      const igUser = session.user;
      const payload = {
        email: igUser.email,
        provider: igUser.app_metadata?.provider || 'oauth',
        provider_id: igUser.id,
        full_name: igUser.user_metadata?.full_name || igUser.user_metadata?.name || '',
        avatar_url: igUser.user_metadata?.avatar_url || '',
        oauth_token: session.access_token
      };

      try {
        return await api.auth.login(payload);
      } catch (loginErr) {
        return await api.auth.register(payload);
      }
    } catch (err) {
      console.error('Sync error:', err);
      return null;
    }
  };

  const handleTelegramAuth = async () => {
    try {
      const tgUser = getTelegramUser();
      if (!tgUser) { setLoading(false); return; }

      const tg = window.Telegram?.WebApp;
      if (tg?.initData) {
        const response = await api.auth.telegramWebApp(tg.initData);
        if (response.token) {
          setToken(response.token);
          setUser(response.user);
          if (response.user.verification_status === 'verified') {
            navigate(createPageUrl('Home'));
            return;
          } else {
            await loadVerificationStatus(tgUser.id.toString());
          }
        }
      }
    } catch (error) {
      if (error.status === 403) await loadVerificationStatus(getTelegramUser()?.id.toString());
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationStatus = async (telegramId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/verification/status?telegram_id=${telegramId}`);
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.verification_status);
        setVerificationHandGesture(data.verification_hand_gesture);
        setRejectionReason(data.rejection_reason);
      }
    } catch (error) { }
  };

  const handleSocialLogin = async (provider) => {
    try {
      playClick();
      const { error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
    } catch (error) {
      console.error('Social login error:', error);
      playError();
      toast.error('Verbindungsfehler', {
        description: `Login mit ${provider} konnte nicht gestartet werden.`
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(214,178,94,0.15),_transparent_70%)]" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 rounded-full border-t-2 border-r-2 border-gold relative z-10"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-gold/80 font-mono text-xs tracking-[0.3em] uppercase"
        >
          Authenticating
        </motion.p>
      </div>
    );
  }

  if (isTelegramWebApp() && verificationStatus) {
    return (
      <VerificationStatus
        verificationStatus={verificationStatus}
        verificationHandGesture={verificationHandGesture}
        rejectionReason={rejectionReason}
        onRetry={() => window.open('https://t.me/NebulaOrderBot', '_blank')}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#050608] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gold/30">

      {/* 🌌 Background Ambience */}
      <LoginBackground />

      <div className="w-full max-w-sm relative z-10">

        {/* Logo Animation */}
        <div className="flex flex-col items-center mb-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="relative w-24 h-24 mb-6"
          >
            <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full" />
            <div className="relative w-full h-full bg-gradient-to-b from-zinc-800 to-black rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-transparent" />
              <Shield className="w-10 h-10 text-gold relative z-10" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60"
          >
            NEBULA
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xs font-bold tracking-[0.4em] text-gold mt-2 uppercase"
          >
            Access Control
          </motion.p>
        </div>

        {/* Login Options */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <SocialLoginButtons onLogin={handleSocialLogin} />

          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-zinc-600 text-xs font-mono uppercase">Alternative</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={() => {
              playClick();
              setShowCodeLogin(true);
            }}
            onMouseEnter={playHover}
            className="w-full h-12 rounded-xl border border-dashed border-white/10 text-zinc-500 hover:text-white hover:border-gold/30 hover:bg-gold/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            Enter Access Code
          </button>

        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <Lock className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-zinc-400 font-medium">Secured by InsForge Authorization</span>
          </div>
        </motion.div>

        {/* Dev Backdoor */}
        {(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && (
          <div className="absolute bottom-4 left-0 right-0 text-center opacity-20 hover:opacity-100 transition-opacity">
            <button
              onClick={async () => {
                const res = await apiClient.post('/auth/validate-code', { code: '999999' });
                if (res?.data?.success) {
                  setToken(res.data.token);
                  setUser(res.data.user);
                  toast.success('DEV ACCESS GRANTED');
                  window.location.href = createPageUrl('Home');
                }
              }}
              className="text-[9px] text-zinc-500 uppercase tracking-widest hover:text-red-500"
            >
              [DEV BYPASS]
            </button>
          </div>
        )}

      </div>

      <CodeLoginModal
        isOpen={showCodeLogin}
        onClose={() => setShowCodeLogin(false)}
        onSuccess={(u) => {
          setUser(u);
          window.location.href = createPageUrl('Home');
        }}
      />

      {/* Welcome Overlay */}
      {showWelcome && (
        <WelcomeOverlay
          userName={welcomeUserName}
          onStart={() => {
            setShowWelcome(false);
            navigate(createPageUrl('Home'));
          }}
          onSkip={() => {
            setShowWelcome(false);
            navigate(createPageUrl('Home'));
          }}
        />
      )}
    </div>
  );
}
