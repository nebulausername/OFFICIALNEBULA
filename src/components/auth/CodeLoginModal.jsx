import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, CheckCircle2, XCircle, Loader2, Sparkles, Send, Shield, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { api } from '@/api';
import { setToken } from '@/api/config';

const CodeLoginModal = ({ isOpen, onClose, onSuccess }) => {
    const [code, setCode] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setCode('');
            setStatus('idle');
            setError('');
        }
    }, [isOpen]);

    // Auto-submit when 6 digits entered
    useEffect(() => {
        if (code.length === 6 && status === 'idle') {
            handleSubmit();
        }
    }, [code]);

    // Countdown timer for retry
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async () => {
        if (code.length !== 6) return;

        setStatus('loading');
        setError('');

        try {
            const response = await api.post('/auth/validate-code', { code });

            if (response.data.success) {
                // Save token
                setToken(response.data.token);
                setStatus('success');

                // Small delay for success animation
                setTimeout(() => {
                    onSuccess?.(response.data.user);
                    onClose();
                }, 1500);
            }
        } catch (err) {
            setStatus('error');
            const reason = err.response?.data?.reason || 'Unbekannter Fehler';

            if (reason === 'Code expired') {
                setError('⏱️ Code abgelaufen. Generiere einen neuen Code in Telegram.');
            } else if (reason === 'Code already used') {
                setError('🔄 Code bereits verwendet. Generiere einen neuen in Telegram.');
            } else if (reason === 'Invalid code') {
                setError('❌ Ungültiger Code. Bitte überprüfe deine Eingabe.');
            } else if (reason === 'User not verified') {
                setError('⚠️ Dein Account ist noch nicht verifiziert.');
            } else {
                setError(`Fehler: ${reason}`);
            }

            // Cooldown before retry
            setCountdown(3);

            // Reset to idle after cooldown
            setTimeout(() => {
                setStatus('idle');
                setCode('');
            }, 3000);
        }
    };

    const statusConfig = {
        idle: {
            icon: Key,
            color: 'text-purple-400',
            bgGlow: 'rgba(168, 85, 247, 0.2)',
        },
        loading: {
            icon: Loader2,
            color: 'text-blue-400',
            bgGlow: 'rgba(59, 130, 246, 0.2)',
        },
        success: {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bgGlow: 'rgba(16, 185, 129, 0.3)',
        },
        error: {
            icon: XCircle,
            color: 'text-red-400',
            bgGlow: 'rgba(239, 68, 68, 0.2)',
        },
    };

    const currentStatus = statusConfig[status];
    const StatusIcon = currentStatus.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[440px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 shadow-2xl overflow-hidden">
                {/* Animated background glow */}
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{
                        background: `radial-gradient(circle at 50% 30%, ${currentStatus.bgGlow} 0%, transparent 70%)`,
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* Sparkle effects */}
                <div className="absolute top-4 right-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                    >
                        <Sparkles className="w-5 h-5 text-purple-400/50" />
                    </motion.div>
                </div>

                <DialogHeader className="relative z-10">
                    <motion.div
                        className="flex justify-center mb-4"
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <div className={`p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30`}>
                            <motion.div
                                animate={status === 'loading' ? { rotate: 360 } : {}}
                                transition={{ duration: 1, repeat: status === 'loading' ? Infinity : 0, ease: 'linear' }}
                            >
                                <StatusIcon className={`w-10 h-10 ${currentStatus.color}`} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                        {status === 'success' ? 'Willkommen zurück!' : 'Code-Login'}
                    </DialogTitle>

                    <DialogDescription className="text-center text-gray-400 mt-2">
                        {status === 'success'
                            ? 'Du wirst eingeloggt...'
                            : 'Gib den 6-stelligen Code von Telegram ein'}
                    </DialogDescription>
                </DialogHeader>

                <div className="relative z-10 py-6">
                    {/* Telegram instruction */}
                    <AnimatePresence mode="wait">
                        {status !== 'success' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex items-center justify-center gap-2 mb-6 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20"
                            >
                                <Send className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-300">
                                    Sende <code className="px-1.5 py-0.5 rounded bg-blue-500/20 font-mono">/code</code> an den Telegram Bot
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* OTP Input */}
                    <motion.div
                        className="flex justify-center mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <InputOTP
                            value={code}
                            onChange={setCode}
                            maxLength={6}
                            disabled={status === 'loading' || status === 'success'}
                            className="gap-2"
                        >
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot
                                    index={0}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <InputOTPSlot
                                    index={1}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <InputOTPSlot
                                    index={2}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </InputOTPGroup>
                            <InputOTPSeparator className="text-gray-500">-</InputOTPSeparator>
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot
                                    index={3}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <InputOTPSlot
                                    index={4}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <InputOTPSlot
                                    index={5}
                                    className="w-12 h-14 text-xl font-bold border-2 border-gray-600 bg-gray-800/50 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </InputOTPGroup>
                        </InputOTP>
                    </motion.div>

                    {/* Error message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-center text-red-400 text-sm mb-4 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Countdown indicator */}
                    <AnimatePresence>
                        {countdown > 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center gap-2 text-gray-400 text-sm"
                            >
                                <Clock className="w-4 h-4" />
                                <span>Erneut versuchen in {countdown}s</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Success animation */}
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center gap-3"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: [0, 1.2, 1] }}
                                    transition={{ duration: 0.5, times: [0, 0.6, 1] }}
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                                >
                                    <CheckCircle2 className="w-8 h-8 text-white" />
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg font-medium text-emerald-400"
                                >
                                    Erfolgreich eingeloggt!
                                </motion.p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Security badge */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="relative z-10 flex items-center justify-center gap-2 text-xs text-gray-500 border-t border-gray-700/50 pt-4"
                >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Sichere Ende-zu-Ende Verbindung</span>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default CodeLoginModal;
