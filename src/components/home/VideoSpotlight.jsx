import React from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { Play, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function VideoSpotlight() {
    return (
        <section className="py-24 md:py-36 relative overflow-hidden bg-black">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/4 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[150px] -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-yellow-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full"
                            style={{
                                background: 'rgba(214, 178, 94, 0.1)',
                                border: '1px solid rgba(214, 178, 94, 0.3)',
                                boxShadow: '0 0 20px rgba(214, 178, 94, 0.1)'
                            }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: '#F2D27C' }} />
                            <span className="text-xs font-bold uppercase tracking-widest text-[#F2D27C]">
                                Luxury Experience
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] text-white">
                            Die Nebula <br />
                            <span className="bg-gradient-to-r from-[#E8C76A] via-[#F5D98B] to-[#E8C76A] bg-clip-text text-transparent drop-shadow-lg">
                                Welt
                            </span> erleben
                        </h2>

                        <p className="text-xl text-zinc-400 mb-12 leading-relaxed max-w-lg font-medium">
                            Tauche ein in eine neue Dimension des Shoppings. Unsere exklusiven Drops und kuratierten Collections warten darauf, von dir entdeckt zu werden.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to={createPageUrl('Products')}>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(214, 178, 94, 0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group h-14 px-8 rounded-2xl font-bold text-lg flex items-center gap-3 transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #D6B25E, #F2D27C)',
                                        color: '#000'
                                    }}
                                >
                                    Entdecken <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </motion.button>
                            </Link>

                            <motion.button
                                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                                className="h-14 w-14 rounded-2xl flex items-center justify-center border border-white/20 transition-all text-white"
                            >
                                <Play className="w-6 h-6 ml-1" />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Video/Image Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative group"
                    >
                        {/* Glow Effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-yellow-600/30 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-zinc-900">
                            {/* Using a high-quality smoke/luxury video loop or fallback image */}
                            {/* Since real video loops might break if source is gone, we use a reliable high-res image acting as a "thumbnail" for now, or a known reliable video URL if available. */}
                            {/* Trying a Pexels video link for Smoke effect */}
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover opacity-80"
                                poster="https://shisha-cloud.de/media/image/8c/9b/5f/elfbar-600-watermelon.jpg" // Fallback
                            >
                                <source src="https://cdn.coverr.co/videos/coverr-smoke-in-the-dark-4444/1080p.mp4" type="video/mp4" />
                            </video>

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                            {/* Content Over Video */}
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-bold text-lg">Cinematic Experience</div>
                                        <div className="text-zinc-400 text-sm">4K Ultra HD • 60 FPS</div>
                                    </div>
                                    <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-md">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating Decoration - Bottom Right */}
                        <motion.div
                            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -bottom-8 -right-8 w-28 h-28 rounded-3xl bg-gradient-to-br from-[#E8C76A] to-[#F5D98B] shadow-[0_20px_50px_rgba(232,199,106,0.5)] z-20 flex items-center justify-center p-1"
                        >
                            <div className="w-full h-full rounded-[20px] border-2 border-black/10 flex items-center justify-center bg-white/20 backdrop-blur-sm">
                                <Sparkles className="w-12 h-12 text-zinc-900" />
                            </div>
                        </motion.div>

                        {/* Floating Decoration - Top Left */}
                        <motion.div
                            animate={{ y: [0, 15, 0], x: [0, 10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute -top-6 -left-6 z-20"
                        >
                            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={`w-8 h-8 rounded-full border-2 border-zinc-900 bg-zinc-800 bg-[url('https://i.pravatar.cc/100?img=${i + 10}')] bg-cover`} />
                                        ))}
                                    </div>
                                    <div className="text-xs">
                                        <span className="block text-white font-bold">1.2k+</span>
                                        <span className="text-zinc-500">Watching</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </motion.div>
                </div>
            </div>
        </section>
    );
}
