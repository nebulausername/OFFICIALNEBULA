import React from 'react';
import { motion } from 'framer-motion';
import { Lock, MessageCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

/**
 * TeaserOverlay - Premium glassy overlay prompting Telegram verification
 */
export default function TeaserOverlay({
    compact = false,
    message = null,
    onAction = null,
    className = ''
}) {
    const { navigateToLogin, isTelegram } = useAuth();
    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'NebulaOrderBot';

    const handleUnlock = () => {
        if (onAction) {
            onAction();
        } else if (isTelegram) {
            navigateToLogin();
        } else {
            window.open(`https://t.me/${botUsername}`, '_blank');
        }
    };

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center justify-center h-full w-full ${className}`}
            >
                <button
                    onClick={handleUnlock}
                    className="group flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#D6B25E]/20 to-purple-500/20 border border-white/10 hover:border-[#D6B25E]/50 backdrop-blur-sm transition-all duration-300"
                >
                    <Lock className="w-3.5 h-3.5 text-[#D6B25E]" />
                    <span className="text-xs font-bold text-white/80 group-hover:text-white">
                        Unlock
                    </span>
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 flex items-center justify-center p-4 ${className}`}
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80 backdrop-blur-sm" />

            {/* Content */}
            <div className="relative z-10 text-center max-w-xs">
                {/* Icon */}
                <motion.div
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D6B25E]/20 to-purple-500/20 border border-white/10 flex items-center justify-center"
                >
                    <Lock className="w-7 h-7 text-[#D6B25E]" />
                </motion.div>

                {/* Message */}
                <p className="text-white/90 font-bold text-lg mb-1">
                    {message || 'Exklusiver Zugang'}
                </p>
                <p className="text-white/50 text-sm mb-6">
                    Verifiziere dich über Telegram für vollen Zugriff
                </p>

                {/* CTA Button */}
                <Button
                    onClick={handleUnlock}
                    className="group relative w-full bg-gradient-to-r from-[#D6B25E] to-amber-500 hover:from-[#F5D98B] hover:to-amber-400 text-black font-bold rounded-xl h-12 shadow-[0_0_30px_rgba(214,178,94,0.3)] hover:shadow-[0_0_40px_rgba(214,178,94,0.5)] transition-all duration-300"
                >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Via Telegram öffnen
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4 text-white/30 text-xs">
                    <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Instant
                    </span>
                    <span>•</span>
                    <span>Sicher</span>
                    <span>•</span>
                    <span>Kostenlos</span>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * TeaserModal - Full-screen modal version for action blocking
 */
export function TeaserModal({
    isOpen,
    onClose,
    title = 'Verifizierung erforderlich',
    message = 'Um diese Funktion zu nutzen, verifiziere dich über Telegram.'
}) {
    const { isTelegram, navigateToLogin } = useAuth();
    const botUsername = import.meta.env.VITE_BOT_USERNAME || 'NebulaOrderBot';

    if (!isOpen) return null;

    const handleUnlock = () => {
        if (isTelegram) {
            navigateToLogin();
        } else {
            window.open(`https://t.me/${botUsername}`, '_blank');
        }
        onClose?.();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#D6B25E]/20 to-purple-500/20 rounded-3xl blur-xl opacity-50" />

                <div className="relative">
                    {/* Icon */}
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#D6B25E]/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                        <Lock className="w-9 h-9 text-[#D6B25E]" />
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-black text-white text-center mb-2">
                        {title}
                    </h2>
                    <p className="text-zinc-400 text-center mb-8">
                        {message}
                    </p>

                    {/* CTA */}
                    <Button
                        onClick={handleUnlock}
                        className="group relative w-full bg-gradient-to-r from-[#D6B25E] to-amber-500 hover:from-[#F5D98B] hover:to-amber-400 text-black font-bold rounded-xl h-14 text-lg shadow-[0_0_30px_rgba(214,178,94,0.3)] hover:shadow-[0_0_50px_rgba(214,178,94,0.5)] transition-all duration-300"
                    >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Jetzt über Telegram verifizieren
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    {/* Skip link */}
                    <button
                        onClick={onClose}
                        className="w-full mt-4 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
                    >
                        Weiter stöbern ohne Verifizierung
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
