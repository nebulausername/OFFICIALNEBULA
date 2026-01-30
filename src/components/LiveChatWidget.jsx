import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { useNebulaSound } from '@/contexts/SoundContext';

/**
 * Real-time Live Chat Widget
 * Connects to backend via Socket.io
 */
export default function LiveChatWidget() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { playSuccess } = useNebulaSound();

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [session, setSession] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Join Chat when opened
    useEffect(() => {
        if (!isOpen || !socket || !isConnected) return;

        console.log('💬 Joining Chat...');
        socket.emit('chat:join');

        const handleJoined = (existingSession) => {
            console.log('✅ Joined Chat Session:', existingSession);
            setSession(existingSession);
            if (existingSession.messages) {
                setMessages(existingSession.messages);
            }
            scrollToBottom();
        };

        const handleMessage = (msg) => {
            setMessages(prev => {
                // Deduplicate
                if (prev.find(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
            scrollToBottom();

            // Play sound if message is from admin
            if (msg.sender === 'admin') {
                playSuccess();
            }
        };

        const handleTyping = (data) => {
            setIsTyping(data.isTyping);
            if (data.isTyping) {
                scrollToBottom();
            }
        };

        socket.on('chat:joined', handleJoined);
        socket.on('chat:message', handleMessage);
        socket.on('typing', handleTyping);

        return () => {
            socket.off('chat:joined', handleJoined);
            socket.off('chat:message', handleMessage);
            socket.off('typing', handleTyping);
        };
    }, [isOpen, socket, isConnected]);

    const handleSendMessage = () => {
        if (!message.trim() || !socket || !session) return;

        const content = message;
        setMessage(''); // Creating feeling of instant send

        socket.emit('chat:message', {
            content,
            sessionId: session.id
        });
    };

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleLogin = () => {
        window.location.href = '/login';
    };

    // if (!user) return null; // REMOVED: Show widget for everyone

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl shadow-purple-500/50 flex items-center justify-center z-[100] group"
                    >
                        <MessageCircle className="w-8 h-8 text-white" />
                        <motion.span
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-48px)] h-[600px] max-h-[calc(100vh-100px)] bg-zinc-900 border-2 border-zinc-800 rounded-2xl shadow-2xl flex flex-col z-[101] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-black text-white text-lg">Live Support</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                                        {isConnected ? 'Online' : 'Verbinde...'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {!user ? (
                            /* Guest View */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-zinc-950">
                                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6 border border-zinc-800">
                                    <MessageCircle className="w-10 h-10 text-purple-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Hilfe benötigt?</h3>
                                <p className="text-zinc-400 mb-8 mx-auto max-w-[200px]">
                                    Melde dich an, um direkt mit unserem Support-Team zu chatten.
                                </p>
                                <Button
                                    onClick={handleLogin}
                                    className="w-full bg-white text-black hover:bg-zinc-200 font-bold h-12 rounded-xl"
                                >
                                    Jetzt Anmelden
                                </Button>
                            </div>
                        ) : (
                            /* Logged In View */
                            <>
                                {/* Messages */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950">
                                    {messages.length === 0 && (
                                        <div className="text-center text-zinc-500 mt-10">
                                            <p>Sag Hallo! 👋</p>
                                            <p className="text-xs">Unser Team meldet sich sofort.</p>
                                        </div>
                                    )}

                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender === 'user' || msg.sender === user.id;
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-3 rounded-2xl ${isMe
                                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none'
                                                        : 'bg-zinc-800 text-white rounded-tl-none'
                                                        }`}
                                                >
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className="text-[10px] opacity-60 mt-1 flex justify-end">
                                                        {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : '...'}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-zinc-800 px-4 py-2 rounded-2xl rounded-tl-none flex gap-1 items-center">
                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75" />
                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input */}
                                <div className="p-4 bg-zinc-900 border-t-2 border-zinc-800">
                                    <div className="flex gap-2">
                                        <Input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Nachricht..."
                                            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                            disabled={!isConnected}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim() || !isConnected}
                                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
