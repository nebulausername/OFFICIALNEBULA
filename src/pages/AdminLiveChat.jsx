import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import {
    Send, MoreVertical, Search,
    Phone, Paperclip, MessageCircle,
    ArrowLeft, CheckCheck, User, Clock,
    Volume2, VolumeX
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useNebulaSound } from '@/contexts/SoundContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLiveChat() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const { playSuccess, playClick } = useNebulaSound();

    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Initial Load
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const res = await api.admin.getChatSessions();
            setSessions(Array.isArray(res) ? res : []);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to load sessions", error);
            setIsLoading(false);
        }
    };

    // Socket Listeners for Real-time Updates
    useEffect(() => {
        if (!socket) return;

        // When a new user starts a chat
        const handleNewSession = (session) => {
            setSessions(prev => {
                if (prev.find(s => s.id === session.id)) return prev;
                if (!isMuted) playSuccess();
                return [session, ...prev];
            });
        };

        // When a message is received (Global Listener for list update)
        const handleGlobalMessage = ({ sessionId, message }) => {
            setSessions(prev => {
                const sessionIndex = prev.findIndex(s => s.id === sessionId);
                if (sessionIndex === -1) return prev;

                const updatedSession = {
                    ...prev[sessionIndex],
                    updated_at: new Date().toISOString(),
                    messages: [message], // Update preview
                    _count: {
                        messages: (prev[sessionIndex]._count?.messages || 0) + 1
                    }
                };

                const newSessions = [...prev];
                newSessions.splice(sessionIndex, 1);
                // Move to top
                return [updatedSession, ...newSessions];
            });
        };

        // When a message is received in the ACTIVE session
        const handleActiveChatMessage = (message) => {
            if (message.session_id === selectedSessionId) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    if (message.sender === 'user' && !isMuted) playSuccess();
                    return [...prev, message];
                });
                scrollToBottom();
                setOtherUserTyping(false);
            }
        };

        const handleTyping = (data) => {
            if (data.sessionId === selectedSessionId && data.userId !== user.id) {
                setOtherUserTyping(data.isTyping);
                if (data.isTyping) scrollToBottom();
            }
        };

        socket.on('admin:new_session', handleNewSession);
        socket.on('admin:message_received', handleGlobalMessage);
        socket.on('chat:message', handleActiveChatMessage);
        socket.on('typing', handleTyping);

        return () => {
            socket.off('admin:new_session', handleNewSession);
            socket.off('admin:message_received', handleGlobalMessage);
            socket.off('chat:message', handleActiveChatMessage);
            socket.off('typing', handleTyping);
        };
    }, [socket, selectedSessionId, user, playSuccess, isMuted]);

    // Join Session Room when selected
    useEffect(() => {
        if (selectedSessionId && socket) {
            socket.emit('admin:join_session', selectedSessionId);
            loadMessages(selectedSessionId);

            // Mark as read locally in the list
            setSessions(prev => prev.map(s =>
                s.id === selectedSessionId
                    ? { ...s, _count: { messages: 0 } }
                    : s
            ));
        }
    }, [selectedSessionId, socket]);

    const loadMessages = async (id) => {
        try {
            const res = await api.admin.getChatHistory(id);
            setMessages(Array.isArray(res) ? res : []);
            scrollToBottom();
        } catch (e) { console.error(e); }
    };

    const handleSendMessage = () => {
        if (!inputText.trim() || !selectedSessionId) return;

        socket.emit('chat:message', {
            content: inputText,
            sessionId: selectedSessionId
        });

        setInputText('');
    };

    const handleInput = (e) => {
        setInputText(e.target.value);

        // Emit typing event
        if (!isTyping) {
            setIsTyping(true);
            socket?.emit('typing', { sessionId: selectedSessionId, isTyping: true });
        }

        // Debounce stop typing
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket?.emit('typing', { sessionId: selectedSessionId, isTyping: false });
        }, 2000);
    };

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    // Filter sessions
    const filteredSessions = sessions.filter(s =>
        s.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.includes(searchQuery)
    );

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0A0C10] text-white overflow-hidden relative">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-amber-900/5 pointer-events-none" />

            {/* Sidebar - Chat List */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-zinc-800 bg-[#09090b]/80 backdrop-blur-xl z-10`}
            >
                <div className="p-4 border-b border-zinc-800 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                            Inbox
                        </h2>
                        <div className="text-xs px-2.5 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-zinc-400 font-medium">
                            {sessions.length} Chats
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-500" />
                        <Input
                            placeholder="Suchen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-zinc-900/50 border-zinc-800 pl-9 focus:ring-purple-500/20"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-zinc-500 animate-pulse">Lade Chats...</div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 flex flex-col items-center pt-20">
                            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="w-8 h-8 opacity-20" />
                            </div>
                            <p className="font-medium">Keine Nachrichten</p>
                            <p className="text-xs mt-1 opacity-50">Deine Inbox ist leer.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {filteredSessions.map((session, i) => (
                                <motion.div
                                    key={session.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => {
                                        if (!isMuted) playClick();
                                        setSelectedSessionId(session.id);
                                    }}
                                    className={`p-4 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/30 transition-all ${selectedSessionId === session.id ? 'bg-purple-500/10 border-l-2 border-l-purple-500' : 'border-l-2 border-l-transparent'}`}
                                >
                                    <div className="flex justify-between mb-1.5">
                                        <span className={`font-bold text-sm ${selectedSessionId === session.id ? 'text-purple-400' : 'text-white'}`}>
                                            {session.user?.full_name || 'Gast User'}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded flex items-center gap-1">
                                            {session.messages?.[0]?.created_at && format(new Date(session.messages[0].created_at), 'HH:mm')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-zinc-400 truncate max-w-[180px] font-medium">
                                            {session.messages?.[0]?.content || 'Keine Nachrichten'}
                                        </p>
                                        {session._count?.messages > 0 && (
                                            <motion.span
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-[10px] font-bold shadow-lg shadow-purple-500/20"
                                            >
                                                {session._count.messages}
                                            </motion.span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <div className={`${!selectedSessionId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#0A0C10]/50 relative z-10`}>
                {selectedSessionId ? (
                    <>
                        {/* Chat Header */}
                        <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0A0C10]/80 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedSessionId(null)} className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-sm font-bold shadow-inner">
                                        <User className="w-5 h-5 text-zinc-400" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0A0C10] rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight text-white">{selectedSession?.user?.full_name || 'Gast User'}</h3>
                                    <div className="flex items-center gap-2 text-xs text-green-400 font-medium">
                                        Online
                                        {/* You can add real online status here if you track sockets */}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-zinc-400">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="hover:bg-zinc-800 hover:text-white rounded-xl"
                                    title={isMuted ? "Sound aktivieren" : "Sound stummschalten"}
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </Button>
                                <Button size="icon" variant="ghost" className="hover:bg-zinc-800 hover:text-white rounded-xl"><Phone className="w-5 h-5" /></Button>
                                <Button size="icon" variant="ghost" className="hover:bg-zinc-800 hover:text-white rounded-xl"><MoreVertical className="w-5 h-5" /></Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === 'admin';
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[70%] group relative`}>
                                            <div className={`px-5 py-3.5 rounded-2xl shadow-sm backdrop-blur-sm ${isMe
                                                ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm shadow-purple-500/10'
                                                : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-100 rounded-tl-sm'
                                                }`}>
                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                            </div>
                                            <div className={`text-[10px] mt-1.5 flex items-center gap-1.5 ${isMe ? 'justify-end opacity-70' : 'opacity-40 ml-1'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                {isMe && <CheckCheck className="w-3 h-3 text-purple-300" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {/* Typing Indicator */}
                            <AnimatePresence>
                                {otherUserTyping && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex justify-start"
                                    >
                                        <div className="bg-zinc-800/50 border border-zinc-700/30 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-150" />
                                            <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-300" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-800 bg-[#0A0C10]/95 backdrop-blur-xl">
                            <div className="flex items-center gap-3 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 focus-within:border-purple-500/30 transition-colors shadow-lg">
                                <Button size="icon" variant="ghost" className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl">
                                    <Paperclip className="w-5 h-5" />
                                </Button>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2 placeholder:text-zinc-600 font-medium"
                                    placeholder="Schreibe eine Nachricht..."
                                    value={inputText}
                                    onChange={handleInput}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim()}
                                    className={`w-10 h-10 rounded-xl transition-all p-0 ${inputText.trim()
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:scale-105 active:scale-95'
                                        : 'bg-zinc-800 text-zinc-600'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 relative overflow-hidden">
                        <div className="w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] absolute pointer-events-none" />

                        <div className="relative z-10 text-center">
                            <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative border border-zinc-800 shadow-2xl skew-y-3 transform rotate-3">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent rounded-[2rem]" />
                                <MessageCircle className="w-10 h-10 text-zinc-400" />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center border-4 border-[#0A0C10] shadow-lg">
                                    <Clock className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3 tracking-tight">Nebula Commander</h3>
                            <p className="max-w-[300px] mx-auto text-sm leading-relaxed text-zinc-400">
                                Wähle eine Konversation aus der linken Leiste, um den <span className="text-purple-400 font-bold">Premium Support</span> zu starten.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
