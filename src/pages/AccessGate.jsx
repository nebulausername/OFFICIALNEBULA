import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, Mail, CheckCircle2, ArrowRight, Lock, ScanLine, Fingerprint, Camera, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '@/api';
import { apiClient } from '@/api/config';
import { setToken, getToken } from '@/api/config';
import BiometricGate from '@/components/auth/BiometricGate';
import VerificationStatus from '@/components/auth/VerificationStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { insforge } from '@/lib/insforge';
import { createPageUrl } from '../utils';

// ═══════════════════════════════════════════════
// ✨ NEBULA ACCESS GATE — Premium Login Flow
// Flow: Camera → Email → Social Login
// ═══════════════════════════════════════════════

// Floating particles
const Particles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                    width: Math.random() * 3 + 1 + 'px',
                    height: Math.random() * 3 + 1 + 'px',
                    background: `radial-gradient(circle, rgba(214,178,94,${Math.random() * 0.4 + 0.1}), transparent)`,
                }}
                initial={{ x: Math.random() * 100 + '%', y: Math.random() * 100 + '%', scale: 0 }}
                animate={{ y: [null, '-20%'], scale: [0, 1, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: Math.random() * 8 + 6, repeat: Infinity, delay: Math.random() * 5, ease: 'linear' }}
            />
        ))}
    </div>
);

