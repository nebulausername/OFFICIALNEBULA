import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Calendar, Euro, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

export default function Requests() {
  const [requests, setRequests] = useState([]);
  const [requestItems, setRequestItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const user = await base44.auth.me();
      const reqs = await base44.entities.Request.filter({ user_id: user.id }, '-created_date');
      setRequests(reqs);

      // Load items for each request
      const itemsData = {};
      for (const req of reqs) {
        const items = await base44.entities.RequestItem.filter({ request_id: req.id });
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
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    shipped: { label: 'Versandt', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    completed: { label: 'Abgeschlossen', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-zinc-800 rounded w-48" />
          <div className="h-64 bg-zinc-800 rounded" />
          <div className="h-64 bg-zinc-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Meine Anfragen</h1>
        <p className="text-zinc-400 text-lg">Übersicht über alle deine Bestellanfragen</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
          <Package className="w-20 h-20 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Noch keine Anfragen</h2>
          <p className="text-zinc-400">Deine Bestellanfragen werden hier angezeigt</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const items = requestItems[request.id] || [];
            const status = statusConfig[request.status] || statusConfig.pending;

            return (
              <Card key={request.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <CardHeader className="border-b border-zinc-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          Anfrage #{request.id.slice(0, 8)}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(request.created_date), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr
                        </div>
                      </div>
                    </div>

                    <Badge className={`${status.color} border px-4 py-2 text-sm font-semibold`}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-6">
                  {/* Contact Info */}
                  {request.contact_info && (
                    <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-zinc-800/50 rounded-lg">
                      {request.contact_info.name && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-zinc-400">Name:</span>
                          <span className="text-sm font-medium">{request.contact_info.name}</span>
                        </div>
                      )}
                      {request.contact_info.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">Tel:</span>
                          <span className="text-sm font-medium">{request.contact_info.phone}</span>
                        </div>
                      )}
                      {request.contact_info.telegram && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-400">Telegram:</span>
                          <span className="text-sm font-medium">{request.contact_info.telegram}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-sm text-zinc-400 uppercase">Artikel</h4>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.name_snapshot}</div>
                          <div className="text-sm text-zinc-400">
                            SKU: {item.sku_snapshot} • Anzahl: {item.quantity_snapshot}
                          </div>
                          {item.selected_options_snapshot && Object.keys(item.selected_options_snapshot).length > 0 && (
                            <div className="text-xs text-zinc-500 mt-1">
                              {Object.entries(item.selected_options_snapshot).map(([key, value]) => (
                                <span key={key} className="mr-3">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-400">
                            {(item.price_snapshot * item.quantity_snapshot).toFixed(2)}€
                          </div>
                          <div className="text-xs text-zinc-500">
                            {item.price_snapshot}€ × {item.quantity_snapshot}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Note */}
                  {request.note && (
                    <div className="mb-6 p-4 bg-zinc-800/30 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-400 mt-1" />
                        <div>
                          <div className="text-sm text-zinc-400 mb-1">Notiz:</div>
                          <div className="text-sm">{request.note}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Euro className="w-5 h-5" />
                      <span className="font-semibold">Gesamtsumme:</span>
                    </div>
                    <div className="text-3xl font-bold text-purple-400">
                      {request.total_sum.toFixed(2)}€
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}