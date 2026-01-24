import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Crown, Sparkles, Star, Lock } from 'lucide-react';
import { useI18n } from '@/components/i18n/I18nProvider';

const RANKS = {
    NUTZER: { name: 'Nutzer', color: 'text-zinc-400', threshold: 0, next: 'Kunde', icon: UserIcon },
    KUNDE: { name: 'Kunde', color: 'text-orange-400', threshold: 1, next: 'VIP', icon: Star },
    VIP: { name: 'VIP', color: 'text-zinc-300', threshold: 500, next: 'VIP+', icon: Crown },
    VIP_PLUS: { name: 'VIP+', color: 'text-yellow-400', threshold: 1500, next: 'Nebula', icon: Crown },
    NEBULA: { name: 'NEBULA', color: 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500', threshold: 5000, next: null, icon: Sparkles }
};

function UserIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

export default function RankCard({ user }) {
    const { t } = useI18n();

    const currentRankKey = useMemo(() => {
        if (!user) return 'NUTZER';
        const r = user.rank ? user.rank.toUpperCase() : 'NUTZER';
        return RANKS[r] ? r : 'NUTZER';
    }, [user]);

    const config = RANKS[currentRankKey];
    const spend = Number(user?.lifetime_spend || 0);

    // Calculate Progress
    const nextRankKey = config.next ? Object.keys(RANKS).find(k => RANKS[k].name === config.next) : null;
    const nextRankConfig = nextRankKey ? RANKS[nextRankKey] : null;

    const currentThreshold = config.threshold;
    const nextThreshold = nextRankConfig ? nextRankConfig.threshold : spend; // If max rank, progress is 100%

    const progressPercent = useMemo(() => {
        if (!nextRankConfig) return 100;
        const totalNeeded = nextThreshold - currentThreshold;
        const currentProgress = spend - currentThreshold;
        const p = (currentProgress / totalNeeded) * 100;
        return Math.min(Math.max(p, 0), 100);
    }, [spend, currentThreshold, nextThreshold, nextRankConfig]);

    const Icon = config.icon || Star;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-1"
        >
            {/* Animated Border Gradient */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 opacity-50"
                style={{ animation: 'spin 4s linear infinite' }}
            />
            <div className="absolute inset-[2px] bg-black rounded-[22px] z-0" />

            {/* Content */}
            <div className="relative z-10 p-6 md:p-8 flex flex-col items-center text-center">

                {/* Helper Animation for Border Spin effect (Global CSS usually needed, strictly inline for now) */}
                <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>

                {/* Glow behind Icon */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-3xl opacity-20 bg-gradient-to-r from-purple-600 to-pink-600 pointer-events-none`} />

                <div className="mb-4 relative">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Icon className={`w-16 h-16 ${config.color === 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500' ? 'text-purple-400' : config.color}`} />
                    </motion.div>
                    {currentRankKey === 'NEBULA' && (
                        <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-yellow-400 animate-pulse" />
                    )}
                </div>

                <h2 className="text-zinc-400 text-sm font-bold uppercase tracking-widest mb-1">
                    Aktueller Status
                </h2>
                <h1 className={`text-4xl md:text-5xl font-black mb-6 ${config.color}`}>
                    {config.name}
                </h1>

                {/* Progress Section */}
                {nextRankConfig ? (
                    <div className="w-full max-w-sm">
                        <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                            <span>{spend.toFixed(2)}€</span>
                            <span className="text-zinc-500">Ziel: {nextThreshold}€</span>
                        </div>

                        <div className="h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 shadow-inner relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 relative`}
                            >
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>

                        <p className="mt-3 text-sm font-medium text-zinc-300">
                            Noch <span className="text-white font-bold">{(nextThreshold - spend).toFixed(2)}€</span> bis <span className={`${nextRankConfig.color} font-bold`}>{nextRankConfig.name}</span>
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                            Maximaler Rang erreicht!
                        </p>
                        <p className="text-zinc-500 text-sm mt-1">Du bist eine Legende.</p>
                    </div>
                )}

            </div>
        </motion.div>
    );
}
