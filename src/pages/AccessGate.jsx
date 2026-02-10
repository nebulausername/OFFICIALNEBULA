import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Shield, Mail, CheckCircle2, ArrowRight, Lock, ScanLine, Fingerprint } from 'lucide-react';
import { api } from '@/api';
import BiometricGate from '@/components/auth/BiometricGate';
import VerificationStatus from '@/components/auth/VerificationStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { insforge } from '@/lib/insforge';

// Particle Effect Component
const Particles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-[#D6B25E]/20 rounded-full"
                    initial={{
                        x: Math.random() * 100 + "%",
                        y: Math.random() * 100 + "%",
                        scale: Math.random() * 0.5 + 0.5,
                    }}
                    animate={{
                        y: [null, Math.random() * -100 + "%"],
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        width: Math.random() * 4 + 1 + "px",
                        height: Math.random() * 4 + 1 + "px",
                    }}
                />
            ))}
        </div>
    );
};

const AccessGate = () => {
    const [step, setStep] = useState('email'); // email, checking, gate, status, login
    const [email, setEmail] = useState('');
    const [statusData, setStatusData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast({ title: 'Ungültige Email', description: 'Bitte gib eine gültige Email-Adresse ein.', variant: 'destructive' });
            return;
        }

        setIsLoading(true);
        try {
            // Simulate slight delay for effect
            await new Promise(r => setTimeout(r, 800));

            const data = await api.verification.checkGateStatus(email);
            setStatusData(data);

            if (data.status === 'new') {
                setStep('gate');
            } else if (data.status === 'pending' || data.status === 'rejected') {
                setStep('status');
            } else if (data.status === 'verified') {
                setStep('login');
            }
        } catch (error) {
            console.error('Gate check failed:', error);
            toast({ title: 'Verbindungsfehler', description: 'Konnte Server nicht erreichen. Bitte prüfe deine Internetverbindung.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegistrationSuccess = () => {
        setStatusData({ status: 'pending', submitted_at: new Date() });
        setStep('status');
    };

    const handleSocialLogin = async (provider) => {
        try {
            const redirectUrl = `${window.location.origin}/login`;
            const { error } = await insforge.auth.signInWithOAuth({
                provider,
                redirectTo: redirectUrl,
                options: {
                    queryParams: {
                        redirect_to: redirectUrl,
                        login_hint: email
                    }
                }
            });
            if (error) throw error;
        } catch (error) {
            console.error('Social login error:', error);
            toast({ title: 'Login fehlgeschlagen', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="min-h-screen bg-[#050608] flex items-center justify-center font-sans relative overflow-hidden text-white selection:bg-[#D6B25E]/30">

            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(214,178,94,0.03)_0%,transparent_70%)]" />
            <Particles />

            {/* Main Container */}
            <div className="relative z-10 w-full max-w-[480px] p-4">
                <AnimatePresence mode="wait">

                    {/* STEP 1: MAIL CHECK */}
                    {step === 'email' && (
                        <motion.div
                            key="email"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-[#0A0C10]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl ring-1 ring-white/5"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="relative group">
                                    <div className="absolute -inset-4 bg-[#D6B25E]/20 rounded-full blur-xl group-hover:bg-[#D6B25E]/30 transition-all duration-500" />
                                    <div className="relative w-24 h-24 bg-[#0A0C10] rounded-2xl flex items-center justify-center border border-[#D6B25E]/20 shadow-[0_0_15px_rgba(214,178,94,0.1)] group-hover:border-[#D6B25E]/50 transition-all duration-500">
                                        <Shield className="w-10 h-10 text-[#D6B25E]" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-[#D6B25E] text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        Secure
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h1 className="text-3xl font-black tracking-tighter text-white">
                                        NEBULA <span className="text-[#D6B25E]">ACCESS</span>
                                    </h1>
                                    <p className="text-zinc-500 text-xs font-mono tracking-[0.2em] uppercase">
                                        Identitätsprüfung erforderlich
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
                                        className="w-full h-14 bg-[#D6B25E] hover:bg-[#c2a155] text-black font-black rounded-xl tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(214,178,94,0.2)] hover:shadow-[0_0_30px_rgba(214,178,94,0.4)] relative overflow-hidden Group"
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

                                <div className="pt-4 border-t border-white/5 w-full flex justify-center gap-6 opacity-40">
                                    <ScanLine className="w-4 h-4 text-zinc-500" />
                                    <Lock className="w-4 h-4 text-zinc-500" />
                                    <Fingerprint className="w-4 h-4 text-zinc-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: BIO GATE */}
                    {step === 'gate' && (
                        <BiometricGate
                            mode="registration"
                            email={email}
                            onVerified={handleRegistrationSuccess}
                            onCancel={() => setStep('email')}
                        />
                    )}

                    {/* STEP 3: STATUS */}
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

                    {/* STEP 4: LOGIN */}
                    {step === 'login' && (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#0A0C10]/80 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)]"
                        >
                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <CheckCircle2 className="w-10 h-10 text-green-400" />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-white">IDENTITÄT BESTÄTIGT</h2>
                                    <p className="text-zinc-400 text-sm font-mono">Willkommen zurück, <br /><span className="text-white">{email}</span></p>
                                </div>

                                <div className="w-full space-y-3 pt-4">
                                    <button
                                        onClick={() => handleSocialLogin('google')}
                                        className="w-full flex items-center justify-center gap-3 bg-white text-black h-12 rounded-xl font-bold hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                                        Weiter mit Google
                                    </button>
                                    {/* Apple Login dummy for now until configured */}
                                    <button
                                        disabled
                                        className="w-full flex items-center justify-center gap-3 bg-white/5 text-zinc-500 h-12 rounded-xl font-bold border border-white/5 cursor-not-allowed"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.45C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.84 3.31-.84 1.25.18 2.53.5 3.07 1.27-5.49 2.11-4.07 10.32 1.54 11.8zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                                        Apple (Bald verfügbar)
                                    </button>
                                </div>

                                <div className="pt-6">
                                    <button onClick={() => setStep('email')} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono">
                                        Anderes Konto verwenden
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Footer Branding */}
            <div className="absolute bottom-6 text-[10px] text-zinc-700 font-mono tracking-widest uppercase opacity-50">
                Nebula Protocol V4.2 • Secured by InsForge
            </div>
        </div>
    );
};

export default AccessGate;
