import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { useNebulaSound } from '@/contexts/SoundContext';
import useSound from 'use-sound';

/**
 * Real-time Live Chat Widget
 * Connects to backend via Socket.io
 */
export default function LiveChatWidget() {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const { playSuccess } = useNebulaSound();

    // Sound Effects - using generic placeholders if files don't exist yet, 
    // but the logic is ready for them.
    const [playMessageReceive] = useSound('/sounds/message-receive.mp3', { volume: 0.5 });
    const [playMessageSend] = useSound('/sounds/message-send.mp3', { volume: 0.3 });
    const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.2 });

    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [session, setSession] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef(null);

    // Join Chat when opened
    useEffect(() => {
        if (!socket || !isConnected) return;

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
                playMessageReceive();
                if (!isOpen) {
                    setUnreadCount(prev => prev + 1);
                }
            } else {
                playMessageSend();
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
        setMessage(''); // Instant reset

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

    const toggleChat = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setUnreadCount(0);
            playPop();
        }
    };

    return (
        <>
            {/* Chat Button (FAB) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleChat}
                        className="fixed bottom-6 right-6 w-16 h-16 rounded-full flex items-center justify-center z-[100] group shadow-2xl shadow-purple-900/40"
                    >
                        {/* Pulse effect for unread messages */}
                        {unreadCount > 0 && (
                            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75" />
                        )}

                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6D28D9] to-[#EC4899] opacity-100 group-hover:opacity-90 transition-opacity" />

                        {/* Unread Badge */}
                        {unreadCount > 0 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full border-2 border-[#0A0C10] flex items-center justify-center z-10">
                                <span className="text-white text-xs font-bold">{unreadCount}</span>
                            </div>
                        )}

                        <MessageCircle className="w-8 h-8 text-white relative z-10" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[80vh] bg-[#0A0C10]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl flex flex-col z-[101] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#6D28D9] to-[#EC4899] p-5 flex justify-between items-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />

                            <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg leading-tight">Nebula Support</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                                        <div className="relative flex h-2 w-2">
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                        </div>
                                        {isConnected ? 'Verfügbar' : 'Verbinde...'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={toggleChat}
                                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors relative z-10"
                            >
                                <Minus className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {!user ? (
                            /* Guest View */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#6D28D9]/10 to-transparent pointer-events-none" />

                                <div className="w-20 h-20 bg-gradient-to-br from-[#6D28D9]/20 to-[#EC4899]/20 rounded-3xl flex items-center justify-center mb-6 border border-white/10 backdrop-blur-md">
                                    <MessageCircle className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Hilfe benötigt?</h3>
                                <p className="text-zinc-400 mb-8 mx-auto text-sm leading-relaxed">
                                    Melde dich an, um direkt mit unserem Experten-Team zu chatten und Support zu erhalten.
                                </p>
                                <Button
                                    onClick={handleLogin}
                                    className="w-full bg-white hover:bg-zinc-200 text-black font-bold h-12 rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Login für Support
                                </Button>
                            </div>
                        ) : (
                            /* Logged In View */
                            <>
                                {/* Messages Area */}
                                <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                                    {messages.length === 0 && (
                                        <div className="h-full flex flex-col items-center justify-center opacity-50">
                                            <MessageCircle className="w-12 h-12 mb-3 text-zinc-600" />
                                            <p className="text-zinc-500 text-sm">Schreib uns eine Nachricht...</p>
                                        </div>
                                    )}

                                    {messages.map((msg, idx) => {
                                        const isMe = msg.sender === 'user' || msg.sender === user.id;
                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] px-4 py-3 rounded-2xl shadow-sm ${isMe
                                                        ? 'bg-gradient-to-br from-[#6D28D9] to-[#EC4899] text-white rounded-tr-sm'
                                                        : 'bg-zinc-800/80 border border-zinc-700/50 text-white rounded-tl-sm'
                                                        }`}
                                                >
                                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                                    <p className={`text-[10px] mt-1 flex justify-end ${isMe ? 'text-white/70' : 'text-zinc-400'}`}>
                                                        {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : ''}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-zinc-800/80 border border-zinc-700/50 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150" />
                                                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-300" />
                                            </div>
                                        </motion.div>
                                    )}
                                    <div ref={scrollRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-[#0A0C10] border-t border-white/5">
                                    <div className="relative flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-2xl p-1 pr-1.5 focus-within:border-purple-500/50 transition-colors">
                                        <Input
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Nachricht schreiben..."
                                            className="flex-1 bg-transparent border-none text-white placeholder:text-zinc-500 h-11 focus-visible:ring-0 px-4"
                                            disabled={!isConnected}
                                        />
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!message.trim() || !isConnected}
                                            size="icon"
                                            className="h-9 w-9 bg-gradient-to-r from-[#6D28D9] to-[#EC4899] hover:opacity-90 transition-opacity rounded-xl shrink-0"
                                        >
                                            <Send className="w-4 h-4 text-white" />
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
