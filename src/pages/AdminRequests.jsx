import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Button } from '@/components/ui/button';
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
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Eye, Filter, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useToast } from '@/components/ui/use-toast';
import StatusChangeDialog from '../components/admin/StatusChangeDialog';
import DataTable from '@/components/admin/ui/DataTable';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [requestItems, setRequestItems] = useState({});
  const [users, setUsers] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusChangeDialogOpen, setStatusChangeDialogOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState({ request: null, newStatus: null });
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reqs = await api.entities.Request.list('-created_at');
      setRequests(reqs);

      // Load items and users
      const itemsData = {};
      const usersData = {};

      for (const req of reqs) {
        // Optimization: Could be parallelized or fetched in bulk if API supported it
        const items = await api.entities.RequestItem.filter({ request_id: req.id });
        itemsData[req.id] = items;

        if (!usersData[req.user_id]) {
          const userList = await api.entities.User.filter({ id: req.user_id });
          if (userList.length > 0) {
            usersData[req.user_id] = userList[0];
          }
        }
      }

      setRequestItems(itemsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading requests:', error);
      toast({ title: 'Fehler', description: 'Daten konnten nicht geladen werden', variant: 'destructive' });
    }
  };

  const handleStatusChange = (request, newStatus) => {
    setPendingStatusChange({ request, newStatus });
    setStatusChangeDialogOpen(true);
  };

  const handleStatusChangeConfirm = () => {
    loadData();
    // Optimistic update could go here
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const statusConfig = {
    pending: { label: 'Ausstehend', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    confirmed: { label: 'Bestätigt', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    processing: { label: 'In Bearbeitung', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    shipped: { label: 'Versandt', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    completed: { label: 'Abgeschlossen', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    cancelled: { label: 'Storniert', color: 'bg-red-500/20 text-red-400 border-red-500/30' }
  };

  const columns = [
    {
      header: 'ID',
      accessorKey: 'id',
      sortable: true,
      cell: (row) => <span className="font-mono text-sm font-bold text-purple-400">#{row.id.slice(0, 8)}</span>
    },
    {
      header: 'Kunde',
      accessorKey: 'user_id',
      cell: (row) => {
        const user = users[row.user_id];
        return (
          <div>
            <div className="font-bold text-zinc-100">{user?.full_name || 'Unbekannt'}</div>
            <div className="text-sm font-medium text-zinc-300">{user?.email}</div>
          </div>
        );
      }
    },
    {
      header: 'Datum',
      accessorKey: 'created_at',
      sortable: true,
      cell: (row) => <span className="text-sm font-medium text-zinc-200">{format(new Date(row.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
    },
    {
      header: 'Summe',
      accessorKey: 'total_sum',
      sortable: true,
      cell: (row) => (
        <span className="font-black text-lg bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          {row.total_sum.toFixed(2)}€
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => (
        <Select
          value={row.status}
          onValueChange={(val) => handleStatusChange(row, val)}
        >
          <SelectTrigger className={`w-40 font-bold border-2 ${statusConfig[row.status]?.color || statusConfig.pending.color} transition-all`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="glass backdrop-blur-xl border-2 border-zinc-700">
            {Object.entries(statusConfig).map(([key, config]) => (
              <SelectItem key={key} value={key} className="font-bold">
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
    }
  ];

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <Link to={createPageUrl('Admin')} className="inline-flex items-center text-zinc-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">Anfragen</h1>
          <p className="text-zinc-300 text-lg font-semibold">{requests.length} Anfragen insgesamt</p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-zinc-900 border-zinc-700 font-bold">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Status</SelectItem>
              {Object.entries(statusConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>{config.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredRequests}
        searchKey="id"
        searchPlaceholder="Suche nach ID..."
        actions={[
          { label: 'Details ansehen', icon: Eye, onClick: handleViewDetails }
        ]}
      />

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass backdrop-blur-xl border-2 border-zinc-700">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                  Anfrage #{selectedRequest.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl">
                  <div>
                    <div className="text-sm font-bold text-zinc-300 mb-2">Kunde</div>
                    <div className="font-bold text-lg text-zinc-100">{users[selectedRequest.user_id]?.full_name || 'Unbekannt'}</div>
                    <div className="text-sm font-medium text-zinc-300 mt-1">{users[selectedRequest.user_id]?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-zinc-300 mb-2">Datum</div>
                    <div className="font-bold text-lg text-zinc-100">{format(new Date(selectedRequest.created_at), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr</div>
                  </div>
                </div>

                {/* Contact Info */}
                {selectedRequest.contact_info && (
                  <div className="p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl">
                    <div className="text-sm font-bold text-zinc-300 mb-4">Kontaktinformationen</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-300 font-medium">Name: </span>
                        <span className="font-bold text-zinc-100">{selectedRequest.contact_info.name || '--'}</span>
                      </div>
                      <div>
                        <span className="text-zinc-300 font-medium">Telefon: </span>
                        <span className="font-bold text-zinc-100">{selectedRequest.contact_info.phone || '--'}</span>
                      </div>
                      {selectedRequest.contact_info.telegram && (
                        <div>
                          <span className="text-zinc-300 font-medium">Telegram: </span>
                          <span className="font-bold text-zinc-100">{selectedRequest.contact_info.telegram || '--'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <div className="text-sm font-bold text-zinc-300 mb-4">Artikel</div>
                  <div className="space-y-3">
                    {(requestItems[selectedRequest.id] || []).map((item) => (
                      <div key={item.id} className="p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl hover:border-purple-500/50 transition-all">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="font-bold text-lg text-zinc-100 mb-2">{item.name_snapshot}</div>
                            <div className="text-sm font-medium text-zinc-300">
                              SKU: <span className="font-bold text-purple-400">{item.sku_snapshot}</span> • Anzahl: <span className="font-bold text-zinc-100">{item.quantity_snapshot}</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-black text-2xl bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                              {(item.price_snapshot * item.quantity_snapshot).toFixed(2)}€
                            </div>
                            <div className="text-sm font-medium text-zinc-300 mt-1">
                              {item.price_snapshot}€ × {item.quantity_snapshot}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note */}
                {selectedRequest.note && (
                  <div className="p-5 glass backdrop-blur border-2 border-zinc-700 rounded-2xl">
                    <div className="text-sm font-bold text-zinc-300 mb-3">Notiz</div>
                    <div className="text-base font-medium text-zinc-100 leading-relaxed">{selectedRequest.note}</div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-6 border-t-2 border-zinc-700">
                  <span className="text-xl md:text-2xl font-black text-zinc-100">Gesamtsumme:</span>
                  <span className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                    {selectedRequest.total_sum.toFixed(2)}€
                  </span>
                </div>
              </div>
            </>
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
  );
}