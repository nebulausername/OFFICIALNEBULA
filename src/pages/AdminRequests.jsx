import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Eye, ArrowLeft, Package, Clock, CheckCircle2, XCircle, Truck, AlertCircle, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import StatusChangeDialog from '../components/admin/StatusChangeDialog';
import DataTable from '@/components/admin/ui/DataTable';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [requestItems, setRequestItems] = useState({});
  const [users, setUsers] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({ request: null, newStatus: null });
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState({ total: 0, pending: 0, revenue: 0, todayRevenue: 0 });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reqs = await api.entities.Request.list('-created_at');
      setRequests(reqs);

      // Calculate stats
      const today = new Date().toDateString();
      const stats = reqs.reduce((acc, r) => {
        acc.total++;
        if (r.status === 'pending') acc.pending++;
        if (r.status !== 'cancelled') {
          acc.revenue += (r.total_sum || 0);
          if (new Date(r.created_at).toDateString() === today) {
            acc.todayRevenue += (r.total_sum || 0);
          }
        }
        return acc;
      }, { total: 0, pending: 0, revenue: 0, todayRevenue: 0 });
      setStats(stats);


      // Load items and users (Optimized: fetch needed only)
      // Note: In a real large-scale app, we'd paginate and fetch these on demand or include=items.
      // For this MVP, we fetch details for the list.
      const itemsData = {};
      const usersData = {};
      const pendingUserIds = new Set();
      const pendingReqIds = [];

      // Only fetch item details if we really need to show them in the table expansion or just wait for detail view?
      // Actually, 'DataTable' doesn't show items inline yet. Let's fetch basic user info for the table.

      for (const req of reqs) {
        pendingUserIds.add(req.user_id);
        pendingReqIds.push(req.id);
      }

      // Fetch users
      if (pendingUserIds.size > 0) {
        // This is a naive loop, but okay for < 100 items. Better: api.entities.User.filter({ id: { in: [...] } }) if supported.
        // Since our generic API might not support 'in', we loop or cache.
        // We'll rely on our existing strategy but maybe assume we have user data if we just listed users previously?
        // Let's stick to the existing robust loop for now but maybe limit concurrency if needed.

        for (const req of reqs) {
          if (!usersData[req.user_id]) {
            const userList = await api.entities.User.filter({ id: req.user_id });
            if (userList.length > 0) usersData[req.user_id] = userList[0];
          }
          // Pre-fetch items? Only when opening dialog to save bandwidth.
        }
      }

      setUsers(usersData);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({ title: 'Fehler', description: 'Daten konnten nicht geladen werden', variant: 'destructive' });
    }
  };

  const loadRequestDetails = async (requestId) => {
    // Lazy load items for a request
    if (requestItems[requestId]) return;
    try {
      // Use get() to fetch full details including nested request_items
      const fullRequest = await api.entities.Request.get(requestId);
      if (fullRequest && fullRequest.request_items) {
        setRequestItems(prev => ({ ...prev, [requestId]: fullRequest.request_items }));
      }
    } catch (err) {
      console.error("Failed to load items", err);
    }
  }

  const handleStatusChange = (request, newStatus) => {
    setPendingStatusChange({ request, newStatus });
    setStatusChangeDialogOpen(true);
  };

  const handleStatusChangeConfirm = () => {
    loadData();
    setStatusChangeDialogOpen(false);
  };

  const handleViewDetails = async (request) => {
    await loadRequestDetails(request.id);
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const statusConfig = {
    pending: { label: 'Offen', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', icon: AlertCircle },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: CheckCircle2 },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', icon: Package },
    shipped: { label: 'Versendet', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', icon: Truck },
    completed: { label: 'Abgeschlossen', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
    cancelled: { label: 'Storniert', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle }
  };

  const columns = [
    {
      header: 'Order-ID',
      accessorKey: 'id',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-bold text-zinc-400">#{row.id.slice(0, 8).toUpperCase()}</span>
    },
    {
      header: 'Kunde',
      accessorKey: 'user_id',
      cell: (row) => {
        const user = users[row.user_id];
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white text-sm">{user?.full_name || 'Gast / Unbekannt'}</span>
            <span className="text-xs text-zinc-500">{user?.email}</span>
          </div>
        );
      }
    },
    {
      header: 'Datum',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-1.5 text-zinc-400">
          <Clock className="w-3 h-3" />
          <span className="text-xs font-medium">{format(new Date(row.created_at), 'dd.MM', { locale: de })} <span className="text-zinc-600">{format(new Date(row.created_at), 'HH:mm')}</span></span>
        </div>
      )
    },
    {
      header: 'Summe',
      accessorKey: 'total_sum',
      sortable: true,
      cell: (row) => (
        <span className="font-bold text-white">
          {row.total_sum?.toFixed(2)} €
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        const config = statusConfig[row.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold w-fit ${config.color}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </div>
        );
      }
    },
    {
      header: 'Aktion',
      cell: (row) => (
        <div className="flex gap-2 justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); handleViewDetails(row); }}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
            title="Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <Select
            value={row.status}
            onValueChange={(val) => handleStatusChange(row, val)}
          >
            <SelectTrigger className="h-8 w-[130px] bg-transparent border-zinc-800 hover:border-zinc-700 focus:ring-0 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key} className="text-xs focus:bg-zinc-800 focus:text-white">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0].replace('/10', '/50')}`} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )
    }
  ];

  const getFilteredData = () => {
    if (activeTab === 'all') return requests;
    if (activeTab === 'open') return requests.filter(r => ['pending', 'confirmed', 'processing'].includes(r.status));
    if (activeTab === 'completed') return requests.filter(r => ['shipped', 'completed'].includes(r.status));
    if (activeTab === 'cancelled') return requests.filter(r => r.status === 'cancelled');
    return requests;
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <Link to={createPageUrl('Admin')} className="inline-flex items-center text-zinc-500 hover:text-white mb-6 transition-colors text-sm font-medium group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Zurück zum Dashboard
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Bestellungen</h1>
              <p className="text-zinc-400">Verwalte und bearbeite eingehende Kundenbestellungen.</p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl min-w-[140px]">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Offen</div>
                <div className="text-2xl font-black text-white">{stats.pending}</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl min-w-[140px]">
                <div className="text-zinc-500 text-xs font-bold uppercase tracking-wider mb-1">Umsatz Heute</div>
                <div className="text-2xl font-black text-emerald-400">{stats.todayRevenue.toFixed(2)}€</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden glass">
          {/* Tabs Filter */}
          <div className="border-b border-zinc-800 p-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex items-center justify-between px-4 py-2">
                <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 h-auto">
                  <TabsTrigger value="all" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white text-xs px-4 py-1.5 h-auto">Alle</TabsTrigger>
                  <TabsTrigger value="open" className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 text-xs px-4 py-1.5 h-auto">Offen</TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-500 text-xs px-4 py-1.5 h-auto">Abgeschlossen</TabsTrigger>
                  <TabsTrigger value="cancelled" className="data-[state=active]:bg-red-500/10 data-[state=active]:text-red-500 text-xs px-4 py-1.5 h-auto">Storniert</TabsTrigger>
                </TabsList>

                {/* Search could go here if managed externally, but DataTable handles it internally for now */}
              </div>
            </Tabs>
          </div>

          <DataTable
            columns={columns}
            data={getFilteredData()}
            searchKey="id"
            searchPlaceholder="Suche nach Order-ID..."
            onSearch={() => { }}
          />
        </div>

        {/* Details Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border border-zinc-800 p-0 gap-0 shadow-2xl">
            {selectedRequest && (
              <div className="flex flex-col h-full">
                {/* Dialog Header */}
                <div className="p-6 border-b border-zinc-800 bg-zinc-900/30 sticky top-0 z-10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-white">#{selectedRequest.id.slice(0, 8).toUpperCase()}</h2>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${statusConfig[selectedRequest.status]?.color}`}>
                        {statusConfig[selectedRequest.status]?.label}
                      </div>
                    </div>
                    <span className="text-sm font-mono text-zinc-500">
                      {format(new Date(selectedRequest.created_at), 'dd. MMM yyyy, HH:mm', { locale: de })}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  {/* Customer & Shipping Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer */}
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        Kunde & Kontakt
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                          <span className="text-zinc-400 text-sm">Name</span>
                          <span className="text-white font-medium text-sm">{users[selectedRequest.user_id]?.full_name || 'Unbekannt'}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                          <span className="text-zinc-400 text-sm">Email</span>
                          <span className="text-white font-medium text-sm">{users[selectedRequest.user_id]?.email || '--'}</span>
                        </div>
                        <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                          <span className="text-zinc-400 text-sm">Telefon</span>
                          <span className="text-white font-medium text-sm">{selectedRequest.contact_info?.phone || '--'}</span>
                        </div>
                        {selectedRequest.contact_info?.telegram && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400 text-sm">Telegram</span>
                            <span className="text-blue-400 font-medium text-sm">@{selectedRequest.contact_info.telegram}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Note / Shipping Info Placeholder */}
                    <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        Notizen & Details
                      </h3>
                      {selectedRequest.note ? (
                        <p className="text-zinc-300 text-sm italic leading-relaxed">"{selectedRequest.note}"</p>
                      ) : (
                        <p className="text-zinc-600 text-sm italic">Keine zusätzlichen Notizen.</p>
                      )}
                    </div>
                  </div>

                  {/* Items Table */}
                  <div>
                    <h3 className="text-lg font-bold text-white mb-4">Positionen</h3>
                    <div className="border border-zinc-800 rounded-2xl overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-900 text-zinc-500 font-medium border-b border-zinc-800">
                          <tr>
                            <th className="px-6 py-3">Artikel</th>
                            <th className="px-6 py-3 text-right">Einzelpreis</th>
                            <th className="px-6 py-3 text-right">Menge</th>
                            <th className="px-6 py-3 text-right">Gesamt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-900/20">
                          {(requestItems[selectedRequest.id] || []).map((item) => (
                            <tr key={item.id} className="hover:bg-zinc-900/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold text-white">{item.name_snapshot}</div>
                                <div className="text-xs text-zinc-500 font-mono mt-0.5">{item.sku_snapshot}</div>
                              </td>
                              <td className="px-6 py-4 text-right text-zinc-400">
                                {item.price_snapshot?.toFixed(2)} €
                              </td>
                              <td className="px-6 py-4 text-right text-white font-bold">
                                {item.quantity_snapshot}
                              </td>
                              <td className="px-6 py-4 text-right text-white font-bold">
                                {(item.price_snapshot * item.quantity_snapshot).toFixed(2)} €
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-zinc-900/80 border-t border-zinc-800">
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-right font-bold text-zinc-400">Gesamtsumme</td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-xl font-black text-white">{selectedRequest.total_sum?.toFixed(2)} €</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-end gap-3 sticky bottom-0">
                  {/* Actions */}
                  <button className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 font-bold text-sm hover:bg-zinc-800 hover:text-white transition-colors">
                    Rechnung drucken
                  </button>
                  <button onClick={() => setDialogOpen(false)} className="px-6 py-2 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-colors">
                    Schließen
                  </button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Change Dialog */}
        <StatusChangeDialog
          open={statusChangeDialogOpen}
          onOpenChange={setStatusChangeDialogOpen}
          request={pendingStatusChange.request}
          newStatus={pendingStatusChange.newStatus}
          onConfirm={handleStatusChangeConfirm}
          statusConfig={statusConfig}
        />
      </div>
    </div>
  );
}