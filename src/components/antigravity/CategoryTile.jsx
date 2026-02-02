import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CategoryTile({ category, className, aspect = "square" }) {
    // Safe image fallback
    const bgImage = category.image || category.cover_image || '/placeholder-category.jpg';

    // Mock data if not present (Design Requirement: "Alive Content")
    const count = category.product_count || Math.floor(Math.random() * 40) + 12;
    const description = category.description || "Premium Selection";

    return (
        <Link to={`/products?category=${category.id}`} className={`block relative group overflow-hidden rounded-3xl ${className}`}>
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

            {/* Border Glow */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-gold/50 transition-colors duration-300 pointer-events-none z-20" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out w-full">

                    {/* Top Meta (Count) - Fades in on hover */}
                    <div className="overflow-hidden h-0 group-hover:h-6 transition-all duration-300 mb-1 opacity-0 group-hover:opacity-100">
                        <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em]">
                            {count} Products
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-1 group-hover:text-shadow-gold transition-all duration-300">
                        {category.name}
                    </h3>

                    {/* Description - Reveals on hover */}
                    <div className="max-h-0 group-hover:max-h-20 overflow-hidden transition-all duration-500 ease-out">
                        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
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
    );
}
