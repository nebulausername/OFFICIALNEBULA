import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { getToken, API_BASE_URL } from '../api/config';
import { useAuth } from '@/lib/AuthContext';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Determine Socket URL (remove /api suffix if present)
        const socketUrl = API_BASE_URL.replace(/\/api\/?$/, '');
        const token = getToken();

        // Only connect if user is logged in
        if (!token || !user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        console.log('🔌 Connecting to Socket.io:', socketUrl);

        const newSocket = io(socketUrl, {
            auth: { token },
            transports: ['websocket', 'polling'], // Prioritize websocket
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ Socket connected:', newSocket.id);
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('⚠️ Socket connection error:', err);
        });

        setSocket(newSocket);

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [user]); // Re-connect if user changes

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
