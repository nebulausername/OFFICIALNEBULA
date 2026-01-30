import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { useNebulaSound } from '@/contexts/SoundContext';
import { toast } from 'sonner';

export default function AdminRealtimeListener() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { playCash, playSuccess } = useNebulaSound();

    useEffect(() => {
        if (!socket || !user || user.role !== 'admin') return;

        const handleNewOrder = (order) => {
            console.log('💰 New Order Received:', order);
            playCash();
            toast.success('Neue Bestellung eingegangen! 💰', {
                description: `Bestellung #${order.id.slice(0, 8)} von ${order.contact_info?.name || 'Gast'} (${order.total_sum?.toFixed(2)}€)`,
                duration: 8000,
                action: {
                    label: 'Ansehen',
                    onClick: () => window.location.href = `/AdminRequests?highlight=${order.id}`
                }
            });
        };

        const handleNewChatMessage = ({ sessionId, message }) => {
            // Only notify if we are NOT on the chat page (simple check, or always notify)
            if (!window.location.pathname.includes('AdminLiveChat')) {
                playSuccess(); // Standard notification sound
                toast.success('Neue Nachricht im Support', {
                    description: `${message.content.substring(0, 30)}...`,
                    action: {
                        label: 'Antworten',
                        onClick: () => window.location.href = `/AdminLiveChat`
                    }
                });
            }
        };

        socket.on('new_order', handleNewOrder);
        socket.on('admin:message_received', handleNewChatMessage);

        return () => {
            socket.off('new_order', handleNewOrder);
            socket.off('admin:message_received', handleNewChatMessage);
        };
    }, [socket, user, playCash, playSuccess]);

    return null;
}
