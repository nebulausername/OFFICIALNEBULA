import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Shield, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        // Not in Telegram - show demo/login options
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-transparent border-t-[#D6B25E] rounded-full mb-4"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
        >
          Wird geladen...
        </motion.p>
      </div>
    );
  }

  // Show verification status if in Telegram
  if (isTelegramWebApp() && verificationStatus) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
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

  // Not in Telegram - show login page
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent 70%)' }}
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.15, 0.2]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2), transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md w-full"
        >
          {/* Logo */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-center mb-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl p-4 relative"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))',
                border: '2px solid rgba(214, 178, 94, 0.5)',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 0 60px rgba(214, 178, 94, 0.3)'
              }}
            >
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                alt="Nebula Supply"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-5xl font-black mb-2">
              <span className="bg-gradient-to-r from-white via-zinc-100 to-white bg-clip-text text-transparent">
                NEBULA
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#E8C76A] via-[#F5D98B] to-[#E8C76A] bg-clip-text text-transparent">
                SUPPLY
              </span>
            </h1>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl p-8"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: '#D6B25E' }} />
              <h2 className="text-2xl font-black mb-2" style={{ color: '#FFFFFF' }}>
                Willkommen zurück
              </h2>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Öffne diese Seite in Telegram, um dich anzumelden
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => {
                  const botUsername = process.env.VITE_BOT_USERNAME || 'your_bot';
                  window.open(`https://t.me/${botUsername}`, '_blank');
                }}
                className="w-full h-14 rounded-xl font-bold text-lg"
                style={{
                  background: 'linear-gradient(135deg, #0088cc, #0066aa)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 20px rgba(0, 136, 204, 0.4)'
                }}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                In Telegram öffnen
              </Button>

              <p className="text-center text-sm mt-6" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Oder nutze die Demo-Version
              </p>

              <Button
                onClick={() => navigate(createPageUrl('Home'))}
                variant="outline"
                className="w-full h-12 rounded-xl font-semibold"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}
              >
                Als Gast fortfahren
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Premium E-Commerce für exklusive Produkte
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
