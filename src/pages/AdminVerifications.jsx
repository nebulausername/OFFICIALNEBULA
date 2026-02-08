import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, RefreshCw, Sparkles, User, Mail, Phone, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { insforge, db } from '@/lib/insforge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();
  // const { socket } = useSocket(); // Removed legacy socket

  useEffect(() => {
    loadVerifications();
  }, [filter]);

  // Real-time updates (InsForge)
  useEffect(() => {
    // Subscribe to verification_requests changes
    const subscription = insforge
      .channel('admin-verifications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'verification_requests' },
        (payload) => {
          const eventType = payload.eventType;
          const newRecord = payload.new;

          if (eventType === 'INSERT') {
            toast({
              title: '🔔 Neue Verifizierung',
              description: 'Eine neue Verifizierung wurde eingereicht.',
            });
            if (filter === 'pending' || filter === 'all') loadVerifications();
          } else if (eventType === 'UPDATE') {
            // If status changed, refresh
            loadVerifications();
          }
        }
      )
      .subscribe();

    return () => {
      insforge.removeChannel(subscription);
    };
  }, [filter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);

      let query = db
        .from('verification_requests')
        .select(`
            *,
            user:users(*)
        `)
        .order('submitted_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVerifications(data || []);

    } catch (error) {
      console.error('Error loading verifications:', error);
      toast({
        title: 'Fehler',
        description: 'Verifizierungen konnten nicht geladen werden',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId, userId) => {
    try {
      // 1. Update Verification Request
      const { error: reqError } = await db
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date(),
          reviewed_by: 'admin' // TODO: Get actual admin ID
        })
        .eq('id', verificationId);

      if (reqError) throw reqError;

      // 2. Update User Status
      const { error: userError } = await db
        .from('users')
        .update({
          verification_status: 'verified',
          verified_at: new Date()
        })
        .eq('id', userId);

      if (userError) throw userError;

      toast({
        title: '✅ Genehmigt',
        description: 'Verifizierung wurde erfolgreich genehmigt'
      });
      loadVerifications();

      // Notify user via Telegram (Backend/Edge Function would be better here)
      // For now relying on Realtime in AuthContext to update user UI

    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: 'Fehler',
        description: 'Genehmigung fehlgeschlagen',
        variant: 'destructive'
      });
    }
  };

  const openRejectDialog = (id) => {
    setRejectId(id);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!rejectId || !rejectReason.trim()) return;

    try {
      setIsRejecting(true);

      // 1. Get verification request to find userId
      const { data: request } = await db
        .from('verification_requests')
        .select('user_id')
        .eq('id', rejectId)
        .single();

      if (!request) throw new Error('Request not found');

      // 2. Update Verification Request
      const { error: reqError } = await db
        .from('verification_requests')
        .update({
          status: 'rejected',
          rejection_reason: rejectReason,
          reviewed_at: new Date(),
          reviewed_by: 'admin'
        })
        .eq('id', rejectId);

      if (reqError) throw reqError;

      // 3. Update User Status
      const { error: userError } = await db
        .from('users')
        .update({
          verification_status: 'rejected',
          rejection_reason: rejectReason
        })
        .eq('id', request.user_id);

      if (userError) throw userError;

      toast({
        title: '❌ Abgelehnt',
        description: 'Verifizierung wurde abgelehnt'
      });
      setRejectId(null);
      loadVerifications();

    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: 'Fehler',
        description: 'Ablehnung fehlgeschlagen',
        variant: 'destructive'
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="w-5 h-5" style={{ color: '#10B981' }} />;
      case 'rejected':
        return <XCircle className="w-5 h-5" style={{ color: '#EF4444' }} />;
      default:
        return <Clock className="w-5 h-5" style={{ color: '#D6B25E' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'rgba(16, 185, 129, 0.1)';
      case 'rejected':
        return 'rgba(239, 68, 68, 0.1)';
      default:
        return 'rgba(214, 178, 94, 0.1)';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case 'approved':
        return 'rgba(16, 185, 129, 0.3)';
      case 'rejected':
        return 'rgba(239, 68, 68, 0.3)';
      default:
        return 'rgba(214, 178, 94, 0.3)';
    }
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2" style={{ color: '#FFFFFF' }}>
                Verifizierungen
              </h1>
              <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Verwalte Benutzer-Verifizierungen
              </p>
            </div>
            <Button
              onClick={loadVerifications}
              className="h-12 px-6 rounded-xl"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF'
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Aktualisieren
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            {['pending', 'approved', 'rejected', 'all'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: filter === f ? 'rgba(214, 178, 94, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${filter === f ? 'rgba(214, 178, 94, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                  color: filter === f ? '#D6B25E' : 'rgba(255, 255, 255, 0.8)'
                }}
              >
                {f === 'pending' ? '⏳ Pending' :
                  f === 'approved' ? '✅ Approved' :
                    f === 'rejected' ? '❌ Rejected' : '📋 Alle'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Verifications List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{ background: 'rgba(255, 255, 255, 0.05)' }}
              >
                <div className="h-12 w-12 rounded-full mb-4" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                <div className="h-4 w-3/4 rounded mb-2" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
                <div className="h-4 w-1/2 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }} />
              </div>
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(214, 178, 94, 0.1)',
                border: '1px solid rgba(214, 178, 94, 0.2)'
              }}
            >
              <Sparkles className="w-10 h-10" style={{ color: '#D6B25E' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#FFFFFF' }}>
              Keine Verifizierungen
            </h3>
            <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {filter === 'pending'
                ? 'Keine ausstehenden Verifizierungen'
                : 'Keine Verifizierungen in dieser Kategorie'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {verifications.map((verification, index) => (
                <motion.div
                  key={verification.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl p-6 relative overflow-hidden"
                  style={{
                    background: getStatusColor(verification.status),
                    border: `1px solid ${getStatusBorderColor(verification.status)}`,
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {getStatusIcon(verification.status)}
                  </div>

                  {/* User Info */}
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <User className="w-6 h-6" style={{ color: '#D6B25E' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1" style={{ color: '#FFFFFF' }}>
                          {verification.user?.full_name || verification.user?.username || 'Unbekannt'}
                        </h3>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          @{verification.user?.username || verification.user?.telegram_id || 'N/A'}
                        </p>
                      </div>
                    </div>

                    {verification.user?.email && (
                      <div className="flex items-center gap-2 mb-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <Mail className="w-4 h-4" />
                        {verification.user.email}
                      </div>
                    )}

                    {verification.user?.phone && (
                      <div className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        <Phone className="w-4 h-4" />
                        {verification.user.phone}
                      </div>
                    )}
                  </div>

                  {/* Hand Gesture & Photo */}
                  <div className="mb-6 space-y-4">
                    <div className="p-4 rounded-xl"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Erwartetes Handzeichen:
                        </span>
                        <span className="text-3xl">{verification.hand_gesture}</span>
                      </div>
                    </div>

                    {verification.photo_url && (
                      <div className="p-4 rounded-xl"
                        style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <span className="text-xs font-semibold block mb-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Verifizierungsfoto:
                        </span>
                        {(() => {
                          const apiUrl = import.meta.env.VITE_API_URL || '/api';
                          const origin = apiUrl.startsWith('http')
                            ? apiUrl.replace(/\/api\/?$/, '')
                            : window.location.origin;

                          const photoSrc = verification.photo_url?.startsWith('http')
                            ? verification.photo_url
                            : `${origin}${verification.photo_url}`;

                          return (
                            <img
                              src={photoSrc}
                              alt="Verification Photo"
                              className="w-full rounded-lg mb-2"
                              style={{ maxHeight: '300px', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                          );
                        })()}
                        <p className="text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'none' }}>
                          Foto konnte nicht geladen werden
                        </p>
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                            👤 Bitte prüfe: Gesicht klar erkennbar? ✋ Handzeichen sichtbar?
                          </p>
                        </div>
                      </div>
                    )}

                    {!verification.photo_url && (
                      <div className="p-4 rounded-xl text-center"
                        style={{
                          background: 'rgba(214, 178, 94, 0.1)',
                          border: '1px solid rgba(214, 178, 94, 0.3)'
                        }}
                      >
                        <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                          ⏳ Foto noch nicht gesendet
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="mb-6 text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    Eingereicht: {new Date(verification.submitted_at).toLocaleString('de-DE')}
                  </div>

                  {/* Actions */}
                  {verification.status === 'pending' && (
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(verification.id, verification.user_id)}
                        className="flex-1 h-11 rounded-xl font-bold"
                        style={{
                          background: 'linear-gradient(135deg, #10B981, #059669)',
                          color: '#FFFFFF',
                          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => openRejectDialog(verification.id)}
                        variant="outline"
                        className="flex-1 h-11 rounded-xl font-bold"
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#EF4444'
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {verification.status === 'rejected' && verification.rejection_reason && (
                    <div className="mt-4 p-3 rounded-lg text-xs"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      <strong>Grund:</strong> {verification.rejection_reason}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Verifizierung ablehnen
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Bitte gib einen Grund an, warum diese Verifizierung abgelehnt wird. Der Nutzer wird per Telegram benachrichtigt.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Grund für die Ablehnung..."
              className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setRejectId(null)}
              className="text-zinc-400 hover:text-white"
            >
              Abbrechen
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || isRejecting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Ablehnen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
