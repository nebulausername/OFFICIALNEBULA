import React from 'react';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';

export default function VideoSpotlight() {
    return (
        <section className="py-20 md:py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div
                            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full"
                            style={{
                                background: 'rgba(214, 178, 94, 0.08)',
                                border: '1px solid rgba(214, 178, 94, 0.25)'
                            }}
                        >
                            <Sparkles className="w-4 h-4" style={{ color: '#F2D27C' }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F2D27C' }}>
                                Luxury Experience
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight text-white">
                            Die Nebula <span className="bg-gradient-to-r from-[#E8C76A] to-[#F5D98B] bg-clip-text text-transparent">Welt</span> erleben
                        </h2>

                        <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed max-w-xl">
                            Tauche ein in eine neue Dimension des Shoppings. Unsere exklusiven Drops und kuratierten Collections warten auf dich.
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-gold flex items-center gap-3 h-14 px-8 rounded-2xl"
                        >
                            Entdecken <Play className="w-5 h-5 fill-current" />
                        </motion.button>
                    </motion.div>

                    {/* Video Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="aspect-video rounded-[2.5rem] overflow-hidden glass-panel-hover border-[3px] border-white/5 shadow-2xl relative">
                            <ReactPlayer
                                url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Placeholder, user will likely update this
                                width="100%"
                                height="100%"
                                playing
                                muted
                                loop
                                config={{
                                    youtube: {
                                        playerVars: { showinfo: 0, controls: 0, modestbranding: 1 }
                                    }
                                }}
                                className="absolute top-0 left-0"
                            />

                            {/* Visual Polish Overlay */}
                            <div className="absolute inset-0 pointer-events-none" style={{
                                background: 'linear-gradient(to top, rgba(10,12,16,0.5), transparent)'
                            }} />
                        </div>

                        {/* Floating Decoration */}
                        <motion.div
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-3xl p-4 bg-gradient-to-br from-[#E8C76A] to-[#F5D98B] shadow-2xl z-20 flex items-center justify-center border-4 border-[#0A0C10]"
                        >
                            <Sparkles className="w-10 h-10 text-black" />
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
