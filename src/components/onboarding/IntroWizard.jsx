import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Sparkles, Zap } from 'lucide-react';

const STEPS = [
    {
        id: 'interests',
        title: 'Was feierst du?',
        subtitle: 'Wir zeigen dir nur, was dich interessiert.',
        multi: true,
        maxSelect: 3,
        options: [
            { id: 'hoodies', label: 'Heavy Hoodies', emoji: '🧥' },
            { id: 'tees', label: 'Oversized Tees', emoji: '👕' },
            { id: 'pants', label: 'Pants & Jogger', emoji: '👖' },
            { id: 'accessories', label: 'Accessories', emoji: '🧢' },
            { id: 'limited', label: 'Limited Drops', emoji: '🔥' },
        ],
    },
    {
        id: 'fit',
        title: 'Deine Fit-Präferenz?',
        subtitle: 'Damit wir dir die richtige Size empfehlen.',
        multi: false,
        options: [
            { id: 'regular', label: 'Regular Fit', emoji: '📐', desc: 'Klassische Passform' },
            { id: 'oversized', label: 'Heavy Oversized', emoji: '🫠', desc: 'Extra weit & boxy' },
            { id: 'slim', label: 'Slim / Athletic', emoji: '💪', desc: 'Eng anliegend' },
        ],
    },
];

export default function IntroWizard({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({ interests: [], fit: null });
    const [direction, setDirection] = useState(1);

    const handleSelection = (stepId, value) => {
        if (stepId === 'interests') {
            setSelections(prev => ({
                ...prev,
                interests: prev.interests.includes(value)
                    ? prev.interests.filter(i => i !== value)
                    : [...prev.interests, value].slice(0, 3),
            }));
        } else {
            setSelections(prev => ({ ...prev, fit: value }));
        }
    };

    const nextStep = () => {
        setDirection(1);
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete(selections);
        }
    };

    // ═══ FINAL STEP: "All set" ═══
    if (currentStep === STEPS.length) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4 py-8"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(214,178,94,0.1) 0%, transparent 70%)' }}
                />

                <div className="text-center max-w-xs sm:max-w-sm w-full relative z-10">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-[#D6B25E] to-[#8B6914] rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-6 sm:mb-8 shadow-[0_0_50px_rgba(214,178,94,0.4)] rotate-6"
                    >
                        <Check size={40} strokeWidth={3} className="text-black sm:hidden" />
                        <Check size={56} strokeWidth={3} className="text-black hidden sm:block" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Alles ready! 🚀</h2>
                        <p className="text-zinc-400 text-sm sm:text-lg mb-8 sm:mb-10">
                            Dein Feed wurde <span className="text-[#D6B25E] font-semibold">personalisiert</span>.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={nextStep}
                        className="w-full h-12 sm:h-14 bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] text-black rounded-2xl font-black text-base sm:text-lg shadow-[0_0_25px_rgba(214,178,94,0.3)] flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                        Jetzt shoppen
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    const stepData = STEPS[currentStep];
    const canProceed = stepData.id === 'interests' ? selections.interests.length > 0 : selections.fit !== null;

    const slideVariants = {
        enter: (dir) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-0 sm:p-4"
        >
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="bg-[#0A0C10]/95 backdrop-blur-xl w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border-t sm:border border-white/5 p-5 sm:p-6 md:p-8 shadow-2xl shadow-black/50 relative overflow-hidden ring-1 ring-white/5 max-h-[90vh] sm:max-h-none flex flex-col"
                style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
            >
                {/* Gold glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 sm:w-48 h-16 sm:h-24 bg-[#D6B25E]/5 blur-3xl rounded-full pointer-events-none" />

                {/* Progress bar */}
                <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-8 relative z-10 flex-shrink-0">
                    {[...Array(STEPS.length + 1)].map((_, i) => (
                        <div key={i} className="h-1 sm:h-1.5 flex-1 rounded-full overflow-hidden bg-zinc-800/80">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: i <= currentStep ? '100%' : '0%' }}
                                transition={{ duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] rounded-full"
                            />
                        </div>
                    ))}
                </div>

                {/* Step counter */}
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
                    <span className="text-[9px] sm:text-[10px] font-mono text-[#D6B25E] tracking-[0.2em] uppercase">
                        Schritt {currentStep + 1} / {STEPS.length}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-zinc-600 font-mono">
                        <Sparkles size={10} className="text-[#D6B25E]" />
                        Personalisierung
                    </div>
                </div>

                {/* Scrollable step content */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <AnimatePresence mode="wait" custom={direction}>
                        <motion.div
                            key={currentStep}
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <h2 className="text-xl sm:text-2xl font-black text-white mb-1 tracking-tight">{stepData.title}</h2>
                            <p className="text-zinc-500 text-xs sm:text-sm mb-4 sm:mb-6">{stepData.subtitle}</p>

                            <div className="space-y-2 sm:space-y-2.5 mb-6 sm:mb-8">
                                {stepData.options.map((option, idx) => {
                                    const isSelected = stepData.id === 'interests'
                                        ? selections.interests.includes(option.id)
                                        : selections.fit === option.id;

                                    return (
                                        <motion.button
                                            key={option.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.04 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSelection(stepData.id, option.id)}
                                            className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-200 ${isSelected
                                                ? 'border-[#D6B25E] bg-[#D6B25E]/10 text-white shadow-[0_0_15px_rgba(214,178,94,0.1)]'
                                                : 'border-zinc-800/80 bg-zinc-900/30 text-zinc-400 hover:border-zinc-700 active:bg-zinc-900/60'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2.5 sm:gap-3">
                                                <span className="text-xl sm:text-2xl">{option.emoji}</span>
                                                <div className="text-left">
                                                    <span className="font-semibold block text-xs sm:text-sm">{option.label}</span>
                                                    {option.desc && <span className="text-[10px] sm:text-[11px] text-zinc-500 block">{option.desc}</span>}
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isSelected
                                                ? 'border-[#D6B25E] bg-[#D6B25E]'
                                                : 'border-zinc-700'
                                                }`}>
                                                {isSelected && <Check size={12} className="text-black" strokeWidth={3} />}
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer — always visible */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/5 flex-shrink-0">
                    <button
                        onClick={() => onComplete(null)}
                        className="text-[10px] sm:text-xs text-zinc-600 hover:text-zinc-400 transition-colors font-mono uppercase tracking-wider"
                    >
                        Überspringen
                    </button>
                    <motion.button
                        whileHover={canProceed ? { scale: 1.05 } : {}}
                        whileTap={canProceed ? { scale: 0.95 } : {}}
                        onClick={nextStep}
                        disabled={!canProceed}
                        className={`rounded-xl px-5 sm:px-6 h-10 sm:h-12 font-bold text-sm sm:text-base flex items-center gap-1.5 transition-all ${canProceed
                            ? 'bg-[#D6B25E] text-black hover:bg-[#F2D27C] shadow-[0_0_15px_rgba(214,178,94,0.2)]'
                            : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                            }`}
                    >
                        {currentStep === STEPS.length - 1 ? 'Fertig' : 'Weiter'}
                        <ChevronRight size={16} />
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
