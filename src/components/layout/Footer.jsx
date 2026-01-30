import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Star, Instagram, Twitter, Facebook, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer({ theme = 'dark' }) {
    const isDark = theme === 'dark';

    return (
        <footer className="relative pt-20 pb-10 overflow-hidden" style={{ background: '#0B0D12' }}>
            {/* Background Glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to={createPageUrl('Home')} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center p-2"
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(214, 178, 94, 0.3)'
                                }}
                            >
                                <img
                                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69485b06ec2f632e2b935c31/4773f2b91_file_000000002dac71f4bee1a2e6c4d7d84f.png"
                                    alt="Nebula"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-2xl font-black tracking-tight text-white">
                                NEBULA
                            </span>
                        </Link>
                        <p className="text-zinc-400 font-medium leading-relaxed">
                            Dein Premium Store für Shisha, Vapes & Lifestyle.
                            Wir setzen neue Maßstäbe in Qualität und Design.
                        </p>
                        <div className="flex items-center gap-4">
                            {[Instagram, Twitter, Facebook].map((Icon, i) => (
                                <motion.a
                                    key={i}
                                    href="#"
                                    whileHover={{ scale: 1.1, color: '#D6B25E' }}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-white/10 transition-colors"
                                >
                                    <Icon className="w-5 h-5" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Shop</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Alle Produkte', link: 'Products' },
                                { label: 'Neuheiten', link: 'Products?sort=newest' },
                                { label: 'Bestseller', link: 'Products?tag=bestseller' },
                                { label: 'Sale', link: 'Products?tag=sale' }
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={createPageUrl(item.link)}
                                        className="text-zinc-400 hover:text-[#D6B25E] transition-colors font-medium flex items-center group"
                                    >
                                        <span className="w-0 group-hover:w-2 transition-all duration-300 h-[1px] bg-[#D6B25E] mr-0 group-hover:mr-2" />
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">Support</h3>
                        <ul className="space-y-4">
                            {[
                                { label: 'Hilfe & FAQ', link: 'FAQ' },
                                { label: 'Versand & Lieferung', link: 'Shipping' },
                                { label: 'Retouren', link: 'Returns' },
                                { label: 'Kontakt', link: 'Contact' }
                            ].map((item, i) => (
                                <li key={i}>
                                    <Link
                                        to={createPageUrl(item.link)}
                                        className="text-zinc-400 hover:text-[#D6B25E] transition-colors font-medium"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-6 pt-6 border-t border-white/5 space-y-3">
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Mail className="w-4 h-4 text-[#D6B25E]" />
                                <span>support@nebula.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-zinc-400">
                                <Phone className="w-4 h-4 text-[#D6B25E]" />
                                <span>+49 123 456 789</span>
                            </div>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-gradient-to-br from-zinc-900 to-[#0B0D12] rounded-2xl p-6 border border-white/5">
                        <h3 className="text-white font-bold text-lg mb-2">Newsletter</h3>
                        <p className="text-zinc-400 text-sm mb-6">
                            Sichere dir 10% Rabatt auf deine erste Bestellung & exklusive Drops.
                        </p>
                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Deine E-Mail Adresse"
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D6B25E]/50 transition-colors"
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] text-black font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2"
                            >
                                Anmelden
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-500 text-sm font-medium">
                        © 2026 Nebula Supply. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to={createPageUrl('Imprint')} className="text-zinc-500 hover:text-white text-sm transition-colors">Impressum</Link>
                        <Link to={createPageUrl('Privacy')} className="text-zinc-500 hover:text-white text-sm transition-colors">Datenschutz</Link>
                        <Link to={createPageUrl('Terms')} className="text-zinc-500 hover:text-white text-sm transition-colors">AGB</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