// Scan line across camera
const ScanLineAnim = () => (
    <motion.div
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D6B25E] to-transparent z-20 pointer-events-none"
        initial={{ top: '10%' }}
        animate={{ top: ['10%', '90%', '10%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
);

const AccessGate = () => {
    // Steps: 'init' | 'camera' | 'email' | 'gate' | 'status' | 'login' | 'redirecting'
    const [step, setStep] = useState('init');
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cameraState, setCameraState] = useState('requesting'); // 'requesting' | 'active' | 'denied'
    const [photoTaken, setPhotoTaken] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();

    // ══════════ INIT ══════════
    useEffect(() => {
        initAuth();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(t => t.stop());
            }
        };
    }, []);

    const initAuth = async () => {
        try {
            // 1. Check for OAuth callback — SDK auto-detects hash params and saves session
            const hash = window.location.hash;
            if (hash && (hash.includes('access_token') || hash.includes('token'))) {
                console.log('🔑 OAuth callback detected, letting SDK process...');
                setStep('redirecting');

                // Wait for SDK to auto-detect and store the session from the hash
                await new Promise(r => setTimeout(r, 1200));

                // Now check if the SDK successfully created a session
                try {
                    const { data, error } = await insforge.auth.getCurrentSession();
                    if (data?.session?.user) {
                        console.log('✅ OAuth session stored:', data.session.user.email);
                        // Clean up the hash from the URL
                        window.history.replaceState(null, '', window.location.pathname);
                        navigate(createPageUrl('Home'));
                        return;
                    }
                    console.warn('OAuth: No session after hash processing', error);
                } catch (err) {
                    console.error('OAuth session check failed:', err);
                }

                // If we got here, OAuth didn't work — clean hash and show login
                window.history.replaceState(null, '', window.location.pathname);
                toast({ title: 'Login fehlgeschlagen', description: 'Bitte versuche es erneut.', variant: 'destructive' });
                setStep('email');
                return;
            }

            // 2. Check URL token (from Telegram WebApp)
            const urlToken = searchParams.get('token');
            if (urlToken) {
                setToken(urlToken);
                try {
                    const userData = await api.auth.me();
                    if (userData) { navigate(createPageUrl('Home')); return; }
                } catch (e) { setToken(null); }
            }

            // 3. Check existing JWT — ONLY redirect if confirmed valid
            const existingToken = getToken();
            if (existingToken) {
                try {
                    const userData = await api.auth.me();
                    if (userData) { navigate(createPageUrl('Home')); return; }
                } catch (e) {
                    console.warn('Stale token cleared');
                    setToken(null);
                }
            }

            // 4. Check for existing InsForge session (returning OAuth user)
            try {
                const { data } = await insforge.auth.getCurrentSession();
                if (data?.session?.user) {
                    console.log('✅ Existing InsForge session, redirecting to Home');
                    navigate(createPageUrl('Home'));
                    return;
                }
            } catch (e) { /* no session */ }

            // No session → always show camera step first
            setStep('camera');
            requestCamera();

        } catch (error) {
            console.error('Init error:', error);
            setStep('camera');
        }
    };

    // ══════════ CAMERA (always show step, handle permissions gracefully) ══════════
    const requestCamera = async () => {
        setCameraState('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });
            streamRef.current = stream;
            // Wait for next tick to ensure video ref is mounted
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => { });
                }
            }, 100);
            setCameraState('active');
        } catch (err) {
            console.warn('Camera denied or unavailable:', err.message);
            setCameraState('denied');
            // Do NOT skip to email — show the camera step with a "denied" state
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedPhoto(dataUrl);
        setPhotoTaken(true);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setTimeout(() => setStep('email'), 1500);
    };

    const skipCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setStep('email');
    };

    // ══════════ EMAIL CHECK ══════════
    const handleCheckEmail = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast({ title: 'Ungültige Email', description: 'Bitte gib eine gültige Email-Adresse ein.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.verification.checkGateStatus(email);
            setStatusData(data);
            if (data.status === 'new') setStep('gate');
            else if (data.status === 'pending' || data.status === 'rejected') setStep('status');
            else if (data.status === 'verified') setStep('login');
        } catch (error) {
            console.error('Gate check failed:', error);
            setStep('login'); // Fallback to social login
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistrationSuccess = () => {
        setStatusData({ status: 'pending', submitted_at: new Date() });
        setStep('status');
    };

    // ══════════ SOCIAL LOGIN (Google OAuth) ══════════
    const handleSocialLogin = async (provider) => {
        try {
            setIsLoading(true);
            const redirectUrl = `${window.location.origin}/login`;
            console.log(`🚀 Starting ${provider} OAuth, redirect to:`, redirectUrl);

            const { data, error } = await insforge.auth.signInWithOAuth({
                provider,
                redirectTo: redirectUrl,
            });

            if (error) {
                console.error('OAuth error:', error);
                throw error;
            }

            // If we got a URL and redirect didn't happen automatically, redirect manually
            if (data?.url) {
                console.log('Redirecting to OAuth URL:', data.url);
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Social login error:', error);
            toast({ title: 'Login fehlgeschlagen', description: error.message || 'Bitte versuche es erneut.', variant: 'destructive' });
            setIsLoading(false);
        }
    };

    // ══════════ DEV LOGIN ══════════
    const handleDevLogin = async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/validate-code', { code: '999999' });
            if (response.data?.success) {
                setToken(response.data.token);
                toast({ title: '🔧 Dev Login', description: `Admin: ${response.data.user?.full_name || 'Admin'}` });
                setTimeout(() => navigate(createPageUrl('Home')), 500);
            }
        } catch (err) {
            toast({ title: 'Dev Login Failed', description: err.response?.data?.error || err.message, variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // ══════════ RENDER ══════════
    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans relative overflow-hidden text-white selection:bg-[#D6B25E]/30">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(214,178,94,0.04)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(100,60,20,0.03)_0%,transparent_50%)]" />
            <Particles />
            <canvas ref={canvasRef} className="hidden" />

            <div className="relative z-10 w-full max-w-[480px] p-4">
                <AnimatePresence mode="wait">

                    {/* ═══ INIT / REDIRECTING ═══ */}
                    {(step === 'init' || step === 'redirecting') && (
                        <motion.div
                            key="init"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                className="w-16 h-16 border-2 border-[#D6B25E]/30 border-t-[#D6B25E] rounded-full"
                            />
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="mt-6 text-zinc-500 text-xs font-mono tracking-[0.3em] uppercase"
                            >
                                {step === 'redirecting' ? 'Session aktiv • Weiterleitung...' : 'Nebula Protocol initialisiert...'}
                            </motion.p>
                        </motion.div>
                    )}

                    {/* ═══ STEP 1: CAMERA SCAN (ALWAYS SHOWN FIRST) ═══ */}
                    {step === 'camera' && (
                        <motion.div
                            key="camera"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(12px)' }}
                            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                            className="bg-[#0A0C10]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/5"
                        >
                            {/* Camera View Area */}
                            <div className="relative aspect-[4/3] bg-black overflow-hidden">
                                {cameraState === 'active' && (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            muted
                                            className="w-full h-full object-cover scale-x-[-1]"
                                        />
                                        {!photoTaken && <ScanLineAnim />}
                                    </>
                                )}

                                {/* Camera denied / requesting state */}
                                {cameraState !== 'active' && !photoTaken && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black">
                                        {cameraState === 'requesting' ? (
                                            <>
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                    className="w-12 h-12 border-2 border-[#D6B25E]/30 border-t-[#D6B25E] rounded-full mb-4"
                                                />
                                                <p className="text-zinc-400 text-sm font-mono">Kamera-Zugriff wird angefragt...</p>
                                                <p className="text-zinc-600 text-xs mt-2">Bitte erlaube den Zugriff im Browser</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                                                    <Camera className="w-8 h-8 text-zinc-500" />
                                                </div>
                                                <p className="text-zinc-400 text-sm font-medium">Kamera nicht verfügbar</p>
                                                <p className="text-zinc-600 text-xs mt-1">Du kannst trotzdem fortfahren</p>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={requestCamera}
                                                    className="mt-4 text-[#D6B25E] text-xs font-mono underline underline-offset-4 hover:text-[#f0d97a] transition-colors"
                                                >
                                                    Erneut versuchen
                                                </motion.button>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Corner brackets */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#D6B25E]/60 rounded-tl-lg" />
                                    <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#D6B25E]/60 rounded-tr-lg" />
                                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#D6B25E]/60 rounded-bl-lg" />
                                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#D6B25E]/60 rounded-br-lg" />
                                </div>

                                {/* Face guide */}
                                {cameraState === 'active' && !photoTaken && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <motion.div
                                            animate={{ scale: [1, 1.02, 1], opacity: [0.3, 0.5, 0.3] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="w-44 h-44 rounded-full border-2 border-dashed border-[#D6B25E]/30"
                                        />
                                    </div>
                                )}

                                {/* Photo captured */}
                                {photoTaken && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-black/60 flex items-center justify-center"
                                    >
                                        {capturedPhoto && (
                                            <img src={capturedPhoto} alt="" className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50" />
                                        )}
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 300 }}
                                            className="relative z-10"
                                        >
                                            <CheckCircle2 className="w-20 h-20 text-[#D6B25E] drop-shadow-[0_0_20px_rgba(214,178,94,0.5)]" />
                                        </motion.div>
                                    </motion.div>
                                )}

                                {/* Status badge */}
                                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
                                    <motion.div
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="bg-black/70 backdrop-blur-md px-4 py-1.5 rounded-full flex items-center gap-2 border border-[#D6B25E]/20"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${cameraState === 'active' ? 'bg-[#D6B25E]' : cameraState === 'denied' ? 'bg-red-500' : 'bg-zinc-500'} animate-pulse`} />
                                        <span className="text-[10px] font-mono text-[#D6B25E] tracking-widest uppercase">
                                            {photoTaken ? 'Erfasst' : cameraState === 'active' ? 'Bereit zum Scan' : cameraState === 'denied' ? 'Kamera blockiert' : 'Warte auf Zugriff...'}
                                        </span>
                                    </motion.div>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className="p-6 space-y-4">
                                <div className="text-center space-y-1">
                                    <h2 className="text-xl font-black tracking-tight">
                                        NEBULA <span className="text-[#D6B25E]">FACE SCAN</span>
                                    </h2>
                                    <p className="text-zinc-500 text-[11px] font-mono tracking-wider uppercase">
                                        Identitätsprüfung • Stufe 1
                                    </p>
                                </div>

                                {!photoTaken && cameraState === 'active' && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={capturePhoto}
                                        className="w-full h-14 bg-[#D6B25E] hover:bg-[#c2a155] text-black font-black rounded-xl tracking-widest text-sm transition-all shadow-[0_0_25px_rgba(214,178,94,0.3)] hover:shadow-[0_0_40px_rgba(214,178,94,0.5)] flex items-center justify-center gap-2"
                                    >
                                        <Camera className="w-5 h-5" />
                                        SCAN STARTEN
                                    </motion.button>
                                )}

                                {cameraState === 'denied' && !photoTaken && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={skipCamera}
                                        className="w-full h-14 bg-[#D6B25E] hover:bg-[#c2a155] text-black font-black rounded-xl tracking-widest text-sm transition-all shadow-[0_0_25px_rgba(214,178,94,0.3)] flex items-center justify-center gap-2"
                                    >
                                        <ArrowRight className="w-5 h-5" />
                                        WEITER OHNE KAMERA
                                    </motion.button>
                                )}

                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5 }}
                                    onClick={skipCamera}
                                    className="w-full text-center text-zinc-600 hover:text-zinc-400 text-[10px] font-mono uppercase tracking-[0.2em] transition-colors py-2"
                                >
                                    Ohne Scan fortfahren →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ STEP 2: EMAIL + SOCIAL LOGIN ═══ */}
                    {step === 'email' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(10px)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="bg-[#0A0C10]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl ring-1 ring-white/5"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                {/* Photo or Shield */}
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-[#D6B25E]/20 rounded-full blur-xl group-hover:bg-[#D6B25E]/30 transition-all duration-500" />
                                    {capturedPhoto ? (
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#D6B25E]/30 shadow-[0_0_20px_rgba(214,178,94,0.15)]">
                                            <img src={capturedPhoto} alt="Scan" className="w-full h-full object-cover scale-x-[-1]" />
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent h-8 flex items-end justify-center pb-1">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B25E]" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="relative w-24 h-24 bg-[#0A0C10] rounded-2xl flex items-center justify-center border border-[#D6B25E]/20 shadow-[0_0_15px_rgba(214,178,94,0.1)]">
                                            <Shield className="w-10 h-10 text-[#D6B25E]" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-[#D6B25E] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        {capturedPhoto ? 'Gescannt' : 'Secure'}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black tracking-tighter text-white">
                                        NEBULA <span className="text-[#D6B25E]">ACCESS</span>
                                    </h1>
                                    <p className="text-zinc-500 text-xs font-mono tracking-[0.2em] uppercase">
                                        {capturedPhoto ? 'Scan erfolgreich • Email angeben' : 'Identifikation erforderlich'}
                                    </p>
                                </div>

                                <form onSubmit={handleCheckEmail} className="w-full space-y-4">
                                    <div className="space-y-1.5 text-left">
                                        <label className="text-xs font-medium text-zinc-400 ml-1">E-Mail Adresse</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-zinc-500 group-focus-within:text-[#D6B25E] transition-colors" />
                                            <Input
                                                type="email"
                                                placeholder="deine@email.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 h-12 rounded-xl focus:border-[#D6B25E]/50 focus:ring-[#D6B25E]/20 transition-all font-mono text-sm"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-14 bg-[#D6B25E] hover:bg-[#c2a155] text-black font-black rounded-xl tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(214,178,94,0.2)] hover:shadow-[0_0_30px_rgba(214,178,94,0.4)]"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>PRÜFE STATUS...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span>ZUGANG PRÜFEN</span>
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </div>
                                        )}
                                    </Button>
                                </form>

                                {/* Divider */}
                                <div className="w-full flex items-center gap-3">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">oder</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                {/* Social Login — Google + Apple */}
                                <div className="w-full space-y-3">
                                    <motion.button
                                        whileHover={{ scale: 1.01, y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSocialLogin('google')}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black h-12 rounded-xl font-bold hover:bg-zinc-100 transition-all shadow-lg shadow-white/5 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Weiter mit Google
                                    </motion.button>

                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-3 bg-white/5 text-zinc-500 h-12 rounded-xl font-bold border border-white/5 cursor-not-allowed opacity-60"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.84 3.31-.84 1.25.18 2.53.5 3.07 1.27-5.49 2.11-4.07 10.32 1.54 11.8zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                                        Apple (Bald verfügbar)
                                    </button>
                                </div>

                                <div className="pt-2 flex justify-center gap-6 opacity-30">
                                    <ScanLine className="w-4 h-4 text-zinc-500" />
                                    <Lock className="w-4 h-4 text-zinc-500" />
                                    <Fingerprint className="w-4 h-4 text-zinc-500" />
                                </div>

                                {/* Dev login — only visible in dev mode */}
                                {import.meta.env.DEV && (
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1 }}
                                        onClick={handleDevLogin}
                                        disabled={isLoading}
                                        className="w-full mt-2 text-center text-zinc-700 hover:text-[#D6B25E] text-[10px] font-mono uppercase tracking-[0.15em] transition-colors py-2 border border-dashed border-zinc-800 hover:border-[#D6B25E]/30 rounded-lg disabled:opacity-50"
                                    >
                                        🔧 Dev Admin Login (Code 999999)
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ BIOMETRIC GATE ═══ */}
                    {step === 'gate' && (
                        <motion.div key="gate" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                            <BiometricGate
                                mode="registration"
                                email={email}
                                capturedPhoto={capturedPhoto}
                                onVerified={handleRegistrationSuccess}
                                onCancel={() => setStep('email')}
                            />
                        </motion.div>
                    )}

                    {/* ═══ VERIFICATION STATUS ═══ */}
                    {step === 'status' && (
                        <motion.div key="status" className="w-full">
                            <VerificationStatus
                                verificationStatus={statusData?.status || 'pending'}
                                rejectionReason={statusData?.rejection_reason}
                                verificationSubmittedAt={statusData?.submitted_at}
                                onRetry={() => setStep('gate')}
                            />
                            <div className="mt-8 text-center">
                                <button onClick={() => setStep('email')} className="text-xs text-zinc-500 hover:text-white transition-colors uppercase tracking-widest font-mono">
                                    ← Zurück zum Start
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ VERIFIED — LOGIN ═══ */}
                    {step === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#0A0C10]/80 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative">
                                    <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -inset-4 bg-green-500/10 rounded-full blur-xl" />
                                    <div className="relative w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                        <CheckCircle2 className="w-10 h-10 text-green-400" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white">IDENTITÄT BESTÄTIGT</h2>
                                    <p className="text-zinc-400 text-sm font-mono">
                                        Willkommen zurück, <br /><span className="text-white">{email}</span>
                                    </p>
                                </div>

                                <div className="w-full space-y-3 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleSocialLogin('google')}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black h-12 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        Weiter mit Google
                                    </motion.button>

                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-3 bg-white/5 text-zinc-500 h-12 rounded-xl font-bold border border-white/5 cursor-not-allowed opacity-60"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.84 3.31-.84 1.25.18 2.53.5 3.07 1.27-5.49 2.11-4.07 10.32 1.54 11.8zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                                        Apple (Bald verfügbar)
                                    </button>
                                </div>

                                <div className="pt-4">
                                    <button onClick={() => setStep('email')} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono">
                                        Anderes Konto verwenden
                                    </button>
                                </div>

                                {import.meta.env.DEV && (
                                    <motion.button
                                        onClick={handleDevLogin}
                                        disabled={isLoading}
                                        className="w-full text-center text-zinc-700 hover:text-[#D6B25E] text-[10px] font-mono uppercase tracking-[0.15em] transition-colors py-2 border border-dashed border-zinc-800 hover:border-[#D6B25E]/30 rounded-lg disabled:opacity-50"
                                    >
                                        🔧 Dev Admin Login
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <div className="absolute bottom-6 text-[10px] text-zinc-700 font-mono tracking-widest uppercase opacity-50">
                Nebula Protocol V4.2 • Secured by InsForge
            </div>
        </div>
    );
};

export default AccessGate;
