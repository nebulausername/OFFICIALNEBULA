import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { useNebulaSound } from '@/contexts/SoundContext';
import { toast } from 'sonner';

export default function UserRealtimeListener() {
    const { socket } = useSocket();
    const { user, checkAppState } = useAuth();
    const { playSuccess } = useNebulaSound();

    useEffect(() => {
        if (!socket || !user) return;

        const handleStatusUpdate = (data) => {
            // data: { status, orderId, message }
            console.log('📦 Order Status Update:', data);

            playSuccess();

            const statusLabels = {
                shipped: 'Versendet 🚚',
                completed: 'Abgeschlossen ✅',
                processing: 'In Bearbeitung ⚙️',
                cancelled: 'Storniert ❌'
            };

            toast(statusLabels[data.status] || 'Status Update', {
                description: `Deine Bestellung #${data.orderId.slice(0, 8)} wurde aktualisiert.`,
                duration: 5000,
            });
        };

        const handleVerificationUpdate = async (data) => {
            console.log('🔐 Verification Update:', data);

            if (data.status === 'verified') {
                playSuccess();
                toast.success(data.title || 'Verifiziert! ✅', {
                    description: data.message || 'Du hast nun vollen Zugriff auf den Shop.',
                    duration: 5000,
                });
                // Refresh auth state to unlock protected routes immediately
                await checkAppState();
            } else if (data.status === 'rejected') {
                toast.error(data.title || 'Verifizierung abgelehnt ❌', {
                    description: data.message || 'Bitte prüfe die Gründe und versuche es erneut.',
                    duration: 6000,
                });
                // Relax check to update status to 'rejected' in context
                await checkAppState();
            }
        };

        socket.on('order_status_update', handleStatusUpdate);
        socket.on('verification:updated', handleVerificationUpdate);

        return () => {
            socket.off('order_status_update', handleStatusUpdate);
            socket.off('verification:updated', handleVerificationUpdate);
        };
    }, [socket, user, playSuccess, checkAppState]);

    return null;
}
