import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { useNebulaSound } from '@/contexts/SoundContext';
import { toast } from 'sonner';

export default function UserRealtimeListener() {
    const { socket } = useSocket();
    const { user } = useAuth();
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

        socket.on('order_status_update', handleStatusUpdate);

        return () => {
            socket.off('order_status_update', handleStatusUpdate);
        };
    }, [socket, user, playSuccess]);

    return null;
}
