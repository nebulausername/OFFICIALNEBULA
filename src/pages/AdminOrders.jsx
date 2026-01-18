import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Download,
  ArrowLeft,
  XCircle,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const statusOptions = [
  { value: 'all', label: 'Alle Status' },
  { value: 'pending', label: 'Ausstehend' },
  { value: 'confirmed', label: 'Bestätigt' },
  { value: 'processing', label: 'In Bearbeitung' },
  { value: 'shipped', label: 'Versendet' },
  { value: 'completed', label: 'Abgeschlossen' },
  { value: 'cancelled', label: 'Storniert' },
];

const statusConfig = {
  pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' },
  confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' },
  processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' },
  shipped: { label: 'Versendet', color: 'bg-green-500/20 text-green-400 border-green-500/40' },
  completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
  cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
};

export default function AdminOrders() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
    loadOrders();
  }, [statusFilter]);

  const checkAdmin = async () => {
    try {
      const userData = await api.auth.me();
      if (userData.role !== 'admin') {
        navigate(createPageUrl('Home'));
        return;
      }
      setUser(userData);
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.entities.Request.list('-created_at', 100);
      const allOrders = Array.isArray(response) ? response : (response.data || []);
      
      let filtered = allOrders;
      if (statusFilter !== 'all') {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.id.toLowerCase().includes(query) ||
            o.user?.full_name?.toLowerCase().includes(query) ||
            o.user?.email?.toLowerCase().includes(query)
        );
      }
      
      setOrders(filtered);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [searchQuery]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.entities.Request.update(orderId, { status: newStatus });
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 bg-gradient-to-br from-gold to-gold2 rounded-2xl flex items-center justify-center"
        >
          <ShoppingBag className="w-8 h-8 text-black" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(createPageUrl('Admin'))}
                className="text-white hover:bg-zinc-800"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Bestellungen
              </h1>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                placeholder="Suche nach Bestellnummer, Name oder Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px] bg-zinc-900 border-zinc-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-700 text-white text-center py-12">
            <CardContent>
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-xl font-semibold">Keine Bestellungen gefunden</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 hover:border-zinc-600 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="font-bold text-white text-lg">
                          Bestellung #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}
                        >
                          {status.label}
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-zinc-400">
                        <div>
                          <span className="font-semibold text-zinc-300">Kunde:</span>{' '}
                          {order.user?.full_name || order.user?.email || 'Unbekannt'}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-300">Datum:</span>{' '}
                          {new Date(order.created_at).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        <div>
                          <span className="font-semibold text-zinc-300">Artikel:</span>{' '}
                          {order.request_items?.length || 0} Artikel
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end gap-3">
                      <div className="text-2xl font-black text-gold">
                        {parseFloat(order.total_sum || 0).toFixed(2)}€
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={order.status}
                          onValueChange={(newStatus) => handleStatusUpdate(order.id, newStatus)}
                        >
                          <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-600 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                            {Object.keys(statusConfig).map((statusKey) => (
                              <SelectItem key={statusKey} value={statusKey}>
                                {statusConfig[statusKey].label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(order)}
                          className="border-zinc-600 text-white hover:bg-zinc-800"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-white">
                  Bestellung #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h2>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedOrder(null)}
                  className="text-white hover:bg-zinc-800"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-white mb-2">Kundeninformationen</h3>
                  <div className="bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Name:</span>{' '}
                      <span className="text-white">{selectedOrder.user?.full_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Email:</span>{' '}
                      <span className="text-white">{selectedOrder.user?.email || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400">Kontakt:</span>{' '}
                      <span className="text-white">
                        {selectedOrder.contact_info
                          ? JSON.stringify(selectedOrder.contact_info)
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">Artikel</h3>
                  <div className="space-y-2">
                    {selectedOrder.request_items?.map((item) => (
                      <div
                        key={item.id}
                        className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-white">{item.name_snapshot}</div>
                          <div className="text-sm text-zinc-400">
                            SKU: {item.sku_snapshot} • Menge: {item.quantity_snapshot}
                          </div>
                        </div>
                        <div className="text-gold font-bold">
                          {parseFloat(item.price_snapshot || 0).toFixed(2)}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
                  <span className="text-xl font-bold text-white">Gesamt:</span>
                  <span className="text-2xl font-black text-gold">
                    {parseFloat(selectedOrder.total_sum || 0).toFixed(2)}€
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

