import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';

/**
 * Live Chat Widget - Floating button with chat window
 * Appears in bottom-right corner
 */
export default function LiveChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: 'Hallo! 👋 Wie kann ich dir heute helfen?',
            timestamp: new Date()
        }
    ]);

    const quickReplies = [
        '📦 Wo ist meine Bestellung?',
        '💳 Zahlungsmethoden?',
        '🚚 Versandkosten?',
        '💬 Support kontaktieren'
    ];

    const handleSendMessage = () => {
        if (!message.trim()) return;

        // Add user message
        const userMsg = {
            id: Date.now(),
            type: 'user',
            text: message,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setMessage('');

        // Simulate bot response
        setTimeout(() => {
            const botMsg = {
                id: Date.now() + 1,
                type: 'bot',
                text: 'Vielen Dank für deine Nachricht! Unser Team wird sich so schnell wie möglich bei dir melden. 🚀',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        }, 1000);
    };

    const handleQuickReply = (reply) => {
        setMessage(reply);
    };

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
                                    <h3 className="font-black text-white text-lg">Nebula Support</h3>
                                    <div className="flex items-center gap-2 text-white/80 text-xs">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                        Online
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

                        {/* Messages */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-950">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] px-4 py-3 rounded-2xl ${msg.type === 'user'
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'bg-zinc-800 text-white'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                        <p className="text-xs opacity-60 mt-1">
                                            {msg.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Quick Replies */}
                        {messages.length <= 2 && (
                            <div className="p-4 bg-zinc-900 border-t border-zinc-800">
                                <p className="text-xs text-zinc-500 mb-2">Schnellantworten:</p>
                                <div className="flex flex-wrap gap-2">
                                    {quickReplies.map((reply, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleQuickReply(reply)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                                        >
                                            {reply}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-zinc-900 border-t-2 border-zinc-800">
                            <div className="flex gap-2">
                                <Input
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Nachricht schreiben..."
                                    className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                                <Button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
