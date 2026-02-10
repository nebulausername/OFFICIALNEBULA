import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, ChevronRight, Ruler, Sparkles, Shirt, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';

const STEPS = [
    {
        id: 'interests',
        title: 'Was feierst du?',
        description: 'Wir zeigen dir nur, was dich interessiert.',
        options: [
            { id: 'hoodies', label: 'Heavy Hoodies', icon: '🧥' },
            { id: 'tees', label: 'Oversized Tees', icon: '👕' },
            { id: 'pants', label: 'Pants', icon: '👖' },
            { id: 'accessories', label: 'Accessories', icon: '🧢' },
            { id: 'limited', label: 'Limited Drops', icon: '🔥' }
        ]
    },
    {
        id: 'fit',
        title: 'Deine Fit-Präferenz?',
        description: 'Damit wir dir die richtige Size empfehlen.',
        options: [
            { id: 'regular', label: 'Regular Fit', icon: <Shirt className="w-5 h-5" /> },
            { id: 'oversized', label: 'Heavy Oversized', icon: <div className="w-6 h-6 border-2 border-current rounded-sm flex items-center justify-center font-bold text-[10px]">OS</div> },
            { id: 'slim', label: 'Slim / Athletic', icon: <Ruler className="w-5 h-5" /> }
        ]
    }
];

export default function IntroWizard({ onComplete }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState({
        interests: [],
        fit: null
    });

    const handleSelection = (stepId, value) => {
        if (stepId === 'interests') {
            setSelections(prev => ({
                ...prev,
                interests: prev.interests.includes(value)
                    ? prev.interests.filter(i => i !== value)
                    : [...prev.interests, value].slice(0, 3) // Max 3
            }));
        } else {
            setSelections(prev => ({ ...prev, fit: value }));
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Finish
            triggerConfetti();
            setTimeout(onComplete, 1000);
        }
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#D6B25E', '#FFFFFF']
        });
    };

    // Ready Step
    if (currentStep === STEPS.length) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl px-4"
            >
                <div className="text-center max-w-sm w-full">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        type="spring"
                        className="w-24 h-24 bg-[#D6B25E] rounded-full flex items-center justify-center mx-auto mb-6 text-black shadow-[0_0_40px_rgba(214,178,94,0.4)]"
                    >
                        <Check size={48} strokeWidth={3} />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-2">Alles ready!</h2>
                    <p className="text-zinc-400 mb-8">Dein Feed wurde personalisiert.</p>
                    <Button
                        onClick={nextStep} // Trigger close
                        className="w-full h-14 bg-white text-black hover:bg-zinc-100 rounded-full font-bold text-lg"
                    >
                        Loslegen 🚀
                    </Button>
                </div>
            </motion.div>
        );
    }

    const stepData = STEPS[currentStep];
    const canProceed = stepData.id === 'interests'
        ? selections.interests.length > 0
        : selections.fit !== null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                key={currentStep}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="bg-[#0A0C10] w-full max-w-md rounded-3xl border border-zinc-800 p-6 md:p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {[...Array(STEPS.length + 1)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= currentStep ? 'bg-[#D6B25E]' : 'bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <h2 className="text-2xl font-bold text-white mb-2">{stepData.title}</h2>
                <p className="text-zinc-400 mb-6">{stepData.description}</p>

                <div className="space-y-3 mb-8 min-h-[200px]">
                    {stepData.options.map(option => {
                        const isSelected = stepData.id === 'interests'
                            ? selections.interests.includes(option.id)
                            : selections.fit === option.id;

                        return (
                            <motion.button
                                description={option.id}
                                key={option.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelection(stepData.id, option.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected
                                        ? 'border-[#D6B25E] bg-[#D6B25E]/10 text-white'
                                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{option.icon}</span>
                                    <span className="font-medium">{option.label}</span>
                                </div>
                                {isSelected && <Check size={18} className="text-[#D6B25E]" />}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onComplete} // Skip
                        className="text-sm text-zinc-500 hover:text-white transition-colors"
                    >
                        Überspringen
                    </button>
                    <Button
                        onClick={nextStep}
                        disabled={!canProceed}
                        className={`rounded-full px-8 h-12 transition-all ${canProceed
                                ? 'bg-[#D6B25E] text-black hover:bg-[#F2D27C] shadow-lg shadow-[#D6B25E]/20'
                                : 'bg-zinc-800 text-zinc-500'
                            }`}
                    >
                        {currentStep === STEPS.length - 1 ? 'Fertig' : 'Weiter'}
                        <ChevronRight size={18} className="ml-2" />
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
