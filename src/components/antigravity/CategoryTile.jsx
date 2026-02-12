import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Tilt } from 'react-tilt';

const defaultTiltOptions = {
    reverse: false,
    max: 12,
    perspective: 1000,
    scale: 1.03,
    speed: 800,
    transition: true,
    axis: null,
    reset: true,
    easing: "cubic-bezier(.03,.98,.52,.99)",
};

export default function CategoryTile({ category, className, aspect = "square" }) {
    const bgImage = category.image || category.cover_image || '/placeholder-category.jpg';
    const count = category.product_count || Math.floor(Math.random() * 40) + 12;
    const description = category.description || "Premium Selection";
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    const TileContent = () => (
        <div className={`block relative group overflow-hidden rounded-3xl ${className}`}>
            <Link to={`/products?category=${category.id}`} className="block w-full h-full">
                {/* Background Image with Zoom */}
                <motion.div
                    whileHover={{ scale: 1.12 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center origin-center"
                    style={{ backgroundImage: `url(${bgImage})` }}
                />

                {/* Stronger Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-85 transition-opacity duration-500" />

                {/* Hover color wash */}
                <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/5 transition-colors duration-700 mix-blend-overlay" />

                {/* Holographic Sheen on Hover (Desktop) */}
                <div className="hidden md:block absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transform transition-transform duration-1000 ease-in-out" />

                {/* Animated Gold Border Glow */}
                <div className="absolute inset-0 rounded-3xl border border-white/[0.08] group-hover:border-gold/50 transition-all duration-500 pointer-events-none z-20 group-hover:shadow-[inset_0_0_30px_rgba(214,178,94,0.08)]" />

                {/* Outer Glow on Hover */}
                <div className="absolute -inset-[1px] rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
                    style={{ boxShadow: '0 0 25px rgba(214,178,94,0.15), 0 0 50px rgba(214,178,94,0.05)' }}
                />

                {/* Content */}
                <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end items-start z-10">
                    <div className="md:transform md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out w-full">

                        {/* Top Meta (Count) */}
                        <div className="overflow-hidden h-auto md:h-0 md:group-hover:h-6 transition-all duration-300 mb-1 opacity-100 md:opacity-0 md:group-hover:opacity-100">
                            <span className="text-gold text-[10px] font-black uppercase tracking-[0.2em]"
                                style={{ textShadow: '0 0 10px rgba(214,178,94,0.3)' }}>
                                {count} Products
                            </span>
                        </div>

                        {/* Title - Bigger & Bolder */}
                        <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter mb-1 transition-all duration-300"
                            style={{
                                transform: 'translateZ(20px)',
                                textShadow: '0 2px 20px rgba(0,0,0,0.8)'
                            }}>
                            {category.name}
                        </h3>

                        {/* Description - Desktop Hover */}
                        <div className="hidden md:block max-h-0 group-hover:max-h-24 overflow-hidden transition-all duration-500 ease-out">
                            <p className="text-zinc-300 text-xs md:text-sm leading-relaxed mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" style={{ transform: 'translateZ(10px)' }}>
                                {description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-gold uppercase tracking-wider">
                                <span className="border-b border-gold/50 pb-0.5">Explore</span>
                                <ArrowRight className="w-3 h-3 text-gold group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );

    if (isMobile) {
        return <TileContent />;
    }

    return (
        <Tilt options={defaultTiltOptions}>
            <TileContent />
        </Tilt>
    );
}
