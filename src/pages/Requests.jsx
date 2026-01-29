import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api';
import { Badge } from '@/components/ui/badge';
import { Package, Calendar, Euro, MessageSquare, User, ArrowLeft, ShoppingBag } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [requestItems, setRequestItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const user = await api.auth.me();
      const reqs = await api.entities.Request.filter({ user_id: user.id }, '-created_at');
      setRequests(reqs);

      // Load items for each request
      const itemsData = {};
      for (const req of reqs) {
        const items = await api.entities.RequestItem.filter({ request_id: req.id });
        itemsData[req.id] = items;
      }
      setRequestItems(itemsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' },
    shipped: { label: 'Versandt', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' },
    completed: { label: 'Abgeschlossen', color: 'bg-green-500/20 text-green-400 border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <Link
              to={createPageUrl('Profile')}
              className="inline-flex items-center space-x-2 text-zinc-400 hover:text-white mb-4 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Zurück zum Profil</span>
            </Link>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent"
            >
              Meine Bestellungen
            </motion.h1>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800 rounded-full px-4 py-2 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-purple-400" />
            <span className="font-bold text-white">{requests.length}</span>
            <span className="text-zinc-500 text-sm">Gesamt</span>
          </div>
        </div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-3xl backdrop-blur-sm"
          >
            <div className="w-24 h-24 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Noch keine Bestellungen</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Du hast noch nichts bei uns bestellt. Schau dich doch mal im Shop um!</p>
            <Link to={createPageUrl('Home')} className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform">
              Zum Shop
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {requests.map((request, index) => {
              const items = requestItems[request.id] || [];
              const status = statusConfig[request.status] || statusConfig.pending;

              return (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800/60 hover:border-purple-500/30 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10"
                >
                  {/* Glass Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative p-6 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-zinc-800/50 pb-6">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-700/50 shadow-inner">
                          <Package className="w-7 h-7 text-zinc-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold text-white tracking-tight">
                              Order #{request.id.slice(0, 8).toUpperCase()}
                            </h3>
                            <Badge variant="outline" className={`${status.color} border px-3 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider`}>
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-zinc-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(request.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                          </div>
                        </div>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="block text-sm text-zinc-500 mb-1">Gesamtbetrag</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                          {request.total_sum.toFixed(2)}€
                        </span>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-12 gap-8">

                      {/* Items Column */}
                      <div className="md:col-span-8 space-y-4">
                        <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4" /> Positionen
                        </h4>
                        <div className="bg-black/20 rounded-2xl overflow-hidden border border-zinc-800/50">
                          {items.map((item, i) => (
                            <div key={item.id} className={`flex items-center justify-between p-4 ${i !== items.length - 1 ? 'border-b border-zinc-800/50' : ''} hover:bg-white/5 transition-colors`}>
                              <div className="flex-1">
                                <div className="font-bold text-white mb-1">{item.name_snapshot}</div>
                                <div className="flex items-center gap-3 text-xs text-zinc-400">
                                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">SKU: {item.sku_snapshot}</span>
                                  <span>Menge: <b className="text-white">{item.quantity_snapshot}</b></span>
                                </div>
                                {item.selected_options_snapshot && Object.keys(item.selected_options_snapshot).length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {Object.entries(item.selected_options_snapshot).map(([key, value]) => (
                                      <span key={key} className="text-[10px] uppercase font-bold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20">
                                        {key}: {value}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right pl-4">
                                <div className="font-bold text-white">{(item.price_snapshot * item.quantity_snapshot).toFixed(2)}€</div>
                                <div className="text-xs text-zinc-500">{item.price_snapshot}€ / Stk</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Info Column */}
                      <div className="md:col-span-4 space-y-6">
                        {/* Shipping Info */}
                        {request.contact_info && (
                          <div className="bg-zinc-800/20 rounded-2xl p-5 border border-zinc-800/50">
                            <h4 className="font-bold text-sm text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                              <User className="w-4 h-4" /> Versand
                            </h4>
                            <div className="space-y-3 text-sm">
                              {request.contact_info.name && (
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Name</span>
                                  <span className="font-medium text-white text-right">{request.contact_info.name}</span>
                                </div>
                              )}
                              {request.contact_info.telegram && (
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">Telegram</span>
                                  <span className="font-medium text-blue-400 text-right">{request.contact_info.telegram}</span>
                                </div>
                              )}
                              {request.contact_info.shippingMethod && (
                                <div className="flex justify-between pt-2 border-t border-zinc-700/50">
                                  <span className="text-zinc-400">Methode</span>
                                  <span className="font-bold text-emerald-400 text-right uppercase text-xs pt-0.5">{request.contact_info.shippingMethod}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Notes */}
                        {request.note && (
                          <div className="bg-yellow-500/5 rounded-2xl p-5 border border-yellow-500/10">
                            <h4 className="font-bold text-sm text-yellow-500/70 uppercase tracking-wider mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Notiz
                            </h4>
                            <p className="text-sm text-yellow-200/80 italic">"{request.note}"</p>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}