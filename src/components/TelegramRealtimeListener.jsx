import { useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

/**
 * 📡 TelegramRealtimeListener
 * Listens for global events like "verification_approved"
 * and triggers UI effects (confetti, sound, reload).
 */
export default function TelegramRealtimeListener() {
    const { socket } = useSocket();
    const { checkAppState } = useAuth();
    const audioRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        // Handler for verification approval
        const handleVerificationApproved = async (data) => {
            console.log('🎉 Verification Approved Event Received!', data);

            // 1. Play Success Sound
            try {
                const audio = new Audio('/sounds/success.mp3'); // Ensure this file exists or use a robust fallback
                audio.volume = 0.5;
                audio.play().catch(e => console.warn('Audio play failed:', e));
            } catch (e) {
                console.warn('Sound play failed', e);
            }

            // 2. Confetti Explosion
            const duration = 3000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            // 3. Show Toast
            toast.success('Verifizierung erfolgreich! 🎉', {
                description: 'Du hast jetzt vollen Zugriff auf den Shop.',
                duration: 5000,
            });

            // 4. Update Auth State immediately
            // Wait a moment for DB propagation if needed, then refresh
            setTimeout(() => {
                if (checkAppState) checkAppState();
                // Force reload as a fallback to ensure all guards are lifted
                setTimeout(() => window.location.reload(), 1500);
            }, 500);
        };

        socket.on('verification_approved', handleVerificationApproved);

        return () => {
            socket.off('verification_approved', handleVerificationApproved);
        };
    }, [socket, checkAppState]);

    return null; // Invisible component
}
