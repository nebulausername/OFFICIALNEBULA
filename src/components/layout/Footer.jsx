import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { Instagram, Twitter, Facebook, Mail, Phone, ArrowRight, Check, X, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer({ theme = 'dark' }) {
    const isDark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleSubscribe = async (e) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (email.includes('@')) {
            setStatus('success');
            setEmail('');
        } else {
            setStatus('error');
        }
    };

    return (
        <footer className="relative pt-20 pb-10 overflow-hidden bg-[#050608] border-t border-white/5">
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
                                    onClick={(e) => e.preventDefault()}
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
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="bg-[#0E1015] rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

                        <h3 className="text-white font-bold text-lg mb-2 relative z-10">Newsletter</h3>
                        <p className="text-zinc-400 text-sm mb-6 relative z-10">
                            Sichere dir 10% Rabatt auf deine erste Bestellung & exklusive Drops.
                        </p>

                        <form onSubmit={handleSubscribe} className="space-y-3 relative z-10">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                placeholder="Deine E-Mail Adresse"
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#D6B25E]/50 transition-colors disabled:opacity-50"
                            />

                            <AnimatePresence mode='wait'>
                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        className="w-full bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl px-4 py-3 font-bold flex items-center justify-center gap-2"
                                    >
                                        <Check className="w-4 h-4" /> Angemeldet!
                                    </motion.div>
                                ) : (
                                    <motion.button
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={status === 'loading'}
                                        className="w-full bg-gradient-to-r from-[#D6B25E] to-[#F2D27C] text-black font-bold rounded-xl px-4 py-3 flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {status === 'loading' ? 'Lade...' : 'Anmelden'}
                                        {!status && <ArrowRight className="w-4 h-4" />}
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {status === 'error' && (
                                <p className="text-red-400 text-xs mt-1">Bitte gib eine gültige E-Mail ein.</p>
                            )}

                            <p className="text-[10px] text-zinc-600 mt-2">
                                Mit der Anmeldung stimmst du unseren Datenschutzbestimmungen zu.
                            </p>
                        </form>
                    </div>
                </div>

                {/* Trust Footer Row */}
                <div className="py-6 border-t border-white/5 flex flex-wrap justify-center gap-8 mb-4">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <Truck className="w-4 h-4 text-zinc-400" />
                        <span>Kostenloser Versand ab 50€</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <ShieldCheck className="w-4 h-4 text-zinc-400" />
                        <span>Sichere Bezahlung</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <RotateCcw className="w-4 h-4 text-zinc-400" />
                        <span>30 Tage Rückgaberecht</span>
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
