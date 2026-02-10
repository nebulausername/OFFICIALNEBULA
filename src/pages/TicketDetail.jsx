import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api';
import { useRealtime } from '@/hooks/useRealtime';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Download,
    Share2,
    Clock,
    CheckCircle,
    Truck
} from 'lucide-react';
import { createPageUrl } from '../utils';

export default function TicketDetail() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    const fetchData = async () => {
        try {
            setLoading(true);
            const [ticketData, itemsData] = await Promise.all([
                api.entities.Request.get(id),
                api.entities.RequestItem.filter({ request_id: id })
            ]);
            setTicket(ticketData);
            setItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (error) {
            console.error('Failed to load ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    // Realtime Updates
    useRealtime('requests', (payload) => {
        if (payload.new && payload.new.id === id) {
            setTicket(prev => ({ ...prev, ...payload.new }));
        }
    }, ['UPDATE'], `id=eq.${id}`);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
                <div className="w-10 h-10 border-4 border-[#D6B25E]/20 border-t-[#D6B25E] rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A0C10] text-white">
                <h1 className="text-2xl font-bold mb-4">Ticket nicht gefunden</h1>
                <Link to="/tickets" className="text-[#D6B25E] hover:underline">Zurück zur Übersicht</Link>
            </div>
        );
    }

    // Progress logic
    const steps = ['pending', 'processing', 'shipped', 'completed'];
    const currentStepIndex = steps.indexOf(ticket.status) === -1 ? 0 : steps.indexOf(ticket.status);
    const progress = Math.max(5, ((currentStepIndex) / (steps.length - 1)) * 100);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-[#0A0C10] text-white">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link to="/tickets" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Zurück
                    </Link>
                    <h1 className="text-3xl font-black">Ticket #{ticket.id.slice(0, 8).toUpperCase()}</h1>
                </div>

                {/* 🎫 Main Ticket Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white text-black rounded-3xl overflow-hidden relative shadow-2xl shadow-white/5"
                >
                    {/* Top Section (Header) */}
                    <div className="bg-[#D6B25E] p-6 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        <div className="flex justify-between items-start relative z-10">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-black/60 mb-1">OFFICIAL NEBULA</div>
                                <div className="text-2xl font-black">Digital Receipt</div>
                            </div>
                            <div className="bg-black/10 backdrop-blur-sm p-2 rounded-lg">
                                <Package className="w-6 h-6 text-black" />
                            </div>
                        </div>
                    </div>

                    {/* Jagged Divider */}
                    <div className="h-4 bg-[#D6B25E] relative">
                        <div className="absolute bottom-0 w-full h-2 bg-white" style={{ clipPath: 'polygon(0 100%, 2% 0, 4% 100%, 6% 0, 8% 100%, 10% 0, 12% 100%, 14% 0, 16% 100%, 18% 0, 20% 100%, 22% 0, 24% 100%, 26% 0, 28% 100%, 30% 0, 32% 100%, 34% 0, 36% 100%, 38% 0, 40% 100%, 42% 0, 44% 100%, 46% 0, 48% 100%, 50% 0, 52% 100%, 54% 0, 56% 100%, 58% 0, 60% 100%, 62% 0, 64% 100%, 66% 0, 68% 100%, 70% 0, 72% 100%, 74% 0, 76% 100%, 78% 0, 80% 100%, 82% 0, 84% 100%, 86% 0, 88% 100%, 90% 0, 92% 100%, 94% 0, 96% 100%, 98% 0, 100% 100%)' }}></div>
                    </div>

                    {/* Content Body */}
                    <div className="p-8">
                        {/* Status Bar */}
                        <div className="mb-8">
                            <div className="flex justify-between text-sm font-bold text-zinc-500 mb-2">
                                <span>Status</span>
                                <span className="text-black uppercase">{ticket.status}</span>
                            </div>
                            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="h-full bg-black rounded-full"
                                />
                            </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-4 mb-8">
                            {items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-dashed border-zinc-200 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-zinc-100 rounded-md flex items-center justify-center font-bold text-xs text-zinc-500">
                                            {item.quantity}x
                                        </div>
                                        <span className="font-bold text-sm">{item.product_name || 'Item'}</span>
                                    </div>
                                    <span className="font-mono font-medium">
                                        {parseFloat(item.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-zinc-50 p-4 rounded-xl space-y-2 mb-8">
                            <div className="flex justify-between text-sm text-zinc-500">
                                <span>Zwischensumme</span>
                                <span>{(parseFloat(ticket.total_sum) * 0.81).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                            <div className="flex justify-between text-sm text-zinc-500">
                                <span>MwSt. (19%)</span>
                                <span>{(parseFloat(ticket.total_sum) * 0.19).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black border-t border-zinc-200 pt-2 mt-2">
                                <span>Gesamt</span>
                                <span>{parseFloat(ticket.total_sum).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="grid grid-cols-2 gap-4 text-xs text-zinc-500">
                            <div>
                                <span className="block font-bold text-black mb-1">Datum</span>
                                {new Date(ticket.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div>
                                <span className="block font-bold text-black mb-1">Ticket ID</span>
                                {ticket.id.slice(0, 12)}...
                            </div>
                            <div className="col-span-2">
                                <span className="block font-bold text-black mb-1">Lieferadresse</span>
                                {ticket.contact_info ? (
                                    <div className="space-y-0.5">
                                        <p>{ticket.contact_info.name}</p>
                                        <p>{ticket.contact_info.address}</p>
                                        <p>{ticket.contact_info.zip} {ticket.contact_info.city}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1">{ticket.contact_info.country}</p>
                                    </div>
                                ) : (
                                    <span className="text-zinc-400">Keine Adresse angegeben</span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex gap-3 print:hidden">
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download size={16} />
                                Speichern / Drucken
                            </button>
                            <Link
                                to="/support"
                                className="flex-1 bg-zinc-100 text-black py-3 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={16} />
                                Support
                            </Link>
                        </div>
                    </div>

                    {/* Bottom Code Area */}
                    <div className="bg-black text-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="tracking-[0.3em] text-xs text-zinc-500 mb-2 font-mono">SCAN FOR AUTHENTICITY</div>
                        {/* Simulated Barcode */}
                        <div className="flex gap-1 h-8 opacity-80 mb-2">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="bg-white" style={{ width: Math.random() > 0.5 ? '2px' : '4px' }}></div>
                            ))}
                        </div>
                        <p className="text-[10px] text-zinc-600 font-mono">{ticket.id}</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
