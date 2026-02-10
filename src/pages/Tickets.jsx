import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
    Ticket as TicketIcon,
    Clock,
    CheckCircle,
    XCircle,
    ArrowRight,
    Package,
    ShoppingBag,
    Calendar,
    CreditCard
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function Tickets() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                if (!user?.id) return;
                // Fetch users orders (requests)
                const data = await api.entities.Request.filter({ user_id: user.id }, '-created_at');
                setTickets(data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [user?.id]);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: Clock, label: 'Ausstehend' };
            case 'processing': return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', icon: Package, label: 'Bearbeitung' };
            case 'shipped': return { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', icon: Package, label: 'Versendet' };
            case 'completed': return { color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', icon: CheckCircle, label: 'Abgeschlossen' };
            case 'cancelled': return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: XCircle, label: 'Storniert' };
            default: return { color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700', icon: Clock, label: status };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-[#0A0C10]">
                <div className="w-10 h-10 border-4 border-[#D6B25E]/20 border-t-[#D6B25E] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 md:px-8 bg-[#0A0C10] text-white relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                            My Tickets
                        </h1>
                        <p className="text-zinc-400 font-medium">Deine Bestellhistorie & Status</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <TicketIcon className="w-8 h-8 text-[#D6B25E]" />
                    </div>
                </motion.div>

                {tickets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 text-center bg-white/5 border border-white/10 rounded-3xl"
                    >
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-10 h-10 text-white/20" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Keine Tickets gefunden</h2>
                        <p className="text-zinc-500 mb-8 max-w-md">Du hast noch keine Bestellungen aufgegeben. Starte jetzt und sichere dir deinen Drop.</p>
                        <Link to={createPageUrl('Products')} className="px-8 py-3 bg-[#D6B25E] text-black font-bold rounded-xl hover:bg-[#E5C475] transition-colors shadow-lg shadow-[#D6B25E]/20">
                            Jetzt shoppen
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid gap-4"
                    >
                        {tickets.map((ticket) => {
                            const status = getStatusConfig(ticket.status);
                            const StatusIcon = status.icon;

                            return (
                                <Link key={ticket.id} to={`/ticket/${ticket.id}`}>
                                    <motion.div
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="group relative bg-white/5 hover:bg-white/[0.07] border border-white/10 hover:border-[#D6B25E]/30 rounded-2xl p-0 overflow-hidden transition-all duration-300 shadow-lg hover:shadow-[#D6B25E]/5"
                                    >
                                        {/* Ticket Stub Design/Visual */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#D6B25E] to-[#8a7238]" />

                                        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            {/* Left: Info */}
                                            <div className="flex items-start gap-4">
                                                <div className="hidden md:flex flex-col items-center justify-center w-16 h-16 bg-[#0A0C10] rounded-xl border border-white/10 text-center p-2">
                                                    <span className="text-xs text-zinc-500 font-bold uppercase">{new Date(ticket.created_at).toLocaleString('de-DE', { month: 'short' })}</span>
                                                    <span className="text-xl font-black text-white">{new Date(ticket.created_at).getDate()}</span>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-mono text-xs text-white/40 tracking-wider">#{ticket.id.slice(0, 8).toUpperCase()}</span>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${status.bg} ${status.color} ${status.border} flex items-center gap-1.5`}>
                                                            <span className={`w-1 h-1 rounded-full bg-current animate-pulse`} />
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#D6B25E] transition-colors">
                                                        Order Ticket
                                                    </h3>
                                                    <div className="flex items-center gap-4 text-sm text-zinc-400 font-medium">
                                                        <span className="flex items-center gap-1.5">
                                                            <CreditCard className="w-3.5 h-3.5" />
                                                            {parseFloat(ticket.total_sum).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                                                        </span>
                                                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                        <span className="flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(ticket.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right: Action */}
                                            <div className="flex items-center justify-end">
                                                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#D6B25E] group-hover:text-black group-hover:border-[#D6B25E] transition-all">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Perforated Edge Effect (Visual) */}
                                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0A0C10]" />
                                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0A0C10]" />
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
