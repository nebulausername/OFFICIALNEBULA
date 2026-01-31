import React from 'react';
import { motion } from 'framer-motion';

export default function InfiniteMarquee() {
    const content = [
        "🚀 Blitzschneller Versand",
        "⭐ Premium Qualität",
        "🔒 Sicher Einkaufen",
        "🌌 Nebula Vibe",
        "💎 Exklusive Drops",
        "🌍 Worldwide Shipping"
    ];

    return (
        <div className="relative w-full overflow-hidden bg-[#0A0C10] border-y border-white/5 py-4">
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex space-x-12 px-6"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        duration: 20,
                        ease: "linear",
                        repeat: Infinity
                    }}
                >
                    {/* Double text for seamless loop */}
                    {[...content, ...content, ...content, ...content].map((item, i) => (
                        <span
                            key={i}
                            className="text-lg md:text-xl font-bold uppercase tracking-widest bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent opacity-80"
                            style={{
                                textShadow: '0 0 20px rgba(0,0,0,0.5)'
                            }}
                        >
                            {item}
                        </span>
                    ))}
                </motion.div>
            </div>

            {/* Fade Gradients */}
            <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-[#0A0C10] to-transparent pointer-events-none z-10" />
            <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-[#0A0C10] to-transparent pointer-events-none z-10" />
        </div>
    );
}
