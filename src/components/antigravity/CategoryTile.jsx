import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Tilt } from 'react-tilt';

const defaultTiltOptions = {
    reverse: false,  // reverse the tilt direction
    max: 15,     // max tilt rotation (degrees)
    perspective: 1000,   // Transform perspective, the lower the more extreme the tilt gets.
    scale: 1.02,    // 2 = 200%, 1.5 = 150%, etc..
    speed: 1000,   // Speed of the enter/exit transition
    transition: true,   // Set a transition on enter/exit.
    axis: null,   // What axis should be disabled. Can be X or Y.
    reset: true,    // If the tilt effect has to be reset on exit.
    easing: "cubic-bezier(.03,.98,.52,.99)",    // Easing on enter/exit.
};

export default function CategoryTile({ category, className, aspect = "square" }) {
    // Safe image fallback
    const bgImage = category.image || category.cover_image || '/placeholder-category.jpg';

    // Mock data if not present (Design Requirement: "Alive Content")
    const count = category.product_count || Math.floor(Math.random() * 40) + 12;
    const description = category.description || "Premium Selection";

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const TileContent = () => (
        <div className={`block relative group overflow-hidden rounded-3xl ${className}`}>
            <Link to={`/products?category=${category.id}`} className="block w-full h-full">
                {/* Background Image with Zoom */}
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center origin-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />

                {/* Premium Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                <div className="absolute inset-0 bg-[#000000] opacity-0 group-hover:opacity-30 transition-opacity duration-300 mix-blend-multiply" />

                {/* Holographic Sheen on Hover (Desktop) */}
                <div className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-in-out" />

                {/* Border Glow */}
                <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-gold/50 transition-colors duration-300 pointer-events-none z-20" />

                {/* Content */}
                <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end items-start z-10">
                    <div className="md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out w-full">

                        {/* Top Meta (Count) - Mobile: Always Visible. Desktop: Fade In */}
                        <div className="overflow-hidden h-auto md:h-0 md:group-hover:h-6 transition-all duration-300 mb-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                            <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em]">
                                {count} Products
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter mb-1 group-hover:text-shadow-gold transition-all duration-300" style={{ transform: 'translateZ(20px)' }}>
                            {category.name}
                        </h3>

                        {/* Description - Mobile: Hidden (too cluttery). Desktop: Hover */}
                        <div className="hidden md:block max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500 ease-out">
                            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ transform: 'translateZ(10px)' }}>
                                {description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                                <span className="border-b border-gold/50 pb-0.5">Explore</span>
                                <ArrowRight className="w-3 h-3 text-gold" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    // Disable Tilt on Mobile for performance
    if (isMobile) {
        return <TileContent />;
    }

    return (
        <Tilt options={defaultTiltOptions}>
            <TileContent />
        </Tilt>
    );
}
