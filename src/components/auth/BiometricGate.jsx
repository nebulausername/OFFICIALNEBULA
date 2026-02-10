// Production Biometric Gate
import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, ShieldCheck, Fingerprint, Lock, Cpu, Globe, AlertTriangle, Terminal, Camera, Loader2, X, RefreshCw, Smartphone, Check, PlayCircle, Mail } from 'lucide-react';
import { api } from '@/api';
import { useNebulaSound } from '@/contexts/SoundContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Assuming this exists, or use standard input
import { useToast } from '@/components/ui/use-toast';
import { insforge } from '@/lib/insforge';

const BiometricGate = ({ mode = 'verification', email: initialEmail, onVerified, onCancel }) => {
    const webcamRef = useRef(null);
    const [status, setStatus] = useState('INITIALISIERE SENSOREN...');
    const [email, setEmail] = useState(initialEmail || '');
    const [showEmailInput, setShowEmailInput] = useState(false);
    const [capturedBlob, setCapturedBlob] = useState(null);

    // States
    const [step, setStep] = useState('camera'); // camera, email, submitting, pending, success
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [error, setError] = useState(null);
    const { toast } = useToast();

    // Sound effects
    const soundContext = useNebulaSound();
    const playClick = soundContext?.playClick || (() => { });

    useEffect(() => {
        // Auto-check permission status on mount
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => {
                setPermissionGranted(true);
                setPermissionDenied(false);
                setStatus('SYSTEM BEREIT');
            })
            .catch(() => {
                setPermissionDenied(true);
                setStatus('ZUGRIFF VERWEIGERT');
            });
    }, []);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    const handleUserMedia = () => {
        setPermissionGranted(true);
        setPermissionDenied(false);
        setStatus('SYSTEM BEREIT');
    };

    const handleUserMediaError = (e) => {
        console.error("Webcam Error", e);
        setPermissionDenied(true);
        setStatus("ZUGRIFF VERWEIGERT");
    };

    const retryCamera = () => {
        setPermissionDenied(false);
        setError(null);
        setStatus('INITIALISIERE SENSOREN...');
        window.location.reload();
    };

    const capturePhoto = () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;

        // Convert to blob
        fetch(imageSrc)
            .then(res => res.blob())
            .then(blob => {
                setCapturedBlob(blob);
                if (!email) {
                    setStep('email');
                    setStatus('IDENTITÄT ERFORDERLICH');
                } else {
                    submitData(blob, email);
                }
            })
            .catch(err => {
                console.error("Blob conversion failed", err);
                setError("Bildverarbeitung fehlgeschlagen");
            });
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (!email || !capturedBlob) return;
        submitData(capturedBlob, email);
    };

    const submitData = async (blob, userEmail) => {
        setStep('submitting');
        setStatus('VERSCHLÜSSELE DATEN...');

        try {
            const formData = new FormData();
            formData.append('photo', blob, 'verification.jpg');
            formData.append('email', userEmail);
            formData.append('hand_gesture', '👍'); // TODO: Implement real gesture check

            // Use registerApplicant for guests (Login flow)
            // It handles "User exists" gracefully usually, or we use browser-submit if we had auth (we don't)
            const response = await api.verification.registerApplicant(formData);

            setStatus('WARTE AUF BESTÄTIGUNG...');
            setStep('pending');
            playClick();

            // Listen for Realtime Sync
            if (response.user?.id) {
                const { realtime } = insforge; // Access realtime directly if needed or via hook
                // But we are in a component. We can use a direct socket check if available
                // Or simulate polling if realtime isn't set up globally yet

                // Using insforge.realtime:
                // @ts-ignore
                const channel = insforge.realtime.subscribe(`user:${response.user.id}`, (event) => {
                    if (event.type === 'verification:updated' && event.payload.status === 'verified') {
                        handleSuccess(response);
                    }
                });

                // Workaround: We can't rely solely on socket in 'guest' mode sometimes if auth missing
                // So we also poll status?
            } else {
                // Fallback if no user ID returned (e.g. error)
                setError("Keine User-ID empfangen");
            }

        } catch (err) {
            console.error("Submission failed", err);
            setError(err.response?.data?.message || err.message || "Verifizierung fehlgeschlagen");
            setStatus("ÜBERTRAGUNGSFEHLER");
            toast({ title: "Fehler", description: "Verifizierung fehlgeschlagen: " + (err.response?.data?.message || err.message), variant: "destructive" });
            setStep('camera'); // Reset
        }
    };

    // Simulate socket event for now if backend not fully wired or for robustness
    useEffect(() => {
        if (step === 'pending') {
            // Polling fallback
            const interval = setInterval(async () => {
                // We need user email to check status
                try {
                    const res = await api.verification.checkGateStatus(email);
                    if (res.status === 'verified') {
                        handleSuccess({ status: 'verified' });
                    } else if (res.status === 'rejected') {
                        setError("Verifizierung abgelehnt: " + (res.rejection_reason || 'Unbekannt'));
                        setStep('camera');
                    }
                } catch (e) { console.error("Poll fail", e); }
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [step, email]);

    const handleSuccess = (response) => {
        setStep('success');
        setStatus('ZUGRIFF GENEHMIGT');
        setTimeout(() => {
            onVerified(response);
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-[#0A0C10]/95 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden ring-1 ring-white/5"
        >
            {/* Close Button */}
            {onCancel && (
                <button onClick={onCancel} className="absolute top-4 right-4 z-50 text-zinc-500 hover:text-white transition-colors bg-black/40 p-2 rounded-full hover:bg-white/10 border border-white/5">
                    <X className="w-5 h-5" />
                </button>
            )}

            <AnimatePresence mode="wait">
                {/* 1. PERMISSION DENIED */}
                {permissionDenied ? (
                    <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-6">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                            <Lock className="w-10 h-10 text-red-500" />
                        </div>
                        <h2 className="text-xl font-black text-white mb-2 uppercase tracking-wide">Kamera erforderlich</h2>
                        <div className="w-full space-y-3 mt-4">
                            <Button onClick={retryCamera} className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl tracking-wide border border-white/10">
                                <RefreshCw className="w-4 h-4 mr-2" /> Erneut versuchen
                            </Button>
                        </div>
                    </motion.div>
                ) : step === 'camera' ? (
                    /* 2. CAMERA SCAN */
                    <motion.div key="scan" exit={{ opacity: 0, filter: "blur(10px)" }} className="flex flex-col items-center">
                        <div className="mb-6 text-center space-y-1">
                            <div className="inline-flex items-center gap-2 bg-[#D6B25E]/10 px-3 py-1 rounded-full border border-[#D6B25E]/20 mb-3">
                                <Scan className="w-3 h-3 text-[#D6B25E]" />
                                <span className="text-[10px] font-bold text-[#D6B25E] tracking-widest uppercase">{status}</span>
                            </div>
                        </div>

                        <div className="relative w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group mb-6 ring-1 ring-white/5">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                                onUserMedia={handleUserMedia}
                                onUserMediaError={handleUserMediaError}
                                className="w-full h-full object-cover opacity-90 grayscale-[0.2] contrast-125"
                                mirrored={true}
                            />
                            {/* HUD Overlays */}
                            <div className="absolute top-4 left-4 flex gap-1"><div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /><span className="text-[8px] font-mono text-red-500 uppercase">LIVE</span></div>
                            <div className="absolute inset-0 border-[20px] border-black/30 pointer-events-none rounded-2xl" />
                        </div>

                        {error && <div className="text-red-400 text-xs mb-4">{error}</div>}

                        <Button onClick={capturePhoto} className="w-full h-12 bg-[#D6B25E] hover:bg-[#c2a155] text-black font-black tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(214,178,94,0.3)]">
                            <Camera className="w-4 h-4 mr-2" /> SCAN STARTEN
                        </Button>
                    </motion.div>
                ) : step === 'email' ? (
                    /* 3. EMAIL INPUT */
                    <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center py-4">
                        <div className="w-16 h-16 bg-[#D6B25E]/10 rounded-full flex items-center justify-center mb-6 border border-[#D6B25E]/20">
                            <Fingerprint className="w-8 h-8 text-[#D6B25E]" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Identität bestätigen</h3>
                        <p className="text-zinc-400 text-xs text-center mb-6 max-w-xs">Deine biometrischen Daten werden verschlüsselt mit deinem Account verknüpft.</p>

                        <form onSubmit={handleEmailSubmit} className="w-full space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase ml-1">E-Mail Adresse</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3.5 w-4 h-4 text-zinc-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-[#D6B25E]/50 focus:ring-1 focus:ring-[#D6B25E]/20 transition-all font-mono"
                                        placeholder="user@example.com"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12 bg-white text-black font-bold rounded-xl mt-2">
                                Fortfahren <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            <button type="button" onClick={() => setStep('camera')} className="w-full text-center text-xs text-zinc-500 hover:text-white mt-4">Zurück zum Scan</button>
                        </form>
                    </motion.div>
                ) : step === 'pending' ? (
                    /* 4. PENDING / TELEGRAM SYNC */
                    <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center py-6">
                        <div className="relative w-24 h-24 mb-6">
                            <div className="absolute inset-0 bg-[#0088cc]/20 rounded-full animate-ping opacity-75" />
                            <div className="relative w-full h-full bg-[#0088cc]/10 rounded-full flex items-center justify-center border border-[#0088cc]/30">
                                <Smartphone className="w-10 h-10 text-[#0088cc]" />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">Bestätigung erforderlich</h3>
                        <div className="bg-[#0088cc]/5 border border-[#0088cc]/20 rounded-xl p-4 w-full mb-6">
                            <p className="text-[#0088cc] text-xs font-bold uppercase mb-2">Telegram Sync</p>
                            <p className="text-zinc-300 text-sm mb-3">Bitte öffne den Telegram Bot und tippe:</p>
                            <div className="bg-black/50 rounded-lg p-3 font-mono text-white tracking-widest text-lg border border-white/10">/verify</div>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-500 text-xs animate-pulse">
                            <Loader2 className="w-3 h-3 animate-spin" /> Warte auf Synchronisierung...
                        </div>
                    </motion.div>
                ) : (
                    /* 5. SUCCESS */
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/40 shadow-[0_0_60px_rgba(34,197,94,0.2)]">
                            <ShieldCheck className="w-12 h-12 text-green-400" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-1">IDENTITÄT BESTÄTIGT</h2>
                        <p className="text-zinc-400 text-sm">Zugriff wird gewährt...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Helper Icon
const ArrowRight = ({ className }) => (<svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>);

export default BiometricGate;
