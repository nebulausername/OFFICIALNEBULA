import React from 'react';
import { Link } from 'react-router-dom';
import {
    Zap, Crown, Package, ShieldCheck,
    Instagram, Twitter, Youtube, ArrowRight, Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const SocialButton = ({ icon: Icon, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-gold hover:text-black hover:border-gold transition-all duration-300 group"
    >
        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    </a>
);

export default function NebulaFooter() {
    return (
        <footer className="relative bg-[#050608] pt-24 pb-12 overflow-hidden border-t border-white/5">

            {/* Background Typography */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-[0.03] select-none flex items-center justify-center overflow-hidden">
                <h1 className="text-[20vw] font-black text-white whitespace-nowrap">NEBULA</h1>
            </div>

            <div className="max-w-7xl mx-auto px-4 relative z-10">

                {/* Top Section: Newsletter & Brand */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Link to="/" className="inline-block">
                            <h2 className="text-4xl font-black text-white tracking-tighter">
                                NEBULA<span className="text-gold">.</span>
                            </h2>
                        </Link>
                        <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
                            Defining the future of streetwear culture. Premium drops, exclusive access, and a community that moves fast.
                        </p>
                        <div className="flex gap-4 pt-4">
                            <SocialButton icon={Instagram} href="#" />
                            <SocialButton icon={Twitter} href="#" />
                            <SocialButton icon={Youtube} href="#" />
                        </div>
                    </div>

                    {/* Newsletter Column */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group hover:border-gold/30 transition-colors duration-500">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-gold/10 rounded-full blur-3xl group-hover:bg-gold/20 transition-all" />

                        <h3 className="text-2xl font-bold text-white mb-2">Join the Inner Circle</h3>
                        <p className="text-zinc-400 mb-6">Erhalte Early Access zu Drops und exklusive Discounts.</p>

                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                <input
                                    type="email"
                                    placeholder="deine@email.com"
                                    className="w-full h-12 bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-gold/50 transition-all"
                                />
                            </div>
                            <Button className="h-12 px-6 bg-gold text-black font-bold hover:bg-gold/90 transition-all">
                                Join <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Trust Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 border-y border-white/5 py-12">
                    {[
                        { icon: Zap, title: "Blitzversand", desc: "Shipping in 24h" },
                        { icon: ShieldCheck, title: "Authentic", desc: "100% Verified" },
                        { icon: Crown, title: "VIP Access", desc: "Earn Rewards" },
                        { icon: Package, title: "Secure Pkg", desc: "Discreet Box" },
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center gap-3 group">
                            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-gold group-hover:bg-gold/10 group-hover:scale-110 transition-all duration-300">
                                <item.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-1">{item.title}</h4>
                                <p className="text-xs text-zinc-500 uppercase tracking-wider">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Links */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm text-zinc-400 pb-8">
                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Shop</h5>
                        <ul className="space-y-2">
                            <li><Link to="/products" className="hover:text-gold transition-colors">All Products</Link></li>
                            <li><Link to="/products?sort=new" className="hover:text-gold transition-colors">New Arrivals</Link></li>
                            <li><Link to="/products?sort=sale" className="hover:text-gold transition-colors">Archive Sale</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Support</h5>
                        <ul className="space-y-2">
                            <li><Link to="/help" className="hover:text-gold transition-colors">Help Center</Link></li>
                            <li><Link to="/returns" className="hover:text-gold transition-colors">Returns</Link></li>
                            <li><Link to="/shipping" className="hover:text-gold transition-colors">Shipping Info</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Legal</h5>
                        <ul className="space-y-2">
                            <li><Link to="/imprint" className="hover:text-gold transition-colors">Impressum</Link></li>
                            <li><Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h5 className="font-bold text-white mb-4 uppercase tracking-widest text-xs">Payment</h5>
                        <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Placeholders for payment icons */}
                            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">VISA</div>
                            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">MC</div>
                            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-[10px]">PP</div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center bg-transparent">
                    <p className="text-zinc-600 text-xs">
                        © 2024 NEBULA OFFICIAL. All rights reserved.
                    </p>
                    <p className="text-zinc-700 text-xs flex items-center gap-2 mt-4 md:mt-0">
                        Design by <span className="text-zinc-500">ANTIGRAVITY</span>
                    </p>
                </div>

            </div>
        </footer>
    );
}
