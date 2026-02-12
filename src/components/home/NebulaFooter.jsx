import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Youtube, ArrowRight, Shield, Truck, RefreshCw, Headphones, Mail, Send } from 'lucide-react';

export default function NebulaFooter() {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            setSubscribed(true);
            setTimeout(() => setSubscribed(false), 3000);
            setEmail('');
        }
    };

    const trustItems = [
        { icon: Shield, label: 'Secure Checkout', desc: 'SSL-encrypted' },
        { icon: Truck, label: 'Free Shipping', desc: 'Orders 50€+' },
        { icon: RefreshCw, label: 'Easy Returns', desc: '30-day policy' },
        { icon: Headphones, label: 'Premium Support', desc: '24/7 available' },
    ];

    const socialLinks = [
        { icon: Instagram, href: '#', label: 'Instagram' },
        { icon: Twitter, href: '#', label: 'X / Twitter' },
        { icon: Youtube, href: '#', label: 'YouTube' },
    ];

    const footerLinks = [
        { title: 'Shop', links: ['New Arrivals', 'Bestseller', 'Sale', 'Collections'] },
        { title: 'Info', links: ['Über Uns', 'Kontakt', 'FAQ', 'Blog'] },
        { title: 'Legal', links: ['AGB', 'Datenschutz', 'Impressum', 'Widerruf'] },
    ];

    return (
        <footer className="relative overflow-hidden bg-[#030305] pt-20 pb-8 border-t border-white/[0.05]">
            {/* Background NEBULA text */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <span
                    className="text-[20vw] font-black uppercase italic text-transparent opacity-[0.02] tracking-tighter animate-text-shimmer"
                    style={{
                        WebkitTextStroke: '1px rgba(214,178,94,0.06)',
                        backgroundImage: 'linear-gradient(90deg, transparent, rgba(214,178,94,0.04), transparent)',
                        backgroundClip: 'text',
                        backgroundSize: '200% auto',
                    }}
                >
                    NEBULA
                </span>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {/* Trust Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {trustItems.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-gold/30 hover:bg-gold/[0.03] transition-all duration-500 cursor-default"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 group-hover:shadow-[0_0_15px_rgba(214,178,94,0.2)] transition-all duration-500">
                                <item.icon className="w-5 h-5 text-gold" />
                            </div>
                            <div>
                                <div className="text-white text-sm font-bold">{item.label}</div>
                                <div className="text-zinc-500 text-xs">{item.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Footer Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand Column */}
                    <div className="md:col-span-4">
                        <h3 className="text-3xl font-black text-white italic tracking-tight mb-4 glow-gold">NEBULA</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs">
                            Premium Shopping, neu definiert. Exklusive Drops, kuratierte Collections und blitzschneller Versand.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((s, i) => (
                                <a
                                    key={i}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-gold hover:bg-gold/10 hover:border-gold/30 hover:shadow-[0_0_15px_rgba(214,178,94,0.2)] transition-all duration-300"
                                >
                                    <s.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Footer Links */}
                    {footerLinks.map((col, i) => (
                        <div key={i} className="md:col-span-2">
                            <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-5">{col.title}</h4>
                            <ul className="space-y-3">
                                {col.links.map((link, j) => (
                                    <li key={j}>
                                        <Link to="#" className="text-zinc-400 text-sm hover:text-gold transition-colors duration-300 hover:translate-x-1 inline-block transform">
                                            {link}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Newsletter */}
                    <div className="md:col-span-4 lg:col-span-2">
                        {/* Animated gradient border wrapper */}
                        <div className="relative p-[1px] rounded-2xl overflow-hidden gradient-border-animated">
                            <div className="bg-[#0a0a0c] rounded-2xl p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Mail className="w-4 h-4 text-gold" />
                                    <h4 className="text-white font-bold text-sm uppercase tracking-wider">Newsletter</h4>
                                </div>
                                <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                                    Drops & Deals direkt in dein Postfach.
                                </p>
                                <form onSubmit={handleSubscribe} className="flex gap-2">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 focus:bg-white/[0.08] transition-all"
                                    />
                                    <button
                                        type="submit"
                                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2D27C] to-[#D6B25E] flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_15px_rgba(214,178,94,0.3)]"
                                    >
                                        {subscribed ? '✓' : <Send className="w-4 h-4" />}
                                    </button>
                                </form>
                                {subscribed && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-emerald-400 text-xs mt-2 font-medium"
                                    >
                                        ✨ Willkommen im Club!
                                    </motion.p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/[0.05] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-600 text-xs">
                        © {new Date().getFullYear()} Nebula. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4 text-zinc-600 text-xs">
                        <span>Visa</span>
                        <span>Mastercard</span>
                        <span>PayPal</span>
                        <span>Apple Pay</span>
                        <span>Klarna</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
