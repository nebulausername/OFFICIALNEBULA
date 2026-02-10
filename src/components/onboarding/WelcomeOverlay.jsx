import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function WelcomeOverlay({ userName, onStart, onSkip }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Trigger subtle confetti on mount
        const duration = 2000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 2,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#D6B25E', '#ffffff'],
                zIndex: 9999
            });
            confetti({
                particleCount: 2,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#D6B25E', '#ffffff'],
                zIndex: 9999
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    const handleStart = () => {
        setIsVisible(false);
        setTimeout(onStart, 300); // Wait for exit animation
    };

    const handleSkip = () => {
        setIsVisible(false);
        setTimeout(onSkip, 300);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center px-4"
                >
                    {/* Glass Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                            delay: 0.2
                        }}
                        className="relative z-10 max-w-md w-full text-center"
                    >
                        {/* Greeting */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mb-6"
                        >
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D6B25E]/10 border border-[#D6B25E]/20 text-[#D6B25E] text-xs font-bold uppercase tracking-wider mb-4">
                                <Sparkles size={12} />
                                Official Member
                            </span>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                                Willkommen,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D6B25E] via-[#F2D27C] to-white">
                                    {userName || 'Legend'}
                                </span> 👋
                            </h1>
                            <p className="text-zinc-400 text-lg">
                                Dein Zugang zu exklusiver Streetwear & Community.
                            </p>
                        </motion.div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-3"
                        >
                            <Button
                                onClick={handleStart}
                                className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-full text-lg font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95"
                            >
                                Kurz einrichten (20 Sek.)
                            </Button>

                            <button
                                onClick={handleSkip}
                                className="text-sm text-zinc-500 hover:text-white transition-colors py-2"
                            >
                                Später entspannt umschauen
                            </button>
                        </motion.div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
