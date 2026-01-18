import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, RefreshCw, Sparkles, User, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function AdminVerifications() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const { toast } = useToast();

  useEffect(() => {
    loadVerifications();
  }, [filter]);

  const loadVerifications = async () => {
    try {
      setLoading(true);
      let data = [];

      if (filter === 'pending') {
        const response = await api.get('/verification/pending');
        data = response.data || [];
      } else {
        // For now, only load pending. In production, add endpoints for approved/rejected
        const response = await api.get('/verification/pending');
        data = response.data || [];
      }

      setVerifications(data);
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
      await api.post(`/verification/approve/${verificationId}`);
      toast({
        title: '✅ Genehmigt',
        description: 'Verifizierung wurde erfolgreich genehmigt'
      });
      loadVerifications();
    } catch (error) {
      console.error('Error approving verification:', error);
      toast({
        title: 'Fehler',
        description: 'Genehmigung fehlgeschlagen',
        variant: 'destructive'
      });
    }
  };

  const handleReject = async (verificationId, userId) => {
    const reason = prompt('Ablehnungsgrund eingeben:');
    if (!reason) return;

    try {
      await api.post(`/verification/reject/${verificationId}`, { reason });
      toast({
        title: '❌ Abgelehnt',
        description: 'Verifizierung wurde abgelehnt'
      });
      loadVerifications();
    } catch (error) {
      console.error('Error rejecting verification:', error);
      toast({
        title: 'Fehler',
        description: 'Ablehnung fehlgeschlagen',
        variant: 'destructive'
      });
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
            {verifications.map((verification, index) => (
              <motion.div
                key={verification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
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
                      onClick={() => handleReject(verification.id, verification.user_id)}
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
          </div>
        )}
      </div>
    </div>
  );
}
