import React from 'react';
import { motion } from 'framer-motion';

export default function InfiniteMarquee() {
    const content = [
        "🚀 BLITZSCHNELLER VERSAND",
        "◆",
        "NEBULA 2.0 LIVE",
        "◆",
        "⭐ PREMIUM QUALITÄT",
        "◆",
        "🔒 SICHER EINKAUFEN",
        "◆",
        "💎 EXKLUSIVE DROPS",
        "◆",
        "🌍 WORLDWIDE SHIPPING",
        "◆",
        "🔥 HYPED RELEASES",
        "◆"
    ];

    return (
        <div className="relative w-full overflow-hidden border-y border-gold/10 bg-[#050608]/60 backdrop-blur-sm py-5 z-0">
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex space-x-0"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 25,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {[...content, ...content, ...content, ...content].map((item, i) => {
                        const isDiamond = item === "◆";
                        return (
                            <div key={i} className="flex items-center mx-6">
                                {isDiamond ? (
                                    <span className="text-gold/40 text-lg">◆</span>
                                ) : (
                                    <span
                                        className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter opacity-30 select-none hover:opacity-80 transition-all duration-500 cursor-default"
                                        style={{
                                            WebkitTextStroke: '1px rgba(214,178,94,0.35)',
                                            color: 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.WebkitTextStroke = '1.5px rgba(214,178,94,0.8)';
                                            e.target.style.textShadow = '0 0 30px rgba(214,178,94,0.2)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.WebkitTextStroke = '1px rgba(214,178,94,0.35)';
                                            e.target.style.textShadow = 'none';
                                        }}
                                    >
                                        {item}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Vignette with gold tint */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-transparent to-[#050608] pointer-events-none" />
            {/* Subtle top glow */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
        </div>
    );
}
