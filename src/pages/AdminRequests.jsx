import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Eye, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [requestItems, setRequestItems] = useState({});
  const [users, setUsers] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reqs = await base44.entities.Request.list('-created_date');
      setRequests(reqs);

      // Load items and users
      const itemsData = {};
      const usersData = {};
      
      for (const req of reqs) {
        const items = await base44.entities.RequestItem.filter({ request_id: req.id });
        itemsData[req.id] = items;

        if (!usersData[req.user_id]) {
          const userList = await base44.entities.User.filter({ id: req.user_id });
          if (userList.length > 0) {
            usersData[req.user_id] = userList[0];
          }
        }
      }
      
      setRequestItems(itemsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await base44.entities.Request.update(requestId, { status: newStatus });
      toast({ title: 'Status aktualisiert' });
      loadData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Fehler', description: 'Status konnte nicht aktualisiert werden', variant: 'destructive' });
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anfragen</h1>
        <p className="text-zinc-400">{requests.length} Anfragen insgesamt</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Artikel</TableHead>
              <TableHead>Summe</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => {
              const items = requestItems[request.id] || [];
              const user = users[request.user_id];
              const status = statusConfig[request.status] || statusConfig.pending;

              return (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-sm">
                    #{request.id.slice(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user?.full_name || 'Unbekannt'}</div>
                      <div className="text-sm text-zinc-400">{user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(request.created_date), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </TableCell>
                  <TableCell>{items.length} Artikel</TableCell>
                  <TableCell className="font-semibold text-purple-400">
                    {request.total_sum.toFixed(2)}€
                  </TableCell>
                  <TableCell>
                    <Select
                      value={request.status}
                      onValueChange={(val) => handleStatusChange(request.id, val)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            {config.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Anfrage #{selectedRequest.id.slice(0, 8)}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-zinc-800/50 rounded-lg">
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Kunde</div>
                    <div className="font-medium">{users[selectedRequest.user_id]?.full_name || 'Unbekannt'}</div>
                    <div className="text-sm text-zinc-400">{users[selectedRequest.user_id]?.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">Datum</div>
                    <div>{format(new Date(selectedRequest.created_date), 'dd. MMMM yyyy, HH:mm', { locale: de })} Uhr</div>
                  </div>
                </div>

                {/* Contact Info */}
                {selectedRequest.contact_info && (
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <div className="text-sm text-zinc-400 mb-3">Kontaktinformationen</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-zinc-400">Name: </span>
                        <span className="font-medium">{selectedRequest.contact_info.name}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400">Telefon: </span>
                        <span className="font-medium">{selectedRequest.contact_info.phone}</span>
                      </div>
                      {selectedRequest.contact_info.telegram && (
                        <div>
                          <span className="text-zinc-400">Telegram: </span>
                          <span className="font-medium">{selectedRequest.contact_info.telegram}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div>
                  <div className="text-sm text-zinc-400 mb-3">Artikel</div>
                  <div className="space-y-2">
                    {(requestItems[selectedRequest.id] || []).map((item) => (
                      <div key={item.id} className="p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.name_snapshot}</div>
                            <div className="text-sm text-zinc-400">
                              SKU: {item.sku_snapshot} • Anzahl: {item.quantity_snapshot}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-purple-400">
                              {(item.price_snapshot * item.quantity_snapshot).toFixed(2)}€
                            </div>
                            <div className="text-sm text-zinc-400">
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
                  <div className="p-4 bg-zinc-800/30 rounded-lg">
                    <div className="text-sm text-zinc-400 mb-2">Notiz</div>
                    <div className="text-sm">{selectedRequest.note}</div>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
                  <span className="text-lg font-semibold">Gesamtsumme:</span>
                  <span className="text-3xl font-bold text-purple-400">
                    {selectedRequest.total_sum.toFixed(2)}€
                  </span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}