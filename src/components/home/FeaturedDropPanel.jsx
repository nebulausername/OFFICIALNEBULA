import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';

export default function FeaturedDropPanel({ product }) {
    if (!product) {
        // FALLBACK: Collection Teaser
        return (
            <div className="w-full h-full min-h-[500px] rounded-3xl relative overflow-hidden group border border-white/10 bg-[#0E1015]">
                <div className="absolute inset-0 bg-[url('/images/hero-collection-bg.jpg')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-left">
                    <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 border border-gold/30 text-gold text-xs font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" />
                        <span>New Collection</span>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-white leading-none mb-4">
                        FUTURE<br />READY
                    </h3>
                    <p className="text-zinc-400 max-w-sm mb-8 text-sm md:text-base">
                        Entdecke die neueste Generation an Vapes und Accessoires. Premium Qualität für Kenner.
                    </p>
                    <Link to={createPageUrl('Products')}>
                        <Button variant="default" size="lg" className="w-full md:w-auto">
                            Kollektion ansehen
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    // PRODUCT FEATURE
    const imageSrc = product.cover_image || (product.images && product.images[0]) || '/placeholder.png';

    return (
        <div className="w-full h-full min-h-[500px] rounded-3xl relative overflow-hidden border border-white/10 bg-[#0E1015] flex flex-col">
            {/* Background Blur Effect */}
            <div className="absolute inset-0">
                <img src={imageSrc} alt="" className="w-full h-full object-cover blur-[50px] opacity-20" />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="p-6 flex justify-between items-start">
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1">
                            <Timer className="w-3 h-3" /> Limited
                        </span>
                        <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1">
                            <Star className="w-3 h-3" /> Top Pick
                        </span>
                    </div>
                </div>

                {/* Hero Image */}
                <div className="flex-grow flex items-center justify-center p-8 relative group">
                    <div className="absolute inset-0 bg-gradient-radial from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                        <motion.img
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            src={imageSrc}
                            alt={product.name}
                            className="max-h-[300px] object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-500"
                        />
                    </Link>
                </div>

                {/* Footer Info */}
                <div className="p-8 bg-black/40 backdrop-blur-md border-t border-white/5">
                    <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`} className="block group">
                        <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-gold transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex flex-col">
                            <span className="text-zinc-500 text-xs uppercase tracking-wider">Price</span>
                            <span className="text-xl font-bold text-white">{product.price}€</span>
                        </div>
                        <Link to={`${createPageUrl('ProductDetail')}?id=${product.id}`}>
                            <Button className="rounded-full w-12 h-12 p-0 flex items-center justify-center">
                                <ArrowRight className="w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
