
import React, { useState, useEffect } from 'react';
import { useAuth, ACCESS_LEVELS } from '@/lib/AuthContext';
import { api } from '@/api';
import { getToken } from '@/api/config';

export default function DebugAuth() {
    const { user, isAuthenticated, isLoadingAuth, authError, accessLevel, checkAppState } = useAuth();
    const [token, setToken] = useState('');
    const [apiResponse, setApiResponse] = useState(null);

    useEffect(() => {
        setToken(getToken() || 'No token found');
    }, []);

    const handleManualCheck = async () => {
        try {
            const res = await api.auth.me();
            setApiResponse({ success: true, data: res });
        } catch (e) {
            setApiResponse({ success: false, error: e.message, status: e.status });
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8 font-mono overflow-auto">
            <h1 className="text-2xl font-bold mb-4 text-[#D6B25E]">Auth Debugger</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div className="p-4 border border-zinc-800 rounded bg-zinc-900/50">
                        <h2 className="text-xl font-bold mb-2">Auth Context State</h2>
                        <pre className="text-xs text-green-400 overflow-auto max-h-60">
                            {JSON.stringify({
                                isAuthenticated,
                                isLoadingAuth,
                                authError,
                                accessLevel,
                                user
                            }, null, 2)}
                        </pre>
                    </div>

                    <div className="p-4 border border-zinc-800 rounded bg-zinc-900/50">
                        <h2 className="text-xl font-bold mb-2">Local Token</h2>
                        <div className="break-all text-xs text-zinc-400">{token}</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="p-4 border border-zinc-800 rounded bg-zinc-900/50">
                        <h2 className="text-xl font-bold mb-2">Actions</h2>
                        <div className="flex flex-col gap-2">
                            <button onClick={() => checkAppState()} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">
                                Reload Auth Context
                            </button>
                            <button onClick={handleManualCheck} className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded">
                                Test API Call (api.auth.me)
                            </button>
                            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="bg-red-600 hover:bg-red-500 px-4 py-2 rounded">
                                Clear Storage & Reload
                            </button>
                        </div>
                    </div>

                    {apiResponse && (
                        <div className="p-4 border border-zinc-800 rounded bg-zinc-900/50">
                            <h2 className="text-xl font-bold mb-2">API Test Result</h2>
                            <pre className={`text-xs overflow-auto max-h-60 ${apiResponse.success ? 'text-green-400' : 'text-red-400'}`}>
                                {JSON.stringify(apiResponse, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 p-4 border border-yellow-500/30 bg-yellow-900/10 rounded">
                <h3 className="font-bold text-yellow-500">How to interpret:</h3>
                <ul className="list-disc ml-5 text-sm space-y-1 text-zinc-300">
                    <li><strong>isAuthenticated</strong>: Should be true.</li>
                    <li><strong>user.role</strong>: MUST be 'admin'.</li>
                    <li><strong>user.verification_status</strong>: MUST be 'verified'.</li>
                    <li><strong>accessLevel</strong>: MUST be 'verified' (or matches logic).</li>
                </ul>
            </div>
        </div>
    );
}
