import React from 'react';
import { motion } from 'framer-motion';

export default function InfiniteMarquee() {
    const content = [
        "🚀 BLITZSCHNELLER VERSAND",
        "///",
        "NEBULA 2.0 LIVE",
        "///",
        "⭐ PREMIUM QUALITÄT",
        "///",
        "🔒 SICHER EINKAUFEN",
        "///",
        "💎 EXKLUSIVE DROPS",
        "///",
        "🌍 WORLDWIDE SHIPPING",
        "///",
        "🔥 HYPED RELEASES",
        "///"
    ];

    return (
        <div className="relative w-full overflow-hidden border-y border-white/5 bg-[#050608]/50 backdrop-blur-sm py-4 z-0">
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex space-x-0"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 30,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {[...content, ...content, ...content, ...content].map((item, i) => (
                        <div key={i} className="flex items-center mx-8">
                            <span
                                className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter opacity-20 select-none hover:opacity-100 transition-opacity duration-300 cursor-default"
                                style={{
                                    WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                                    color: 'transparent'
                                }}
                            >
                                {item}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-transparent to-[#050608] pointer-events-none" />
        </div>
    );
}
