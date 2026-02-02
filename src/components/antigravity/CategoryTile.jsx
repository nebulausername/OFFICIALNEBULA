import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CategoryTile({ category, className, aspect = "square" }) {
    // Safe image fallback
    const bgImage = category.image || category.cover_image || '/placeholder-category.jpg';

    return (
        <Link to={`/products?category=${category.id}`} className={`block relative group overflow-hidden rounded-3xl ${className}`}>
            <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgImage})` }}
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

            {/* Border Glow */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 group-hover:border-gold/50 transition-colors duration-300 pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end items-start z-10">
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-gold text-xs font-bold uppercase tracking-widest pl-1 mb-1 block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                        Collection
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-2 group-hover:text-shadow-gold transition-all">
                        {category.name}
                    </h3>

                    <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300 ease-in-out">
                        <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium pt-1">
                            <span>Jetzt entdecken</span>
                            <ArrowRight className="w-4 h-4 text-gold" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
