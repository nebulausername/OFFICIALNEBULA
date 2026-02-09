import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Bot,
    Send,
    Info,
    ShieldCheck,
    Radio,
    Copy
} from 'lucide-react';
import { api } from '@/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminTelegramSettings() {
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [testUserId, setTestUserId] = useState('');
    const [sendingTest, setSendingTest] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const data = await api.admin.getTelegramConfig();
            setConfig(data);
        } catch (error) {
            console.error('Failed to load telegram config:', error);
            toast({
                title: "Fehler",
                description: "Konnte Telegram Konfiguration nicht laden.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSendTest = async () => {
        if (!testUserId) {
            toast({
                title: "Fehler",
                description: "Bitte User ID eingeben.",
                variant: "destructive"
            });
            return;
        }

        setSendingTest(true);
        try {
            await api.admin.sendTestNotification({ userId: testUserId });
            toast({
                title: "Erfolg",
                description: "Test-Nachricht wurde gesendet (async).",
            });
        } catch (error) {
            console.error('Failed to send test:', error);
            toast({
                title: "Fehler",
                description: error.response?.data?.error || "Konnte Nachricht nicht senden.",
                variant: "destructive"
            });
        } finally {
            setSendingTest(false);
        }
    };

    const copyWebhook = () => {
        if (config?.webhookUrl) {
            navigator.clipboard.writeText(config.webhookUrl);
            toast({ description: "Webhook URL kopiert" });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
                <div className="w-16 h-16 border-4 border-transparent border-t-[#D6B25E] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight mb-2">Telegram Konfiguration</h1>
                        <p className="text-white/50">Verwalte den Bot und Benachrichtigungen.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className={`w-3 h-3 rounded-full ${config?.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="font-mono text-sm uppercase font-bold">
                            {config?.status === 'online' ? 'BOT ONLINE' : 'BOT OFFLINE'}
                        </span>
                    </div>
                </div>

                {/* Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid gap-6 md:grid-cols-2"
                >
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-[#D6B25E]" />
                                Bot Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/60">Bot Name</span>
                                <span className="font-mono text-[#D6B25E]">@{config?.botName || 'Nicht konfiguriert'}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                <span className="text-white/60">Bot ID</span>
                                <span className="font-mono">{config?.botId || '-'}</span>
                            </div>
                            <div className="py-2">
                                <span className="text-white/60 block mb-2">Webhook URL</span>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={config?.webhookUrl || 'Nicht gesetzt (Polling mode?)'}
                                        className="bg-black/50 border-white/10 font-mono text-xs"
                                    />
                                    <Button size="icon" variant="outline" onClick={copyWebhook} className="border-white/10 hover:bg-white/5">
                                        <Copy className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-purple-400" />
                                Admin Einstellungen
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/60">Admin Chat ID</label>
                                <div className="flex gap-2">
                                    <Input
                                        readOnly
                                        value={config?.adminChatId || ''}
                                        placeholder="Nicht konfiguriert (ENV)"
                                        className="bg-black/50 border-white/10"
                                    />
                                    <div className="text-xs text-white/30 flex items-center">
                                        <Info className="w-4 h-4 mr-1" />
                                        Setze ADMIN_CHAT_ID in .env
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="block font-medium">Wartungsmodus</span>
                                    <span className="text-xs text-white/50">Bot antwortet nur Admins</span>
                                </div>
                                <Switch disabled checked={false} />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Test Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="bg-zinc-900 border-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Radio className="w-5 h-5 text-blue-400" />
                                Test-Center
                            </CardTitle>
                            <CardDescription className="text-white/40">
                                Sende Test-Nachrichten um die Integration zu prüfen.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1 w-full space-y-2">
                                    <label className="text-sm font-medium text-white/60">User ID oder Telegram ID</label>
                                    <Input
                                        value={testUserId}
                                        onChange={(e) => setTestUserId(e.target.value)}
                                        placeholder="z.B. user_123 oder 987654321"
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                                <Button
                                    onClick={handleSendTest}
                                    disabled={sendingTest}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white w-full md:w-auto"
                                >
                                    {sendingTest ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Test Senden
                                        </>
                                    )}
                                </Button>
                            </div>

                            <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-200 flex items-start gap-3">
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <p>
                                    Stelle sicher, dass der User den Bot bereits gestartet hat (/start), sonst kann keine Nachricht gesendet werden.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
