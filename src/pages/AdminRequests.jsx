import React, { useState } from 'react';
import { api } from '@/api';
import { ResourceTable } from '@/components/admin/ui/ResourceTable';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Package, User, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminRequests() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // --- Handlers ---
  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedOrder) return;
    try {
      await api.entities.Request.update(selectedOrder.id, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      setIsDetailsOpen(false);
      window.location.reload(); // Force refresh for now
    } catch (error) {
      console.error(error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  };

  // --- Config ---
  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      className: 'font-mono text-xs',
      render: (val) => <span title={val}>{val.substring(0, 8)}...</span>
    },
    {
      key: 'user',
      label: 'Kunde',
      render: (val, row) => (
        <div className="flex flex-col">
          <span className="font-medium text-white">{row.user?.full_name || 'Gast'}</span>
          <span className="text-xs text-zinc-500">{row.user?.email}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const colors = {
          pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
          processing: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
          completed: 'bg-green-500/20 text-green-500 border-green-500/50',
          cancelled: 'bg-red-500/20 text-red-500 border-red-500/50',
        };
        return (
          <Badge variant="outline" className={colors[val] || 'bg-zinc-800 text-zinc-400'}>
            {val ? val.toUpperCase() : 'UNKNOWN'}
          </Badge>
        );
      }
    },
    {
      key: 'total_amount',
      label: 'Summe',
      sortable: true,
      type: 'currency',
      className: 'font-mono'
    },
    {
      key: 'created_at',
      label: 'Datum',
      sortable: true,
      type: 'date',
      className: 'text-zinc-500'
    }
  ];

  return (
    <div className="min-h-screen bg-black p-6 md:p-10 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        <ResourceTable
          title="Bestellungen"
          resource="Request"
          columns={columns}
          onRowClick={handleRowClick}
          initialSort="-created_at"
        />
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-400" />
              Bestellung #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Details zur Bestellung vom {selectedOrder && format(new Date(selectedOrder.created_at), 'dd.MM.yyyy HH:mm')}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              {/* Left: Items */}
              <div className="space-y-4">
                <h4 className="font-semibold text-zinc-300">Artikel ({selectedOrder.request_items?.length || 0})</h4>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {selectedOrder.request_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-lg border border-zinc-800">
                      <div className="w-12 h-12 bg-zinc-800 rounded flex items-center justify-center text-xs">IMG</div>
                      <div>
                        <div className="font-medium">{item.product?.name || 'Produkt'}</div>
                        <div className="text-sm text-zinc-500">
                          {item.quantity}x {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(item.price_at_time || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                  <span className="text-zinc-400">Gesamtsumme</span>
                  <span className="text-xl font-bold text-white">
                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              {/* Right: Info & Actions */}
              <div className="space-y-6">
                {/* Customer */}
                <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Kunde</h4>
                  <div className="font-medium">{selectedOrder.user?.full_name}</div>
                  <div className="text-sm text-zinc-500">{selectedOrder.user?.email}</div>
                  <div className="text-sm text-zinc-500">{selectedOrder.user?.telegram_id ? `TG ID: ${selectedOrder.user.telegram_id}` : 'Kein Telegram'}</div>
                </div>

                {/* Shipping (Mock for now if not in DB) */}
                <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800">
                  <h4 className="text-sm font-semibold text-zinc-400 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Kontakt / Lieferung</h4>
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap">
                    {JSON.stringify(selectedOrder.contact_info || {}, null, 2)}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase font-bold">Status ändern</label>
                  <Select
                    defaultValue={selectedOrder.status}
                    onValueChange={handleStatusUpdate}
                  >
                    <SelectTrigger className="bg-zinc-900 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}