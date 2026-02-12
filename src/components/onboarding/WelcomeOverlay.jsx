import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Crown, Star } from 'lucide-react';

// Gold particle burst (pure CSS/motion, no external deps)
const GoldParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(30)].map((_, i) => {
            const angle = (i / 30) * 360;
            const distance = 60 + Math.random() * 150;
            const x = Math.cos((angle * Math.PI) / 180) * distance;
            const y = Math.sin((angle * Math.PI) / 180) * distance;
            const size = Math.random() * 5 + 2;
            return (
                <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                        width: size,
                        height: size,
                        left: '50%',
                        top: '40%',
                        background: i % 3 === 0 ? '#D6B25E' : i % 3 === 1 ? '#F2D27C' : '#ffffff',
                        boxShadow: `0 0 ${size * 2}px ${i % 3 === 2 ? 'rgba(255,255,255,0.4)' : 'rgba(214,178,94,0.5)'}`,
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x, y: y - 40, opacity: [1, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.6 + Math.random() * 1, delay: Math.random() * 0.3, ease: [0.16, 1, 0.3, 1] }}
                />
            );
        })}
    </div>
);

// Ambient floating particles
const AmbientParticles = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
            <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-[#D6B25E]/40"
                style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                animate={{ y: [0, -25, 0], opacity: [0, 0.5, 0], scale: [0, 1, 0] }}
                transition={{ duration: 3 + Math.random() * 3, delay: 1 + Math.random() * 3, repeat: Infinity, ease: 'easeInOut' }}
            />
        ))}
    </div>
);

export default function WelcomeOverlay({ userName, onStart, onSkip }) {
    const [showParticles, setShowParticles] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => setShowParticles(true), 300);
        return () => clearTimeout(t);
    }, []);

    const handleStart = () => { setIsVisible(false); setTimeout(onStart, 500); };
    const handleSkip = () => { setIsVisible(false); setTimeout(onSkip, 500); };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" />

                    {/* Radial gold glow */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5 }}
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none"
                        style={{ background: 'radial-gradient(circle, rgba(214,178,94,0.08) 0%, transparent 70%)' }}
                    />

                    {showParticles && <GoldParticles />}
                    <AmbientParticles />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.15 }}
                        className="relative z-10 max-w-sm sm:max-w-md w-full text-center"
                    >
                        {/* Crown icon */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 300, delay: 0.3 }}
                            className="mb-4 sm:mb-6 flex justify-center"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -inset-4 sm:-inset-6 rounded-full bg-[#D6B25E]/20 blur-xl"
                                />
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#D6B25E] to-[#8B6914] flex items-center justify-center shadow-[0_0_40px_rgba(214,178,94,0.35)]">
                                    <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-black" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#D6B25E]/10 border border-[#D6B25E]/25 text-[#D6B25E] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-4 sm:mb-5">
                                <Sparkles size={10} />
                                Official Member
                                <Sparkles size={10} />
                            </span>
                        </motion.div>

                        {/* Main title */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="mb-3 sm:mb-4"
                        >
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-1 tracking-tight leading-[1.1]">
                                Willkommen,
                            </h1>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6B25E] via-[#F2D27C] to-[#D6B25E] animate-shimmer bg-[length:200%_auto]">
                                    {userName || 'Legend'}
                                </span>
                                {' '}
                                <motion.span
                                    initial={{ rotate: 0 }}
                                    animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                    transition={{ duration: 2, delay: 1 }}
                                    className="inline-block"
                                >👋</motion.span>
                            </h1>
                        </motion.div>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-zinc-400 text-sm sm:text-lg mb-6 sm:mb-10 max-w-[280px] sm:max-w-xs mx-auto"
                        >
                            Dein exklusiver Zugang zu <span className="text-white font-semibold">Premium Streetwear</span> & Community.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1 }}
                            className="space-y-3 sm:space-y-4"
                        >
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleStart}
                                className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] text-black rounded-2xl text-base sm:text-lg font-black tracking-wide shadow-[0_0_25px_rgba(214,178,94,0.3)] transition-all flex items-center justify-center gap-2"
                            >
                                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                                <span>Einrichten — 20 Sek.</span>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSkip}
                                className="w-full h-10 sm:h-12 bg-white/5 text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 rounded-2xl text-sm sm:text-base font-medium transition-all"
                            >
                                Direkt loslegen
                            </motion.button>
                        </motion.div>

                        {/* Trust indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="flex justify-center gap-4 sm:gap-6 mt-6 sm:mt-8 text-zinc-600 text-[9px] sm:text-[10px] font-mono uppercase tracking-widest"
                        >
                            <span>Encrypted</span>
                            <span>•</span>
                            <span>Premium</span>
                            <span>•</span>
                            <span>Exclusive</span>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
