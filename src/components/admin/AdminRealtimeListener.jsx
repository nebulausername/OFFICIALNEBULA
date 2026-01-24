import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { useNebulaSound } from '@/contexts/SoundContext';
import { toast } from 'sonner';

export default function AdminRealtimeListener() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { playCash } = useNebulaSound();

    useEffect(() => {
        if (!socket || !user || user.role !== 'admin') return;

        const handleNewOrder = (order) => {
            console.log('💰 New Order Received:', order);

            // Play Cha-Ching Sound
            playCash();

            // Show Toast
            toast.success('Neue Bestellung eingegangen! 💰', {
                description: `Bestellung #${order.id.slice(0, 8)} von ${order.contact_info?.name || 'Gast'} (${order.total_sum?.toFixed(2)}€)`,
                duration: 8000,
                action: {
                    label: 'Ansehen',
                    onClick: () => window.location.href = `/AdminRequests?highlight=${order.id}`
                }
            });
        };

        socket.on('new_order', handleNewOrder);

        return () => {
            socket.off('new_order', handleNewOrder);
        };
    }, [socket, user, playCash]);

    return null;
}
