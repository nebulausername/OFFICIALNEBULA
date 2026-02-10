import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, LogOut, Home, Key } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { createPageUrl } from '@/utils';

export default function AccessDenied({ user }) {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-[#0A0C10] text-white flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-10 bg-red-600" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-10 bg-orange-600" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 relative z-10 shadow-2xl shadow-red-900/20"
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-black mb-2 text-white">Access Denied</h1>
                    <p className="text-white/60 mb-8">
                        You do not have the required permissions to access the Nebula Command Center.
                    </p>

                    <div className="w-full bg-black/40 rounded-xl p-4 mb-8 border border-white/5 text-left">
                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Current Session</div>

                        <div className="space-y-3 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-white/40">User ID</span>
                                <span className="text-white select-all">{user?.id || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Role</span>
                                <span className={`px-2 py-0.5 rounded textxs uppercase ${user?.role === 'admin' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {user?.role || 'Guest'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-white/40">Status</span>
                                <span className="text-white capitalize">{user?.verification_status || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            onClick={() => logout(true)}
                            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out & Switch Account
                        </button>

                        <a
                            href={createPageUrl('Home')}
                            className="w-full py-3 px-4 bg-[#D6B25E] hover:bg-[#B59142] text-black rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                            <Home className="w-4 h-4" />
                            Return to Nebula
                        </a>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 w-full">
                        <p className="text-xs text-white/30">
                            Error Code: 403_FORBIDDEN_ADMIN_ONLY
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
