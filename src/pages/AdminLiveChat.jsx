import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/api';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/lib/AuthContext';
import {
    Send, MoreVertical,
    Phone, Paperclip, MessageCircle,
    ArrowLeft, CheckCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminLiveChat() {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef(null);

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
                // Avoid duplicates
                if (prev.find(s => s.id === session.id)) return prev;
                return [session, ...prev];
            });
            // Optional: Play notification sound here
        };

        // When a message is received (Global Listener for list update)
        const handleGlobalMessage = ({ sessionId, message }) => {
            setSessions(prev => {
                const sessionIndex = prev.findIndex(s => s.id === sessionId);
                if (sessionIndex === -1) {
                    // New session that we didn't have? Reload or ignore?
                    // Ideally handleNewSession should have fired.
                    return prev;
                }

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
                return [updatedSession, ...newSessions];
            });
        };

        // When a message is received in the ACTIVE session
        const handleActiveChatMessage = (message) => {
            if (message.session_id === selectedSessionId) {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();
            }
        };

        socket.on('admin:new_session', handleNewSession);
        socket.on('admin:message_received', handleGlobalMessage);
        socket.on('chat:message', handleActiveChatMessage);

        return () => {
            socket.off('admin:new_session', handleNewSession);
            socket.off('admin:message_received', handleGlobalMessage);
            socket.off('chat:message', handleActiveChatMessage);
        };
    }, [socket, selectedSessionId]);

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

    const scrollToBottom = () => {
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const selectedSession = sessions.find(s => s.id === selectedSessionId);

    return (
        <div className="flex h-[calc(100vh-64px)] bg-[#0A0C10] text-white overflow-hidden">
            {/* Sidebar - Chat List */}
            <div className={`${selectedSessionId ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 flex-col border-r border-zinc-800 bg-[#09090b]`}>
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <MessageCircle className="text-purple-500" />
                        Inbox
                    </h2>
                    <div className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-400">
                        {sessions.length} Chats
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 text-center text-zinc-500">Lade Chats...</div>
                    ) : sessions.length === 0 ? (
                        <div className="p-8 text-center text-zinc-500 flex flex-col items-center">
                            <MessageCircle className="w-12 h-12 mb-2 opacity-20" />
                            <p>Keine aktiven Chats</p>
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => setSelectedSessionId(session.id)}
                                className={`p-4 border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/30 transition-colors ${selectedSessionId === session.id ? 'bg-zinc-800/50 border-l-2 border-l-purple-500' : ''}`}
                            >
                                <div className="flex justify-between mb-1">
                                    <span className="font-bold text-sm text-white">
                                        {session.user?.full_name || 'Gast User'}
                                    </span>
                                    <span className="text-xs text-zinc-500">
                                        {session.messages?.[0]?.created_at && format(new Date(session.messages[0].created_at), 'HH:mm')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-zinc-400 truncate max-w-[180px]">
                                        {session.messages?.[0]?.content || 'Keine Nachrichten'}
                                    </p>
                                    {session._count?.messages > 0 && (
                                        <span className="flex items-center justify-center w-5 h-5 bg-purple-600 rounded-full text-[10px] font-bold">
                                            {session._count.messages}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={`${!selectedSessionId ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-[#0A0C10] relative`}>
                {selectedSessionId ? (
                    <>
                        {/* Header */}
                        <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#0A0C10]/80 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedSessionId(null)} className="md:hidden p-2 -ml-2 text-zinc-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-sm font-bold">
                                    {selectedSession?.user?.full_name?.substring(0, 2).toUpperCase() || 'GU'}
                                </div>
                                <div>
                                    <h3 className="font-bold">{selectedSession?.user?.full_name || 'Gast User'}</h3>
                                    <div className="flex items-center gap-2 text-xs text-green-500">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                        Online
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <button className="p-2 hover:bg-zinc-800 rounded-lg"><Phone className="w-5 h-5" /></button>
                                <button className="p-2 hover:bg-zinc-800 rounded-lg"><MoreVertical className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((msg, idx) => {
                                const isMe = msg.sender === 'admin';
                                return (
                                    <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : 'bg-zinc-800 text-zinc-100 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm">{msg.content}</p>
                                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${isMe ? 'opacity-70 justify-end' : 'opacity-50'}`}>
                                                {format(new Date(msg.created_at), 'HH:mm')}
                                                {isMe && <CheckCheck className="w-3 h-3" />}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-zinc-800 bg-[#0A0C10]">
                            <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded-xl border border-zinc-800">
                                <button className="p-2 text-zinc-400 hover:text-white"><Paperclip className="w-5 h-5" /></button>
                                <input
                                    type="text"
                                    className="flex-1 bg-transparent border-none outline-none text-white text-sm px-2"
                                    placeholder="Schreibe eine Nachricht..."
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className={`p-2 rounded-lg transition-colors ${inputText.trim()
                                            ? 'bg-purple-600 text-white hover:bg-purple-500'
                                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4 relative">
                            <MessageCircle className="w-10 h-10 text-zinc-600" />
                            <span className="absolute top-0 right-0 w-4 h-4 bg-purple-500 rounded-full animate-bounce"></span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Nebula Live Chat</h3>
                        <p className="max-w-md text-center text-sm">
                            Wähle einen Chat aus der Liste links aus, um den Support zu starten.
                            Du erhältst hier alle Nachrichten in Echtzeit.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
