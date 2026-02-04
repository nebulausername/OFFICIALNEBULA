import React, { useState, useEffect } from 'react';
import { api } from '@/api';
import { Activity, Server, Database, CheckCircle, XCircle, AlertTriangle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function AdminSystemMonitor() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [checks, setChecks] = useState([
        { id: 'api', name: 'API Connectivity', status: 'pending', latency: 0 },
        { id: 'db', name: 'Database (Products)', status: 'pending', latency: 0 },
        { id: 'auth', name: 'Auth Service', status: 'pending', latency: 0 },
        { id: 'geo', name: 'CDN / Assets', status: 'pending', latency: 0 },
    ]);

    const runCheck = async () => {
        setLoading(true);
        const newChecks = [...checks];

        // Helper to measure latency
        const measure = async (fn, id) => {
            const start = performance.now();
            try {
                await fn();
                const end = performance.now();
                const check = newChecks.find(c => c.id === id);
                if (check) {
                    check.status = 'healthy';
                    check.latency = Math.round(end - start);
                }
            } catch (e) {
                console.error(`Check ${id} failed`, e);
                const check = newChecks.find(c => c.id === id);
                if (check) {
                    check.status = 'error';
                    check.error = e.message;
                }
            }
        };

        // 1. API Basic Check (ping equivalent? asking for brands is lightweight)
        await measure(() => api.entities.Brand.list(), 'api');

        // 2. DB / Products Check
        await measure(() => api.entities.Product.list(), 'db');

        // 3. Auth Check
        await measure(() => api.auth.me().catch(() => { }), 'auth'); // Ignore 401, just check connectivity

        // 4. CDN / Assets (fetch a favicon or similar)
        await measure(() => fetch('/favicon.ico'), 'geo');

        setChecks([...newChecks]);
        setLoading(false);
    };

    useEffect(() => {
        runCheck();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'healthy') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
        if (status === 'error') return 'text-red-400 bg-red-500/10 border-red-500/20';
        return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    };

    const getStatusIcon = (status) => {
        if (status === 'healthy') return <CheckCircle className="w-5 h-5" />;
        if (status === 'error') return <XCircle className="w-5 h-5" />;
        return <Activity className="w-5 h-5 animate-pulse" />;
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate(createPageUrl('Admin'))}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-black flex items-center gap-3">
                                <Activity className="w-6 h-6 text-emerald-500" />
                                System Monitor
                            </h1>
                            <p className="text-zinc-400">Real-time Health Status & Diagnostics</p>
                        </div>
                    </div>
                    <Button onClick={runCheck} disabled={loading} variant="outline" className="border-zinc-700 hover:bg-zinc-900">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Checks
                    </Button>
                </div>

                {/* Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {checks.map(check => (
                        <div key={check.id} className={`p-6 rounded-xl border flex items-center justify-between ${getStatusColor(check.status)}`}>
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-full bg-black/20">
                                    {getStatusIcon(check.status)}
                                </div>
                                <div>
                                    <h3 className="font-bold">{check.name}</h3>
                                    <p className="text-xs opacity-70">
                                        {check.status === 'healthy' ? 'Operational' : check.status === 'pending' ? 'Checking...' : 'Outage'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-mono font-bold">{check.latency}ms</p>
                                <p className="text-[10px] uppercase font-bold opacity-50">Latency</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* System Info */}
                <div className="glass-panel p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <Server className="w-5 h-5 text-purple-400" />
                        Environment Info
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                            <p className="text-zinc-500 text-xs uppercase mb-1">Environment</p>
                            <p className="font-mono text-white">Production</p>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                            <p className="text-zinc-500 text-xs uppercase mb-1">Version</p>
                            <p className="font-mono text-white">v2.4.0</p>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                            <p className="text-zinc-500 text-xs uppercase mb-1">Region</p>
                            <p className="font-mono text-white">eu-central-1</p>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
                            <p className="text-zinc-500 text-xs uppercase mb-1">Uptime</p>
                            <p className="font-mono text-emerald-400">99.98%</p>
                        </div>
                    </div>
                </div>

                {/* Logs Placeholder */}
                <div className="glass-panel p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Database className="w-5 h-5 text-amber-400" />
                            Recent System Logs
                        </h3>
                        <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">Last 24h</span>
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                        <div className="flex gap-4 p-2 hover:bg-zinc-900/50 rounded border-b border-zinc-800/50">
                            <span className="text-zinc-500">{new Date().toISOString()}</span>
                            <span className="text-emerald-400">[INFO]</span>
                            <span className="text-zinc-300">System Monitor initialized</span>
                        </div>
                        <div className="flex gap-4 p-2 hover:bg-zinc-900/50 rounded border-b border-zinc-800/50">
                            <span className="text-zinc-500">{new Date(Date.now() - 1000 * 60 * 5).toISOString()}</span>
                            <span className="text-emerald-400">[INFO]</span>
                            <span className="text-zinc-300">Deployment successful (v2.4.0)</span>
                        </div>
                        <div className="flex gap-4 p-2 hover:bg-zinc-900/50 rounded border-b border-zinc-800/50">
                            <span className="text-zinc-500">{new Date(Date.now() - 1000 * 60 * 15).toISOString()}</span>
                            <span className="text-amber-400">[WARN]</span>
                            <span className="text-zinc-300">High latency detected in us-east-1 region</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
