import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, Clock, Search, Filter, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Mail, User, Activity, Users, FileCheck } from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { insforge } from '@/lib/insforge';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-[#0A0C10] border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon className="w-24 h-24" />
    </div>
    <div className="relative z-10">
      <p className="text-zinc-500 text-xs uppercase tracking-widest font-mono mb-2">{title}</p>
      <h3 className="text-3xl font-black text-white">{value}</h3>
      {trend && <p className="text-[#D6B25E] text-xs mt-2 font-mono">{trend}</p>}
    </div>
  </div>
);

const AdminVerifications = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, verified: 0, total: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();

    // Subscription for real-time updates
    const subscription = insforge
      .channel('admin-verifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'verification_requests' }, () => {
        fetchRequests();
        toast({ title: 'Update', description: 'Neue Daten empfangen.', duration: 2000 });
      })
      .subscribe();

    return () => {
      insforge.removeChannel(subscription);
    };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.verification.getPendingRequests();
      const pendingReqs = data.data || [];
      setRequests(pendingReqs);

      // Mock stats for now (replace with real API call if available)
      setStats({
        pending: pendingReqs.length,
        verified: 1240, // Example placeholder
        total: 1532      // Example placeholder
      });
    } catch (error) {
      console.error('Failed to fetch requests:', error);
      // toast({ title: 'Fehler', description: 'Konnte Anfragen nicht laden', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.verification.approveRequest(id);
      toast({
        title: 'Verifiziert',
        description: 'Benutzer wurde erfolgreich freigeschaltet.',
        className: "bg-green-500/10 border-green-500/20 text-green-500"
      });
      setRequests(prev => prev.filter(req => req.id !== id));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, verified: prev.verified + 1 }));
      setSelectedRequest(null);
    } catch (error) {
      toast({ title: 'Fehler', description: 'Konnte Benutzer nicht verifizieren', variant: 'destructive' });
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;
    try {
      await api.verification.rejectRequest(selectedRequest.id, rejectionReason);
      toast({
        title: 'Abgelehnt',
        description: 'Anfrage wurde zurückgewiesen.',
        variant: 'destructive'
      });
      setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
      setStats(prev => ({ ...prev, pending: prev.pending - 1 }));
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    } catch (error) {
      toast({ title: 'Fehler', description: 'Konnte Anfrage nicht ablehnen', variant: 'destructive' });
    }
  };

  const openRejectDialog = (request) => {
    setSelectedRequest(request);
    setIsRejectDialogOpen(true);
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 text-white min-h-screen font-sans bg-[#050608]">

      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-1 space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white">
            NEBULA <span className="text-[#D6B25E]">ADMIN</span>
          </h1>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em]">Security Center</p>
          <Button
            variant="outline"
            onClick={fetchRequests}
            className="mt-4 border-white/10 hover:bg-white/5 bg-white/5 text-zinc-300 w-full justify-start"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Daten aktualisieren
          </Button>
        </div>

        <StatCard title="Ausstehend" value={stats.pending} icon={Clock} trend="Erfordert Handlung" />
        <StatCard title="Verifiziert" value={stats.verified} icon={FileCheck} trend="+12 diese Woche" />
        <StatCard title="Total Users" value={stats.total} icon={Users} trend="InsForge DB" />
      </div>

      {/* List Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-4">
        <Shield className="w-5 h-5 text-[#D6B25E]" />
        <h2 className="text-lg font-bold tracking-wide">Aktive Überprüfungen</h2>
        <div className="ml-auto flex gap-2">
          <span className="bg-[#D6B25E]/10 text-[#D6B25E] text-[10px] font-bold px-2 py-1 rounded">PRIORITY HIGH</span>
        </div>
      </div>

      {/* Request Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[400px] bg-white/5 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-32 bg-[#0A0C10] rounded-3xl border border-white/5 dashed">
          <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
            <ShieldCheck className="w-10 h-10 text-zinc-700" />
          </div>
          <p className="text-zinc-500 font-medium text-lg">Alles erledigt</p>
          <p className="text-zinc-700 text-sm mt-1">Keine ausstehenden Verifizierungen.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {requests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                className="bg-[#0A0C10] rounded-3xl overflow-hidden border border-white/5 hover:border-[#D6B25E]/50 transition-all duration-300 group shadow-2xl relative flex flex-col"
              >
                {/* Photo Section */}
                <div className="aspect-[3/4] relative bg-zinc-900 overflow-hidden">
                  {request.photo_url ? (
                    <img
                      src={request.photo_url}
                      alt="Verification"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[0.2] group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center column text-zinc-700 gap-2">
                      <XCircle className="w-8 h-8 opacity-50" />
                      <span className="font-mono text-xs">NO IMAGE DATA</span>
                    </div>
                  )}

                  {/* Overlay Stats */}
                  <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
                    <span className="bg-white/10 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-mono border border-white/10">
                      {new Date(request.submitted_at).toLocaleDateString()}
                    </span>
                    <span className="bg-[#D6B25E] text-black px-2 py-1 rounded-md text-[10px] font-bold uppercase shadow-lg">
                      Pending
                    </span>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                    <div className="flex items-end justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 text-lg">
                          {request.hand_gesture}
                        </div>
                        <div>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Erwartet</p>
                          <p className="text-xs font-bold text-white uppercase">Handzeichen</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-3.5 h-3.5 text-[#D6B25E]" />
                      <h3 className="font-bold text-sm text-white truncate max-w-full" title={request.user?.email}>
                        {request.user?.email || 'Unbekannter Nutzer'}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 pl-0.5">
                      <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-widest truncate">ID: {request.user?.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <Button
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 h-10 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => openRejectDialog(request)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 h-10 text-[10px] font-bold uppercase tracking-widest transition-colors"
                    >
                      <X className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent className="bg-[#0A0C10] border-white/10 text-white max-w-md p-0 overflow-hidden ring-1 ring-white/5">
          <div className="p-6 bg-zinc-900/50 border-b border-white/5">
            <DialogTitle className="flex items-center gap-2 text-red-500 text-lg">
              <AlertTriangle className="w-5 h-5" />
              Ablehnung bestätigen
            </DialogTitle>
            <DialogDescription className="text-zinc-500 pt-2 text-xs">
              Bitte gib einen präzisen Grund an. Diese Nachricht wird dem Nutzer angezeigt.
            </DialogDescription>
          </div>
          <div className="p-6">
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="z.B. Foto unscharf, Gesichtsmerkmale nicht erkennbar, falsches Handzeichen..."
              className="bg-black border-white/10 text-white min-h-[120px] focus:ring-red-500/20 focus:border-red-500/50 placeholder:text-zinc-700 rounded-xl resize-none"
            />
          </div>
          <DialogFooter className="p-4 bg-zinc-900/30 border-t border-white/5 gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)} className="hover:bg-white/5 text-zinc-400">Abbrechen</Button>
            <Button variant="destructive" onClick={handleReject} className="bg-red-600 hover:bg-red-700 font-bold shadow-lg shadow-red-900/20">Ablehnen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminVerifications;
