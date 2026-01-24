import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';

let io = null;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
                : ['http://localhost:3000', 'http://localhost:5173'],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    // Authentication Middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = verifyToken(token);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 Client connected: ${socket.user.id}`);

        // Join user-specific room
        socket.join(`user_${socket.user.id}`);

        // Join role-specific room (e.g. 'role_admin')
        if (socket.user.role) {
            socket.join(`role_${socket.user.role}`);
            console.log(`🛡️  Joined role room: role_${socket.user.role}`);
        }

        socket.on('disconnect', () => {
            console.log(`❌ Client disconnected: ${socket.user.id}`);
        });
    });

    console.log('✅ Socket.io initialized');
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

export const notifyUser = (userId, event, data) => {
    if (!io) return;
    io.to(`user_${userId}`).emit(event, data);
    console.log(`📡 Emitted '${event}' to user_${userId}`);
};
