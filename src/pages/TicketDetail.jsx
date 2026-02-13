import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '@/api';
import { useRealtime } from '@/hooks/useRealtime';
import { useChat } from '@/contexts/ChatContext';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Download,
    Share2,
    Clock,
    CheckCircle2,
    Truck,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function TicketDetail() {
    const { id } = useParams();
    const { openChat } = useChat();
    const { toast } = useToast();
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

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Kopiert",
            description: "Ticket-ID in die Zwischenablage kopiert.",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#050608]">
                <div className="w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#050608] text-white">
                <h1 className="text-3xl font-black mb-4">Ticket nicht gefunden</h1>
                <Link to="/tickets" className="text-gold hover:underline">Zurück zur Übersicht</Link>
            </div>
        );
    }

    // Status Logic for "Inquiry Flow"
    // 'pending' -> Eingang bestätigt
    // 'processing' -> Verfügbarkeit wird geprüft
    // 'completed' -> Angebot bereit
    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
            case 'open':
                return { label: 'Eingegangen', description: 'Deine Anfrage wird bearbeitet.', color: 'bg-blue-500', icon: Clock, step: 1 };
            case 'processing':
                return { label: 'In Prüfung', description: 'Wir prüfen die Verfügbarkeit.', color: 'bg-purple-500', icon: ShieldCheck, step: 2 };
            case 'shipped': // Reused for "Offer Ready" in this context if adapted, or strict mapping
                return { label: 'Versendet', description: 'Deine Bestellung ist unterwegs.', color: 'bg-emerald-500', icon: Truck, step: 3 };
            case 'completed': // Payment Done / Finished
                return { label: 'Abgeschlossen', description: 'Vorgang erfolgreich beendet.', color: 'bg-gold', icon: CheckCircle2, step: 4 };
            default:
                return { label: 'Status Unbekannt', description: 'Bitte Support kontaktieren.', color: 'bg-zinc-500', icon: Clock, step: 0 };
        }
    };

    const statusInfo = getStatusInfo(ticket.status);

    return (
        <div className="min-h-screen bg-[#050608] text-white font-sans selection:bg-gold/30 pt-24 pb-20">

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] opacity-20" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[100px] opacity-20" />
            </div>

            <div className="max-w-4xl mx-auto px-4 relative z-10">
                {/* Header Navigation */}
                <div className="flex justify-between items-center mb-8">
                    <Link to="/shop" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-medium">Zurück zum Shop</span>
                    </Link>
                    <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-full flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${ticket.status === 'completed' ? 'bg-emerald-500' : 'animate-pulse bg-gold'}`} />
                        <span className="text-xs font-bold uppercase tracking-wider">{statusInfo.label}</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Ticket Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl"
                        >
                            {/* Premium Header Strip */}
                            <div className="h-2 bg-gradient-to-r from-gold via-[#F2D27C] to-[#D6B25E]" />

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h1 className="text-3xl font-black text-white mb-2">Anfrage bestätigt</h1>
                                        <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm group cursor-pointer" onClick={() => copyToClipboard(ticket.id)}>
                                            <span>#{ticket.id.slice(0, 8)}</span>
                                            <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="w-14 h-14 bg-gradient-to-br from-gold/20 to-gold/5 rounded-2xl flex items-center justify-center text-gold border border-gold/20 shadow-[0_0_15px_rgba(214,178,94,0.1)]">
                                        <CheckCircle2 size={28} />
                                    </div>
                                </div>

                                {/* Status Timeline */}
                                <div className="mb-10 relative">
                                    <div className="absolute left-0 top-1/2 w-full h-1 bg-zinc-800 -translate-y-1/2 rounded-full" />
                                    <div
                                        className="absolute left-0 top-1/2 h-1 bg-gold -translate-y-1/2 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.min(100, (statusInfo.step / 4) * 100)}%` }}
                                    />

                                    <div className="relative flex justify-between">
                                        {[1, 2, 3, 4].map((step) => {
                                            const isActive = statusInfo.step >= step;
                                            const isCurrent = statusInfo.step === step;
                                            return (
                                                <div key={step} className="flex flex-col items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center bg-[#050608] z-10 transition-colors duration-500
                                                        ${isActive ? 'border-gold text-gold shadow-[0_0_10px_rgba(214,178,94,0.4)]' : 'border-zinc-800 text-zinc-700'}
                                                    `}>
                                                        {isActive ? <div className="w-2.5 h-2.5 bg-gold rounded-full" /> : <div className="w-2.5 h-2.5 bg-zinc-800 rounded-full" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-2">
                                        <span>Anfrage</span>
                                        <span className={statusInfo.step >= 2 ? 'text-white' : ''}>Prüfung</span>
                                        <span className={statusInfo.step >= 3 ? 'text-white' : ''}>Angebot</span>
                                        <span className={statusInfo.step >= 4 ? 'text-white' : ''}>Versand</span>
                                    </div>
                                </div>

                                {/* Action Required Box */}
                                {ticket.status !== 'completed' && (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 flex items-start gap-4">
                                        <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 shrink-0 animate-pulse">
                                            <MessageCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-white mb-1">Nächster Schritt</h3>
                                            <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                                                Ein Mitarbeiter prüft deine Anfrage aktuell auf Lagerbestand und Machbarkeit.
                                                Du erhältst in Kürze eine Benachrichtigung im Live-Chat oder per Telegram.
                                            </p>
                                            <Button
                                                onClick={openChat}
                                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl gap-2 shadow-lg shadow-blue-500/20"
                                            >
                                                Live-Chat öffnen <MessageCircle size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-zinc-500 uppercase text-xs tracking-wider">Bestelldetails</h3>
                                    {items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
                                            <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500">
                                                <Package size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm text-white">{item.product_name || 'Produkt'}</div>
                                                <div className="text-xs text-zinc-500">Menge: {item.quantity}</div>
                                            </div>
                                            <div className="font-mono text-sm text-gold">
                                                {parseFloat(item.price).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                                        <span className="font-bold text-white">Gesamtsumme (geschätzt)</span>
                                        <span className="font-black text-xl text-gold">
                                            {parseFloat(ticket.total_sum).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Support Card */}
                        <div className="bg-gradient-to-br from-[#6D28D9] to-[#EC4899] rounded-3xl p-6 relative overflow-hidden text-white shadow-2xl shadow-purple-900/20 group">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-30 mix-blend-overlay" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 transform group-hover:scale-110 transition-transform duration-700" />

                            <div className="relative z-10">
                                <Sparkles className="w-8 h-8 mb-4 text-white/90" />
                                <h3 className="font-black text-2xl mb-2">Persönlicher Support</h3>
                                <p className="text-white/80 text-sm mb-6 leading-relaxed">
                                    Wir sind für dich da. Kontaktiere uns jederzeit via Live-Chat oder Telegram für Updates zu deiner Bestellung.
                                </p>
                                <Button
                                    onClick={openChat}
                                    variant="secondary"
                                    className="w-full bg-white text-purple-900 hover:bg-white/90 font-bold rounded-xl h-12 shadow-lg"
                                >
                                    Support kontaktieren
                                </Button>
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-3xl p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-zinc-400" />
                                Lieferadresse
                            </h3>
                            {ticket.contact_info ? (
                                <div className="space-y-1 text-sm text-zinc-400">
                                    <p className="text-white font-medium">{ticket.contact_info.name}</p>
                                    <p>{ticket.contact_info.address}</p>
                                    <p>{ticket.contact_info.zip} {ticket.contact_info.city}</p>
                                    <p>{ticket.contact_info.country}</p>
                                </div>
                            ) : (
                                <p className="text-zinc-500 text-sm">Keine Adresse hinterlegt.</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                                className="flex-1 border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl h-12"
                            >
                                <Download size={16} className="mr-2" />
                                Save
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white rounded-xl h-12"
                            >
                                <Share2 size={16} className="mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
