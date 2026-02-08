import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Monitor, Smartphone, Tablet, LogOut, RefreshCw,
    Shield, Clock, MapPin, Calendar, AlertTriangle,
    CheckCircle2, Loader2, Trash2, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { api } from '@/api';
import { toast } from 'sonner';

const SessionsManager = ({ className }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [revoking, setRevoking] = useState(null); // Session ID being revoked
    const [revokingAll, setRevokingAll] = useState(false);

    const deviceIcons = {
        browser: Globe,
        telegram: Smartphone,
        mobile: Tablet,
        default: Monitor,
    };

    const deviceLabels = {
        browser: 'Web Browser',
        telegram: 'Telegram',
        mobile: 'Mobile App',
    };

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/sessions');
            setSessions(response.data.sessions || []);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
            toast.error('Fehler beim Laden der Sessions');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (sessionId) => {
        try {
            setRevoking(sessionId);
            await api.delete(`/auth/sessions/${sessionId}`);
            setSessions(sessions.filter(s => s.id !== sessionId));
            toast.success('Session beendet');
        } catch (error) {
            console.error('Failed to revoke session:', error);
            toast.error('Fehler beim Beenden der Session');
        } finally {
            setRevoking(null);
        }
    };

    const handleRevokeAll = async () => {
        try {
            setRevokingAll(true);
            await api.delete('/auth/sessions');
            await fetchSessions(); // Refresh to get current session
            toast.success('Alle anderen Sessions beendet');
        } catch (error) {
            console.error('Failed to revoke all sessions:', error);
            toast.error('Fehler beim Beenden der Sessions');
        } finally {
            setRevokingAll(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isRecentlyActive = (lastUsed) => {
        const diff = Date.now() - new Date(lastUsed).getTime();
        return diff < 5 * 60 * 1000; // 5 minutes
    };

    return (
        <Card className={`bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-gray-900/80 border-gray-700/50 backdrop-blur-sm ${className}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="w-5 h-5 text-purple-400" />
                            Aktive Sessions
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Verwalte deine angemeldeten Geräte
                        </CardDescription>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchSessions}
                            disabled={loading}
                            className="text-gray-400 hover:text-white"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>

                        {sessions.length > 1 && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-400 border-red-500/30 hover:bg-red-500/10"
                                        disabled={revokingAll}
                                    >
                                        {revokingAll ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <LogOut className="w-4 h-4 mr-1" />
                                                Alle beenden
                                            </>
                                        )}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-gray-900 border-gray-700">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            Alle Sessions beenden?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Du wirst auf allen anderen Geräten abgemeldet. Nur diese aktuelle Session bleibt bestehen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-gray-800 border-gray-700">Abbrechen</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleRevokeAll}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Alle beenden
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Monitor className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Keine aktiven Sessions</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {sessions.map((session, index) => {
                            const DeviceIcon = deviceIcons[session.device_type] || deviceIcons.default;
                            const isActive = isRecentlyActive(session.last_used_at);
                            const isCurrentlyRevoking = revoking === session.id;

                            return (
                                <motion.div
                                    key={session.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                                    transition={{ duration: 0.2, delay: index * 0.05 }}
                                    className={`
                    relative flex items-center justify-between p-4 rounded-xl
                    bg-gradient-to-r from-gray-800/50 to-gray-800/30
                    border border-gray-700/50
                    hover:border-purple-500/30 transition-all duration-200
                    ${index === 0 ? 'ring-1 ring-purple-500/30' : ''}
                  `}
                                >
                                    {/* Current session indicator */}
                                    {index === 0 && (
                                        <div className="absolute -top-2 left-4">
                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                                Diese Session
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        {/* Device icon with status */}
                                        <div className="relative">
                                            <div className={`
                        p-3 rounded-xl
                        ${session.device_type === 'telegram'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-purple-500/20 text-purple-400'}
                      `}>
                                                <DeviceIcon className="w-5 h-5" />
                                            </div>
                                            {isActive && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-gray-800"
                                                />
                                            )}
                                        </div>

                                        {/* Session info */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-white">
                                                    {deviceLabels[session.device_type] || session.device_type}
                                                </span>
                                                {isActive && (
                                                    <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                                        Aktiv
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(session.last_used_at)}
                                                </span>
                                                {session.ip_address && (
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        {session.ip_address}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Revoke button (not for current session) */}
                                    {index !== 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRevoke(session.id)}
                                            disabled={isCurrentlyRevoking}
                                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                                        >
                                            {isCurrentlyRevoking ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </Button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}

                {/* Security tip */}
                {sessions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-start gap-2 mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300"
                    >
                        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                            Beende unbekannte Sessions sofort. Nutze /code im Telegram Bot für sichere Browser-Logins.
                        </span>
                    </motion.div>
                )}
            </CardContent>
        </Card>
    );
};

export default SessionsManager;
