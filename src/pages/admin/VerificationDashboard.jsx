import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Shield, Clock, Search, Filter } from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const AdminVerificationDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.verification.getPendingRequests();
            setRequests(data.data || []);
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast({ title: 'Fehler', description: 'Konnte Anfragen nicht laden', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.verification.approveRequest(id);
            toast({ title: 'Erfolg', description: 'Benutzer erfolgreich verifiziert.' });
            setRequests(prev => prev.filter(req => req.id !== id));
            setSelectedRequest(null);
        } catch (error) {
            toast({ title: 'Fehler', description: 'Konnte Benutzer nicht verifizieren', variant: 'destructive' });
        }
    };

    const handleReject = async () => {
        if (!selectedRequest || !rejectionReason) return;
        try {
            await api.verification.rejectRequest(selectedRequest.id, rejectionReason);
            toast({ title: 'Erfolg', description: 'Anfrage abgelehnt.' });
            setRequests(prev => prev.filter(req => req.id !== selectedRequest.id));
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
        <div className="p-8 max-w-7xl mx-auto space-y-8 text-white min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">VERIFICATION APPLICANTS</h1>
                    <p className="text-zinc-500 font-mono text-sm">REVIEW INCOMING IDENTITY REQUESTS</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={fetchRequests} className="border-white/10 hover:bg-white/5">
                        Refresh List
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-zinc-500 animate-pulse">LOADING DATA STREAM...</div>
            ) : requests.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <Shield className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
                    <p className="text-zinc-500">NO PENDING REQUESTS</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <motion.div
                            key={request.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                            className="bg-[#0f1115] rounded-2xl overflow-hidden border border-white/5 hover:border-[#D6B25E]/30 transition-all group"
                        >
                            <div className="aspect-square relative bg-zinc-900">
                                <img
                                    src={request.photo_url || '/placeholder-user.jpg'}
                                    alt="Verification"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs font-mono border border-white/10">
                                    {new Date(request.submitted_at).toLocaleDateString()}
                                </div>
                                <div className="absolute bottom-4 left-4 bg-[#D6B25E] text-black px-3 py-1 rounded font-bold text-xs uppercase shadow-lg">
                                    Gesture: {request.hand_gesture}
                                </div>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-bold text-lg text-white truncate">{request.user?.email || 'Unknown User'}</h3>
                                    <p className="text-zinc-500 text-xs font-mono">ID: {request.user?.id?.slice(0, 8)}...</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button
                                        onClick={() => handleApprove(request.id)}
                                        className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20"
                                    >
                                        <Check className="w-4 h-4 mr-2" />
                                        APPROVE
                                    </Button>
                                    <Button
                                        onClick={() => openRejectDialog(request)}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        REJECT
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="bg-[#111] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle>Reject Application</DialogTitle>
                        <DialogDescription className="text-zinc-500">
                            Please provide a reason for rejecting this verification request.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Photo unclear, wrong gesture, face not visible..."
                        className="bg-black/50 border-white/10 text-white min-h-[100px]"
                    />
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject}>Confirm Rejection</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminVerificationDashboard;
