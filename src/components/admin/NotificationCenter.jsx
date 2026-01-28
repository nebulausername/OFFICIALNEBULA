import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Check, AlertTriangle, Package, ShoppingBag,
    TrendingUp, MessageCircle, Star, Clock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * NotificationCenter - Admin notification bell with dropdown
 */
export default function NotificationCenter({
    notifications = [],
    onClear,
    onMarkRead,
    onNotificationClick
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order': return <ShoppingBag className="w-4 h-4" />;
            case 'product': return <Package className="w-4 h-4" />;
            case 'alert': return <AlertTriangle className="w-4 h-4" />;
            case 'message': return <MessageCircle className="w-4 h-4" />;
            case 'vip': return <Star className="w-4 h-4" />;
            case 'revenue': return <TrendingUp className="w-4 h-4" />;
            default: return <Bell className="w-4 h-4" />;
        }
    };

    const getNotificationColor = (type, priority) => {
        if (priority === 'high') return 'text-red-400 bg-red-500/10';
        switch (type) {
            case 'order': return 'text-emerald-400 bg-emerald-500/10';
            case 'product': return 'text-blue-400 bg-blue-500/10';
            case 'alert': return 'text-amber-400 bg-amber-500/10';
            case 'message': return 'text-purple-400 bg-purple-500/10';
            case 'vip': return 'text-amber-400 bg-amber-500/10';
            case 'revenue': return 'text-emerald-400 bg-emerald-500/10';
            default: return 'text-zinc-400 bg-zinc-500/10';
        }
    };

    const formatTime = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) return 'Gerade eben';
        if (minutes < 60) return `Vor ${minutes} Min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Vor ${hours} Std`;
        return `Vor ${Math.floor(hours / 24)} Tagen`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`} />

                {/* Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center shadow-lg shadow-red-500/30"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] rounded-2xl bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 shadow-2xl overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                            <div className="flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-400" />
                                <span className="font-bold text-white">Benachrichtigungen</span>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                                        {unreadCount} neu
                                    </span>
                                )}
                            </div>
                            {notifications.length > 0 && (
                                <button
                                    onClick={() => onClear?.()}
                                    className="text-xs text-zinc-500 hover:text-amber-400 transition-colors"
                                >
                                    Alle löschen
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                                        <Bell className="w-6 h-6 text-zinc-600" />
                                    </div>
                                    <p className="text-sm text-zinc-500">Keine Benachrichtigungen</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-zinc-800/50">
                                    {notifications.map((notification, i) => (
                                        <motion.button
                                            key={notification.id || i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            onClick={() => {
                                                onNotificationClick?.(notification);
                                                if (!notification.read) onMarkRead?.(notification.id);
                                            }}
                                            className={`w-full p-4 text-left hover:bg-white/5 transition-colors flex gap-3 ${!notification.read ? 'bg-amber-500/5' : ''}`}
                                        >
                                            {/* Icon */}
                                            <div className={`p-2 rounded-lg ${getNotificationColor(notification.type, notification.priority)}`}>
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm font-bold truncate ${notification.read ? 'text-zinc-400' : 'text-white'}`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-zinc-500 truncate mt-0.5">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="w-3 h-3 text-zinc-600" />
                                                    <span className="text-[10px] text-zinc-600">
                                                        {formatTime(notification.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 self-center" />
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="p-3 border-t border-zinc-800">
                                <Button
                                    onClick={() => onMarkRead?.('all')}
                                    variant="ghost"
                                    className="w-full h-10 text-sm font-bold text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    <Check className="w-4 h-4 mr-2" />
                                    Alle als gelesen markieren
                                </Button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Generate demo notifications for testing
 */
export function generateDemoNotifications() {
    return [
        {
            id: '1',
            type: 'order',
            priority: 'normal',
            title: 'Neue Bestellung #7721',
            message: 'Max Mustermann hat eine Bestellung über 149,90€ aufgegeben',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            read: false
        },
        {
            id: '2',
            type: 'alert',
            priority: 'high',
            title: 'Niedriger Lagerbestand',
            message: 'Elfbar 600 Watermelon hat nur noch 5 Stück auf Lager',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            read: false
        },
        {
            id: '3',
            type: 'vip',
            priority: 'normal',
            title: 'Neues VIP Mitglied',
            message: 'Anna Schmidt ist dem VIP Club beigetreten',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: true
        },
        {
            id: '4',
            type: 'message',
            priority: 'normal',
            title: 'Support Ticket #45',
            message: 'Kunde hat eine Frage zu Lieferzeiten',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: true
        },
        {
            id: '5',
            type: 'revenue',
            priority: 'normal',
            title: 'Tagesumsatz erreicht',
            message: 'Herzlichen Glückwunsch! 1.000€ Tagesumsatz erreicht 🎉',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            read: true
        }
    ];
}
