import { Server } from 'socket.io';
import { verifyToken } from '../config/jwt.js';
import prisma from '../config/database.js';

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

        // --- Live Chat Logic ---

        // User joins (finds/creates session)
        socket.on('chat:join', async () => {
            try {
                // Find active session
                let session = await prisma.chatSession.findFirst({
                    where: {
                        user_id: socket.user.id,
                        status: 'active'
                    },
                    include: { messages: { orderBy: { created_at: 'asc' } } }
                });

                // Create new session if none exists
                if (!session) {
                    session = await prisma.chatSession.create({
                        data: { user_id: socket.user.id },
                        include: { messages: true } // Empty initially
                    });

                    // Fetch user details for admin notification
                    const userDetails = await prisma.user.findUnique({
                        where: { id: socket.user.id },
                        select: { full_name: true, email: true }
                    });

                    // Notify admins about new session
                    io.to('role_admin').emit('admin:new_session', { ...session, user: userDetails });
                }

                socket.join(`session_${session.id}`);
                socket.emit('chat:joined', session);
            } catch (error) {
                console.error('Chat Join Error:', error);
                socket.emit('error', { message: 'Could not join chat' });
            }
        });

        // Send Message
        socket.on('chat:message', async ({ content, sessionId }) => {
            try {
                if (!content || !sessionId) return;

                const sender = socket.user.role === 'admin' ? 'admin' : 'user';

                // Save to DB
                const message = await prisma.chatMessage.create({
                    data: {
                        session_id: sessionId,
                        sender: sender,
                        content: content
                    }
                });

                // Update Session timestamp
                await prisma.chatSession.update({
                    where: { id: sessionId },
                    data: { updated_at: new Date() }
                });

                // Emit to session room (Both parties)
                io.to(`session_${sessionId}`).emit('chat:message', message);

                // If user sent it, notify all admins (so they see unread badge/toast)
                if (sender === 'user') {
                    io.to('role_admin').emit('admin:message_received', { sessionId, message });
                }

            } catch (error) {
                console.error('Chat Message Error:', error);
            }
        });

        // Admin joins specific session
        socket.on('admin:join_session', (sessionId) => {
            if (socket.user.role === 'admin') {
                socket.join(`session_${sessionId}`);
                // Optional: Mark messages as read could go here or separate event
            }
        });

        // Typing Indicators
        socket.on('typing', ({ sessionId, isTyping }) => {
            socket.to(`session_${sessionId}`).emit('typing', {
                userId: socket.user.id,
                isTyping
            });
        });

        // -----------------------

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
